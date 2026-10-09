#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum GuarantorError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    BondNotFound = 4,
    GuarantorNotFound = 5,
    InvalidAmount = 6,
    InvalidState = 7,
    ExceedsMaxBacking = 8,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum BondStatus {
    Staked = 0,
    Active = 1,
    ClaimedDefault = 2,
    Released = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GuarantorProfile {
    pub guarantor: Address,
    pub max_backing_amount: i128,
    pub active_bonded_amount: i128,
    pub total_backed_leases: u32,
    pub successful_releases: u32,
    pub defaulted_count: u32,
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GuarantorBond {
    pub bond_id: u64,
    pub lease_id: u64,
    pub guarantor: Address,
    pub tenant: Address,
    pub landlord: Address,
    pub bond_amount: i128,
    pub status: BondStatus,
    pub staked_at: u64,
    pub settled_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PaymentToken,
    Guarantor(Address),
    Bond(u64),
    LeaseBond(u64), // Map lease_id to bond_id
    BondCounter,
    TotalGuarantors,
}

#[contract]
pub struct RentalGuarantorVaultContract;

#[contractimpl]
impl RentalGuarantorVaultContract {
    /// Initialize the Rental Guarantor protocol with admin and settlement token (USDC/XLM)
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), GuarantorError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(GuarantorError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PaymentToken, &token);
        env.storage().instance().set(&DataKey::BondCounter, &0u64);
        env.storage().instance().set(&DataKey::TotalGuarantors, &0u32);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("guar"), symbol_short!("init")),
            (admin, token),
        );

        Ok(())
    }

    /// Register a sovereign or corporate guarantor with maximum backing capacity
    pub fn register_guarantor(
        env: Env,
        guarantor: Address,
        max_backing_amount: i128,
    ) -> Result<(), GuarantorError> {
        guarantor.require_auth();

        if max_backing_amount <= 0 {
            return Err(GuarantorError::InvalidAmount);
        }

        if env.storage().persistent().has(&DataKey::Guarantor(guarantor.clone())) {
            return Ok(());
        }

        let profile = GuarantorProfile {
            guarantor: guarantor.clone(),
            max_backing_amount,
            active_bonded_amount: 0,
            total_backed_leases: 0,
            successful_releases: 0,
            defaulted_count: 0,
            registered_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Guarantor(guarantor.clone()), &profile);
        env.storage().persistent().extend_ttl(
            &DataKey::Guarantor(guarantor.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        let mut total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalGuarantors)
            .unwrap_or(0);
        total += 1;
        env.storage().instance().set(&DataKey::TotalGuarantors, &total);

        env.events().publish(
            (symbol_short!("guar"), symbol_short!("reg")),
            (guarantor, max_backing_amount),
        );

        Ok(())
    }

    /// Guarantor stakes surety bond backing a tenant's lease ID
    pub fn stake_bond(
        env: Env,
        guarantor: Address,
        lease_id: u64,
        tenant: Address,
        landlord: Address,
        bond_amount: i128,
    ) -> Result<u64, GuarantorError> {
        guarantor.require_auth();

        if bond_amount <= 0 {
            return Err(GuarantorError::InvalidAmount);
        }

        let mut profile: GuarantorProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Guarantor(guarantor.clone()))
            .ok_or(GuarantorError::GuarantorNotFound)?;

        if profile.active_bonded_amount + bond_amount > profile.max_backing_amount {
            return Err(GuarantorError::ExceedsMaxBacking);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(GuarantorError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&guarantor, &env.current_contract_address(), &bond_amount);

        profile.active_bonded_amount += bond_amount;
        profile.total_backed_leases += 1;
        env.storage().persistent().set(&DataKey::Guarantor(guarantor.clone()), &profile);

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::BondCounter)
            .unwrap_or(0);
        counter += 1;

        let bond = GuarantorBond {
            bond_id: counter,
            lease_id,
            guarantor: guarantor.clone(),
            tenant: tenant.clone(),
            landlord: landlord.clone(),
            bond_amount,
            status: BondStatus::Active,
            staked_at: env.ledger().timestamp(),
            settled_at: 0,
        };

        env.storage().persistent().set(&DataKey::Bond(counter), &bond);
        env.storage().persistent().set(&DataKey::LeaseBond(lease_id), &counter);
        env.storage().instance().set(&DataKey::BondCounter, &counter);

        env.events().publish(
            (symbol_short!("bond"), symbol_short!("staked")),
            (counter, lease_id, guarantor, bond_amount),
        );

        Ok(counter)
    }

    /// Landlord claims the surety bond if tenant defaults on rental obligations
    pub fn claim_defaulted_bond(
        env: Env,
        bond_id: u64,
        landlord: Address,
    ) -> Result<(), GuarantorError> {
        landlord.require_auth();

        let mut bond: GuarantorBond = env
            .storage()
            .persistent()
            .get(&DataKey::Bond(bond_id))
            .ok_or(GuarantorError::BondNotFound)?;

        if bond.status != BondStatus::Active {
            return Err(GuarantorError::InvalidState);
        }

        if landlord != bond.landlord {
            return Err(GuarantorError::Unauthorized);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(GuarantorError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &bond.landlord, &bond.bond_amount);

        bond.status = BondStatus::ClaimedDefault;
        bond.settled_at = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Bond(bond_id), &bond);

        let mut profile: GuarantorProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Guarantor(bond.guarantor.clone()))
            .ok_or(GuarantorError::GuarantorNotFound)?;

        profile.active_bonded_amount -= bond.bond_amount;
        profile.defaulted_count += 1;
        env.storage().persistent().set(&DataKey::Guarantor(bond.guarantor.clone()), &profile);

        env.events().publish(
            (symbol_short!("bond"), symbol_short!("claimed")),
            (bond_id, bond.landlord, bond.bond_amount),
        );

        Ok(())
    }

    /// Return surety bond to guarantor upon successful lease completion
    pub fn release_bond(
        env: Env,
        bond_id: u64,
        caller: Address,
    ) -> Result<(), GuarantorError> {
        caller.require_auth();

        let mut bond: GuarantorBond = env
            .storage()
            .persistent()
            .get(&DataKey::Bond(bond_id))
            .ok_or(GuarantorError::BondNotFound)?;

        if bond.status != BondStatus::Active {
            return Err(GuarantorError::InvalidState);
        }

        if caller != bond.landlord && caller != bond.guarantor {
            return Err(GuarantorError::Unauthorized);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(GuarantorError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &bond.guarantor, &bond.bond_amount);

        bond.status = BondStatus::Released;
        bond.settled_at = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Bond(bond_id), &bond);

        let mut profile: GuarantorProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Guarantor(bond.guarantor.clone()))
            .ok_or(GuarantorError::GuarantorNotFound)?;

        profile.active_bonded_amount -= bond.bond_amount;
        profile.successful_releases += 1;
        env.storage().persistent().set(&DataKey::Guarantor(bond.guarantor.clone()), &profile);

        env.events().publish(
            (symbol_short!("bond"), symbol_short!("released")),
            (bond_id, bond.guarantor, bond.bond_amount),
        );

        Ok(())
    }

    /// Read bond details by bond ID
    pub fn get_bond(env: Env, bond_id: u64) -> Result<GuarantorBond, GuarantorError> {
        env.storage()
            .persistent()
            .get(&DataKey::Bond(bond_id))
            .ok_or(GuarantorError::BondNotFound)
    }

    /// Read bond ID by lease ID
    pub fn get_bond_by_lease(env: Env, lease_id: u64) -> Option<u64> {
        env.storage().persistent().get(&DataKey::LeaseBond(lease_id))
    }

    /// Read guarantor profile
    pub fn get_guarantor(env: Env, guarantor: Address) -> Result<GuarantorProfile, GuarantorError> {
        env.storage()
            .persistent()
            .get(&DataKey::Guarantor(guarantor))
            .ok_or(GuarantorError::GuarantorNotFound)
    }

    /// Read total bonds staked count
    pub fn get_bond_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::BondCounter)
            .unwrap_or(0)
    }
}
