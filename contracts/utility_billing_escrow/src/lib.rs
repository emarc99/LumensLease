#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, BytesN,
    Env, String,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum UtilityError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    PoolNotFound = 4,
    InvalidAmount = 5,
    InvalidState = 6,
    InsufficientPoolBalance = 7,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PoolStatus {
    Active = 0,
    Disbursed = 1,
    Closed = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UtilityPool {
    pub pool_id: u64,
    pub property_id: String,
    pub manager: Address,
    pub monthly_target: i128,
    pub current_balance: i128,
    pub total_disbursed: i128,
    pub utility_name: String,
    pub status: PoolStatus,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PaymentToken,
    Pool(u64),
    TenantContribution(u64, Address), // (pool_id, tenant) -> contribution amount
    PoolCounter,
}

#[contract]
pub struct UtilityBillingEscrowContract;

#[contractimpl]
impl UtilityBillingEscrowContract {
    /// Initialize the Utility Billing Escrow protocol with admin and settlement token (USDC/XLM)
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), UtilityError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(UtilityError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PaymentToken, &token);
        env.storage().instance().set(&DataKey::PoolCounter, &0u64);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("util"), symbol_short!("init")),
            (admin, token),
        );

        Ok(())
    }

    /// Create a shared utility pool (e.g. Compound Diesel Gen, Estate Security, Prepaid NEPA)
    pub fn create_utility_pool(
        env: Env,
        caller: Address,
        property_id: String,
        monthly_target: i128,
        utility_name: String,
    ) -> Result<u64, UtilityError> {
        caller.require_auth();

        if monthly_target <= 0 {
            return Err(UtilityError::InvalidAmount);
        }

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::PoolCounter)
            .unwrap_or(0);
        counter += 1;

        let pool = UtilityPool {
            pool_id: counter,
            property_id: property_id.clone(),
            manager: caller.clone(),
            monthly_target,
            current_balance: 0,
            total_disbursed: 0,
            utility_name,
            status: PoolStatus::Active,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Pool(counter), &pool);
        env.storage().persistent().extend_ttl(
            &DataKey::Pool(counter),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.storage().instance().set(&DataKey::PoolCounter, &counter);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("pool"), symbol_short!("created")),
            (counter, property_id, monthly_target),
        );

        Ok(counter)
    }

    /// Tenant deposits their monthly contribution share into the utility pool
    pub fn contribute_share(
        env: Env,
        pool_id: u64,
        tenant: Address,
        amount: i128,
    ) -> Result<i128, UtilityError> {
        tenant.require_auth();

        if amount <= 0 {
            return Err(UtilityError::InvalidAmount);
        }

        let mut pool: UtilityPool = env
            .storage()
            .persistent()
            .get(&DataKey::Pool(pool_id))
            .ok_or(UtilityError::PoolNotFound)?;

        if pool.status != PoolStatus::Active {
            return Err(UtilityError::InvalidState);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(UtilityError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&tenant, &env.current_contract_address(), &amount);

        pool.current_balance += amount;
        env.storage().persistent().set(&DataKey::Pool(pool_id), &pool);

        let mut current_contrib: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::TenantContribution(pool_id, tenant.clone()))
            .unwrap_or(0);
        current_contrib += amount;

        env.storage()
            .persistent()
            .set(&DataKey::TenantContribution(pool_id, tenant.clone()), &current_contrib);
        env.storage().persistent().extend_ttl(
            &DataKey::TenantContribution(pool_id, tenant.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("pool"), symbol_short!("contrib")),
            (pool_id, tenant, amount, pool.current_balance),
        );

        Ok(pool.current_balance)
    }

    /// Disburse payment from the utility pool directly to the utility service vendor (with receipt hash)
    pub fn disburse_utility_payment(
        env: Env,
        pool_id: u64,
        caller: Address,
        vendor: Address,
        amount: i128,
        receipt_hash: BytesN<32>,
    ) -> Result<(), UtilityError> {
        caller.require_auth();

        if amount <= 0 {
            return Err(UtilityError::InvalidAmount);
        }

        let mut pool: UtilityPool = env
            .storage()
            .persistent()
            .get(&DataKey::Pool(pool_id))
            .ok_or(UtilityError::PoolNotFound)?;

        if pool.status != PoolStatus::Active {
            return Err(UtilityError::InvalidState);
        }

        if caller != pool.manager {
            return Err(UtilityError::Unauthorized);
        }

        if pool.current_balance < amount {
            return Err(UtilityError::InsufficientPoolBalance);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(UtilityError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &vendor, &amount);

        pool.current_balance -= amount;
        pool.total_disbursed += amount;
        env.storage().persistent().set(&DataKey::Pool(pool_id), &pool);

        env.events().publish(
            (symbol_short!("pool"), symbol_short!("disb")),
            (pool_id, vendor, amount, receipt_hash),
        );

        Ok(())
    }

    /// Refund surplus share back to a tenant upon moving out
    pub fn refund_surplus_share(
        env: Env,
        pool_id: u64,
        caller: Address,
        tenant: Address,
        refund_amount: i128,
    ) -> Result<(), UtilityError> {
        caller.require_auth();

        if refund_amount <= 0 {
            return Err(UtilityError::InvalidAmount);
        }

        let mut pool: UtilityPool = env
            .storage()
            .persistent()
            .get(&DataKey::Pool(pool_id))
            .ok_or(UtilityError::PoolNotFound)?;

        if caller != pool.manager && caller != tenant {
            return Err(UtilityError::Unauthorized);
        }

        if pool.current_balance < refund_amount {
            return Err(UtilityError::InsufficientPoolBalance);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(UtilityError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &tenant, &refund_amount);

        pool.current_balance -= refund_amount;
        env.storage().persistent().set(&DataKey::Pool(pool_id), &pool);

        let mut current_contrib: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::TenantContribution(pool_id, tenant.clone()))
            .unwrap_or(0);
        if current_contrib >= refund_amount {
            current_contrib -= refund_amount;
            env.storage()
                .persistent()
                .set(&DataKey::TenantContribution(pool_id, tenant.clone()), &current_contrib);
        }

        env.events().publish(
            (symbol_short!("pool"), symbol_short!("refund")),
            (pool_id, tenant, refund_amount),
        );

        Ok(())
    }

    /// Read utility pool state by pool ID
    pub fn get_pool(env: Env, pool_id: u64) -> Result<UtilityPool, UtilityError> {
        env.storage()
            .persistent()
            .get(&DataKey::Pool(pool_id))
            .ok_or(UtilityError::PoolNotFound)
    }

    /// Read individual tenant total contributed share in a pool
    pub fn get_tenant_contribution(env: Env, pool_id: u64, tenant: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::TenantContribution(pool_id, tenant))
            .unwrap_or(0)
    }

    /// Read total pools created count
    pub fn get_pool_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::PoolCounter)
            .unwrap_or(0)
    }
}
