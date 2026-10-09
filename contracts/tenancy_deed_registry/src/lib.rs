#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    String, Vec,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days in ledgers
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days in ledgers

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum DeedError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    DeedNotFound = 4,
    InvalidDates = 5,
    AlreadySigned = 6,
    DeedNotExecuted = 7,
    DeedExpired = 8,
    InvalidAmount = 9,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DeedStatus {
    Draft = 0,
    LandlordSigned = 1,
    TenantSigned = 2,
    FullyExecuted = 3,
    Terminated = 4,
    Expired = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DeedInput {
    pub landlord: Address,
    pub tenant: Address,
    pub property_title: String,
    pub property_address: String,
    pub annual_rent_stroops: i128,
    pub caution_deposit_stroops: i128,
    pub start_timestamp: u64,
    pub end_timestamp: u64,
    pub legal_terms_hash: BytesN<32>,
    pub hardware_specs_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TenancyDeed {
    pub deed_id: u64,
    pub landlord: Address,
    pub tenant: Address,
    pub property_title: String,
    pub property_address: String,
    pub annual_rent_stroops: i128,
    pub caution_deposit_stroops: i128,
    pub start_timestamp: u64,
    pub end_timestamp: u64,
    pub legal_terms_hash: BytesN<32>,
    pub hardware_specs_hash: BytesN<32>,
    pub landlord_signed: bool,
    pub tenant_signed: bool,
    pub status: DeedStatus,
    pub created_at: u64,
    pub executed_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Deed(u64),
    TenantActiveDeed(Address),
    Amendments(u64),
    TotalDeeds,
}

#[contract]
pub struct TenancyDeedRegistry;

#[contractimpl]
impl TenancyDeedRegistry {
    /// Initialize the decentralized Tenancy Deed Registry protocol
    pub fn initialize(env: Env, admin: Address) -> Result<(), DeedError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DeedError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalDeeds, &0u64);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("deed"), symbol_short!("init")),
            admin,
        );

        Ok(())
    }

    /// Register a new statutory tenancy deed bound to legal and hardware audit digests
    pub fn create_deed(
        env: Env,
        caller: Address,
        params: DeedInput,
    ) -> Result<u64, DeedError> {
        caller.require_auth();

        if caller != params.landlord && caller != params.tenant {
            return Err(DeedError::Unauthorized);
        }

        if params.end_timestamp <= params.start_timestamp {
            return Err(DeedError::InvalidDates);
        }

        if params.annual_rent_stroops <= 0 || params.caution_deposit_stroops < 0 {
            return Err(DeedError::InvalidAmount);
        }

        let mut total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeeds)
            .unwrap_or(0);
        total += 1;

        let is_landlord_creator = caller == params.landlord;
        let is_tenant_creator = caller == params.tenant;

        let initial_status = if is_landlord_creator {
            DeedStatus::LandlordSigned
        } else {
            DeedStatus::TenantSigned
        };

        let deed = TenancyDeed {
            deed_id: total,
            landlord: params.landlord.clone(),
            tenant: params.tenant.clone(),
            property_title: params.property_title,
            property_address: params.property_address,
            annual_rent_stroops: params.annual_rent_stroops,
            caution_deposit_stroops: params.caution_deposit_stroops,
            start_timestamp: params.start_timestamp,
            end_timestamp: params.end_timestamp,
            legal_terms_hash: params.legal_terms_hash,
            hardware_specs_hash: params.hardware_specs_hash,
            landlord_signed: is_landlord_creator,
            tenant_signed: is_tenant_creator,
            status: initial_status,
            created_at: env.ledger().timestamp(),
            executed_at: 0,
        };

        env.storage().persistent().set(&DataKey::Deed(total), &deed);
        env.storage().persistent().extend_ttl(
            &DataKey::Deed(total),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.storage().instance().set(&DataKey::TotalDeeds, &total);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("deed"), symbol_short!("created")),
            (total, params.landlord, params.tenant),
        );

        Ok(total)
    }

    /// Landlord signs the tenancy deed
    pub fn sign_deed_landlord(env: Env, deed_id: u64, landlord: Address) -> Result<(), DeedError> {
        landlord.require_auth();

        let mut deed: TenancyDeed = env
            .storage()
            .persistent()
            .get(&DataKey::Deed(deed_id))
            .ok_or(DeedError::DeedNotFound)?;

        if landlord != deed.landlord {
            return Err(DeedError::Unauthorized);
        }

        if deed.landlord_signed {
            return Err(DeedError::AlreadySigned);
        }

        deed.landlord_signed = true;

        if deed.tenant_signed {
            deed.status = DeedStatus::FullyExecuted;
            deed.executed_at = env.ledger().timestamp();
            // Record as active deed for tenant proof of address
            env.storage()
                .persistent()
                .set(&DataKey::TenantActiveDeed(deed.tenant.clone()), &deed_id);
            env.storage().persistent().extend_ttl(
                &DataKey::TenantActiveDeed(deed.tenant.clone()),
                INSTANCE_LIFETIME_THRESHOLD,
                INSTANCE_BUMP_AMOUNT,
            );
        } else {
            deed.status = DeedStatus::LandlordSigned;
        }

        env.storage().persistent().set(&DataKey::Deed(deed_id), &deed);
        env.storage().persistent().extend_ttl(
            &DataKey::Deed(deed_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("deed"), symbol_short!("ll_sign")),
            (deed_id, landlord, deed.status == DeedStatus::FullyExecuted),
        );

        Ok(())
    }

    /// Tenant signs the tenancy deed
    pub fn sign_deed_tenant(env: Env, deed_id: u64, tenant: Address) -> Result<(), DeedError> {
        tenant.require_auth();

        let mut deed: TenancyDeed = env
            .storage()
            .persistent()
            .get(&DataKey::Deed(deed_id))
            .ok_or(DeedError::DeedNotFound)?;

        if tenant != deed.tenant {
            return Err(DeedError::Unauthorized);
        }

        if deed.tenant_signed {
            return Err(DeedError::AlreadySigned);
        }

        deed.tenant_signed = true;

        if deed.landlord_signed {
            deed.status = DeedStatus::FullyExecuted;
            deed.executed_at = env.ledger().timestamp();
            // Record as active deed for tenant proof of address
            env.storage()
                .persistent()
                .set(&DataKey::TenantActiveDeed(deed.tenant.clone()), &deed_id);
            env.storage().persistent().extend_ttl(
                &DataKey::TenantActiveDeed(deed.tenant.clone()),
                INSTANCE_LIFETIME_THRESHOLD,
                INSTANCE_BUMP_AMOUNT,
            );
        } else {
            deed.status = DeedStatus::TenantSigned;
        }

        env.storage().persistent().set(&DataKey::Deed(deed_id), &deed);
        env.storage().persistent().extend_ttl(
            &DataKey::Deed(deed_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("deed"), symbol_short!("tt_sign")),
            (deed_id, tenant, deed.status == DeedStatus::FullyExecuted),
        );

        Ok(())
    }

    /// Terminate a deed prematurely by landlord, tenant, or admin
    pub fn terminate_deed(env: Env, deed_id: u64, caller: Address) -> Result<(), DeedError> {
        caller.require_auth();

        let mut deed: TenancyDeed = env
            .storage()
            .persistent()
            .get(&DataKey::Deed(deed_id))
            .ok_or(DeedError::DeedNotFound)?;

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(DeedError::NotInitialized)?;

        if caller != deed.landlord && caller != deed.tenant && caller != admin {
            return Err(DeedError::Unauthorized);
        }

        deed.status = DeedStatus::Terminated;

        // Clear active deed if matching
        if let Some(active_id) = env
            .storage()
            .persistent()
            .get::<DataKey, u64>(&DataKey::TenantActiveDeed(deed.tenant.clone()))
        {
            if active_id == deed_id {
                env.storage()
                    .persistent()
                    .remove(&DataKey::TenantActiveDeed(deed.tenant.clone()));
            }
        }

        env.storage().persistent().set(&DataKey::Deed(deed_id), &deed);
        env.storage().persistent().extend_ttl(
            &DataKey::Deed(deed_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("deed"), symbol_short!("term")),
            (deed_id, caller),
        );

        Ok(())
    }

    /// Retrieve deed details
    pub fn get_deed(env: Env, deed_id: u64) -> Result<TenancyDeed, DeedError> {
        env.storage()
            .persistent()
            .get(&DataKey::Deed(deed_id))
            .ok_or(DeedError::DeedNotFound)
    }

    /// Retrieve active deed ID for a tenant (used for KYC & Proof of Address)
    pub fn get_tenant_active_deed(env: Env, tenant: Address) -> Option<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::TenantActiveDeed(tenant))
    }

    /// Verifies if a tenant holds an active, executed deed within valid date range
    pub fn verify_address_proof(env: Env, tenant: Address) -> bool {
        if let Some(deed_id) = env
            .storage()
            .persistent()
            .get::<DataKey, u64>(&DataKey::TenantActiveDeed(tenant))
        {
            if let Some(deed) = env
                .storage()
                .persistent()
                .get::<DataKey, TenancyDeed>(&DataKey::Deed(deed_id))
            {
                let now = env.ledger().timestamp();
                return deed.status == DeedStatus::FullyExecuted
                    && now >= deed.start_timestamp
                    && now <= deed.end_timestamp;
            }
        }
        false
    }

    /// Read total number of deeds registered
    pub fn get_total_deeds(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalDeeds)
            .unwrap_or(0)
    }

    /// Add an immutable statutory amendment / addendum hash to an executed tenancy deed
    pub fn add_deed_amendment(
        env: Env,
        deed_id: u64,
        caller: Address,
        amendment_hash: BytesN<32>,
    ) -> Result<(), DeedError> {
        caller.require_auth();

        let deed: TenancyDeed = env
            .storage()
            .persistent()
            .get(&DataKey::Deed(deed_id))
            .ok_or(DeedError::DeedNotFound)?;

        if caller != deed.landlord && caller != deed.tenant {
            return Err(DeedError::Unauthorized);
        }

        let mut amendments: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&DataKey::Amendments(deed_id))
            .unwrap_or(Vec::new(&env));

        amendments.push_back(amendment_hash.clone());

        env.storage()
            .persistent()
            .set(&DataKey::Amendments(deed_id), &amendments);
        env.storage().persistent().extend_ttl(
            &DataKey::Amendments(deed_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("deed"), symbol_short!("amend")),
            (deed_id, caller, amendment_hash),
        );

        Ok(())
    }

    /// Read list of amendment hashes for deed
    pub fn get_deed_amendments(env: Env, deed_id: u64) -> Vec<BytesN<32>> {
        env.storage()
            .persistent()
            .get(&DataKey::Amendments(deed_id))
            .unwrap_or(Vec::new(&env))
    }
}
