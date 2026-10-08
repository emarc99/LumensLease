#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, BytesN, Env, String,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    LeaseNotFound = 4,
    InvalidAmount = 5,
    InvalidState = 6,
    DisputeAlreadyRaised = 7,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowStatus {
    Created = 0,
    Funded = 1,
    Active = 2,
    Completed = 3,
    Disputed = 4,
    Refunded = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LeaseAgreement {
    pub lease_id: u64,
    pub tenant: Address,
    pub landlord: Address,
    pub rent_amount: i128,
    pub caution_deposit: i128,
    pub lease_duration_days: u64,
    pub property_hash: BytesN<32>,
    pub status: EscrowStatus,
    pub funded_at: u64,
    pub rent_disbursed: bool,
    pub deposit_released: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PaymentToken,
    LeaseCounter,
    Lease(u64),
}

#[contract]
pub struct RentalEscrowContract;

#[contractimpl]
impl RentalEscrowContract {
    /// Initialize the rental escrow protocol with an admin and settlement token (USDC / XLM)
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PaymentToken, &token);
        env.storage().instance().set(&DataKey::LeaseCounter, &0u64);
        Ok(())
    }

    /// Register a new digital lease agreement with terms and property digest
    pub fn create_lease(
        env: Env,
        tenant: Address,
        landlord: Address,
        rent_amount: i128,
        caution_deposit: i128,
        lease_duration_days: u64,
        property_hash: BytesN<32>,
    ) -> Result<u64, Error> {
        if rent_amount <= 0 || caution_deposit < 0 {
            return Err(Error::InvalidAmount);
        }

        tenant.require_auth();

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LeaseCounter)
            .unwrap_or(0);
        counter += 1;

        let lease = LeaseAgreement {
            lease_id: counter,
            tenant,
            landlord,
            rent_amount,
            caution_deposit,
            lease_duration_days,
            property_hash,
            status: EscrowStatus::Created,
            funded_at: 0,
            rent_disbursed: false,
            deposit_released: false,
        };

        env.storage().persistent().set(&DataKey::Lease(counter), &lease);
        env.storage().instance().set(&DataKey::LeaseCounter, &counter);

        Ok(counter)
    }

    /// Tenant deposits both rent and caution deposit into smart contract escrow
    pub fn fund_lease(env: Env, lease_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Created {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant {
            return Err(Error::Unauthorized);
        }

        let total_required = lease.rent_amount + lease.caution_deposit;
        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&lease.tenant, &env.current_contract_address(), &total_required);

        lease.status = EscrowStatus::Funded;
        lease.funded_at = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);

        Ok(())
    }

    /// Disburse periodic rent to landlord after initial occupancy verification
    pub fn disburse_rent(env: Env, lease_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Funded && lease.status != EscrowStatus::Active {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant && caller != lease.landlord {
            return Err(Error::Unauthorized);
        }

        if lease.rent_disbursed {
            return Err(Error::InvalidState);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &lease.landlord, &lease.rent_amount);

        lease.rent_disbursed = true;
        lease.status = EscrowStatus::Active;
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);

        Ok(())
    }

    /// Landlord signs off on peaceful vacancy; caution deposit automatically refunds to tenant
    pub fn release_deposit(env: Env, lease_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Active {
            return Err(Error::InvalidState);
        }

        if caller != lease.landlord {
            return Err(Error::Unauthorized);
        }

        if lease.deposit_released {
            return Err(Error::InvalidState);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &lease.tenant, &lease.caution_deposit);

        lease.deposit_released = true;
        lease.status = EscrowStatus::Completed;
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);

        Ok(())
    }

    /// Raise a formal dispute if property damage is alleged upon tenancy conclusion
    pub fn raise_dispute(
        env: Env,
        lease_id: u64,
        caller: Address,
        _reason: String,
    ) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Active {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant && caller != lease.landlord {
            return Err(Error::Unauthorized);
        }

        lease.status = EscrowStatus::Disputed;
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);

        Ok(())
    }

    /// Multi-sig / Admin arbitration resolving a disputed caution deposit
    pub fn resolve_dispute(
        env: Env,
        lease_id: u64,
        admin: Address,
        tenant_refund: i128,
        landlord_payout: i128,
    ) -> Result<(), Error> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        if admin != stored_admin {
            return Err(Error::Unauthorized);
        }

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Disputed {
            return Err(Error::InvalidState);
        }

        if tenant_refund + landlord_payout != lease.caution_deposit {
            return Err(Error::InvalidAmount);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);

        if tenant_refund > 0 {
            token_client.transfer(&env.current_contract_address(), &lease.tenant, &tenant_refund);
        }

        if landlord_payout > 0 {
            token_client.transfer(&env.current_contract_address(), &lease.landlord, &landlord_payout);
        }

        lease.deposit_released = true;
        lease.status = EscrowStatus::Completed;
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);

        Ok(())
    }

    /// Read lease agreement state by ID
    pub fn get_lease(env: Env, lease_id: u64) -> Result<LeaseAgreement, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)
    }
}
