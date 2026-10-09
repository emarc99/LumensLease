#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, BytesN,
    Env, String,
};

#[cfg(test)]
mod test;

// Storage TTL thresholds (~5 seconds per ledger on Stellar)
const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days
const SECONDS_PER_DAY: u64 = 86_400;
const TIMEOUT_GRACE_PERIOD_DAYS: u64 = 7;

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
    TimeoutNotReached = 8,
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
    DamageProposed = 6,
    Cancelled = 7,
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
    pub proposed_damage_amount: i128,
    pub damage_evidence_hash: BytesN<32>,
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

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("init")),
            (admin, token),
        );

        Ok(())
    }

    /// Register a new digital lease agreement with terms and SHA-256 property audit digest
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

        let empty_hash = BytesN::from_array(&env, &[0u8; 32]);

        let lease = LeaseAgreement {
            lease_id: counter,
            tenant: tenant.clone(),
            landlord: landlord.clone(),
            rent_amount,
            caution_deposit,
            lease_duration_days,
            property_hash: property_hash.clone(),
            status: EscrowStatus::Created,
            funded_at: 0,
            rent_disbursed: false,
            deposit_released: false,
            proposed_damage_amount: 0,
            damage_evidence_hash: empty_hash,
        };

        env.storage().persistent().set(&DataKey::Lease(counter), &lease);
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(counter),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.storage().instance().set(&DataKey::LeaseCounter, &counter);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("created")),
            (counter, tenant, landlord, rent_amount, caution_deposit),
        );

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
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("funded")),
            (lease_id, caller, total_required),
        );

        Ok(())
    }

    /// Disburse periodic rent to landlord after initial occupancy / move-in inspection
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
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("disbursed")),
            (lease_id, lease.landlord, lease.rent_amount),
        );

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
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("released")),
            (lease_id, lease.tenant, lease.caution_deposit),
        );

        Ok(())
    }

    /// Landlord proposes a partial damage deduction with photographic visual hash proof
    pub fn propose_damage_deduction(
        env: Env,
        lease_id: u64,
        caller: Address,
        deduction_amount: i128,
        evidence_hash: BytesN<32>,
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

        if caller != lease.landlord {
            return Err(Error::Unauthorized);
        }

        if deduction_amount <= 0 || deduction_amount > lease.caution_deposit {
            return Err(Error::InvalidAmount);
        }

        lease.proposed_damage_amount = deduction_amount;
        lease.damage_evidence_hash = evidence_hash.clone();
        lease.status = EscrowStatus::DamageProposed;

        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("dmg_prop")),
            (lease_id, deduction_amount, evidence_hash),
        );

        Ok(())
    }

    /// Tenant accepts the landlord's damage deduction; landlord gets damage funds, tenant gets balance
    pub fn accept_damage_deduction(env: Env, lease_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::DamageProposed {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant {
            return Err(Error::Unauthorized);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);

        let damage = lease.proposed_damage_amount;
        let tenant_refund = lease.caution_deposit - damage;

        if damage > 0 {
            token_client.transfer(&env.current_contract_address(), &lease.landlord, &damage);
        }
        if tenant_refund > 0 {
            token_client.transfer(&env.current_contract_address(), &lease.tenant, &tenant_refund);
        }

        lease.deposit_released = true;
        lease.status = EscrowStatus::Completed;

        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("dmg_acc")),
            (lease_id, damage, tenant_refund),
        );

        Ok(())
    }

    /// Tenant rejects damage claim; escalates to Disputed status for community/admin arbitration
    pub fn reject_damage_deduction(env: Env, lease_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::DamageProposed {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant {
            return Err(Error::Unauthorized);
        }

        lease.status = EscrowStatus::Disputed;
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("dmg_rej")),
            lease_id,
        );

        Ok(())
    }

    /// If lease duration + 7 days grace expires without dispute or refund, tenant claims caution refund directly
    pub fn claim_deposit_timeout(env: Env, lease_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Active {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant {
            return Err(Error::Unauthorized);
        }

        let required_time = lease.funded_at
            + (lease.lease_duration_days * SECONDS_PER_DAY)
            + (TIMEOUT_GRACE_PERIOD_DAYS * SECONDS_PER_DAY);

        if env.ledger().timestamp() < required_time {
            return Err(Error::TimeoutNotReached);
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
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("timeout")),
            (lease_id, lease.tenant, lease.caution_deposit),
        );

        Ok(())
    }

    /// Cancel an unfunded lease
    pub fn cancel_unfunded_lease(env: Env, lease_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Created {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant && caller != lease.landlord {
            return Err(Error::Unauthorized);
        }

        lease.status = EscrowStatus::Cancelled;
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("cancel")),
            (lease_id, caller),
        );

        Ok(())
    }

    /// Raise a formal dispute if property damage is alleged upon tenancy conclusion
    pub fn raise_dispute(
        env: Env,
        lease_id: u64,
        caller: Address,
        reason: String,
    ) -> Result<(), Error> {
        caller.require_auth();

        let mut lease: LeaseAgreement = env
            .storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)?;

        if lease.status != EscrowStatus::Active && lease.status != EscrowStatus::DamageProposed {
            return Err(Error::InvalidState);
        }

        if caller != lease.tenant && caller != lease.landlord {
            return Err(Error::Unauthorized);
        }

        lease.status = EscrowStatus::Disputed;
        env.storage().persistent().set(&DataKey::Lease(lease_id), &lease);
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("disputed")),
            (lease_id, caller, reason),
        );

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
        env.storage().persistent().extend_ttl(
            &DataKey::Lease(lease_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("lease"), symbol_short!("resolved")),
            (lease_id, tenant_refund, landlord_payout),
        );

        Ok(())
    }

    /// Read lease agreement state by ID
    pub fn get_lease(env: Env, lease_id: u64) -> Result<LeaseAgreement, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .ok_or(Error::LeaseNotFound)
    }

    /// Read total number of leases created
    pub fn get_lease_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::LeaseCounter)
            .unwrap_or(0)
    }

    /// Read protocol admin address
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }

    /// Read protocol settlement token address
    pub fn get_payment_token(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(Error::NotInitialized)
    }

    /// Cryptographically verify if a candidate SHA-256 matches the registered move-in audit hash
    pub fn verify_property_hash(
        env: Env,
        lease_id: u64,
        check_hash: BytesN<32>,
    ) -> Result<bool, Error> {
        let lease = Self::get_lease(env, lease_id)?;
        Ok(lease.property_hash == check_hash)
    }
}
