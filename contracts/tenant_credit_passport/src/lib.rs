#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    Vec,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days in ledgers
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days in ledgers
const MIN_CREDIT_SCORE: u32 = 300;
const MAX_CREDIT_SCORE: u32 = 850;
const INITIAL_CREDIT_SCORE: u32 = 500;
const MONTHLY_RENT_QUALIFYING_SCORE: u32 = 680;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CreditError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    TenantNotFound = 4,
    TenantAlreadyRegistered = 5,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum CreditTier {
    Bronze = 0,   // 300 - 579
    Silver = 1,   // 580 - 669
    Gold = 2,     // 670 - 739
    Platinum = 3, // 740 - 850
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub lease_id: u64,
    pub amount: i128,
    pub timestamp: u64,
    pub was_on_time: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TenantCreditProfile {
    pub tenant: Address,
    pub credit_score: u32,
    pub tier: CreditTier,
    pub total_leases_completed: u32,
    pub on_time_payments_streak: u32,
    pub clean_deposit_refunds: u32,
    pub disputes_count: u32,
    pub qualifies_for_monthly_rent: bool,
    pub identity_hash: BytesN<32>,
    pub registered_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Tenant(Address),
    PaymentHistory(Address),
    Guarantor(Address),
    IncomeProof(Address),
    TotalTenants,
}

fn calculate_tier(score: u32) -> CreditTier {
    if score >= 740 {
        CreditTier::Platinum
    } else if score >= 670 {
        CreditTier::Gold
    } else if score >= 580 {
        CreditTier::Silver
    } else {
        CreditTier::Bronze
    }
}

#[contract]
pub struct TenantCreditPassportContract;

#[contractimpl]
impl TenantCreditPassportContract {
    /// Initialize the decentralized tenant credit passport protocol
    pub fn initialize(env: Env, admin: Address) -> Result<(), CreditError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(CreditError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalTenants, &0u32);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("credit"), symbol_short!("init")),
            admin,
        );

        Ok(())
    }

    /// Register a new tenant sovereign credit profile
    pub fn register_tenant(
        env: Env,
        tenant: Address,
        identity_hash: BytesN<32>,
    ) -> Result<(), CreditError> {
        tenant.require_auth();

        if env.storage().persistent().has(&DataKey::Tenant(tenant.clone())) {
            return Err(CreditError::TenantAlreadyRegistered);
        }

        let profile = TenantCreditProfile {
            tenant: tenant.clone(),
            credit_score: INITIAL_CREDIT_SCORE,
            tier: calculate_tier(INITIAL_CREDIT_SCORE),
            total_leases_completed: 0,
            on_time_payments_streak: 0,
            clean_deposit_refunds: 0,
            disputes_count: 0,
            qualifies_for_monthly_rent: false,
            identity_hash: identity_hash.clone(),
            registered_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Tenant(tenant.clone()), &profile);
        env.storage().persistent().extend_ttl(
            &DataKey::Tenant(tenant.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        let mut total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalTenants)
            .unwrap_or(0);
        total += 1;
        env.storage().instance().set(&DataKey::TotalTenants, &total);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("credit"), symbol_short!("reg")),
            (tenant, INITIAL_CREDIT_SCORE),
        );

        Ok(())
    }

    /// Record an on-time rent payment streak and boost credit score (+10 points)
    pub fn record_payment(
        env: Env,
        caller: Address,
        tenant: Address,
        lease_id: u64,
        amount: i128,
        was_on_time: bool,
    ) -> Result<u32, CreditError> {
        caller.require_auth();

        let mut profile: TenantCreditProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Tenant(tenant.clone()))
            .ok_or(CreditError::TenantNotFound)?;

        if was_on_time {
            profile.on_time_payments_streak += 1;
            if profile.credit_score + 10 <= MAX_CREDIT_SCORE {
                profile.credit_score += 10;
            } else {
                profile.credit_score = MAX_CREDIT_SCORE;
            }
        } else {
            profile.on_time_payments_streak = 0;
            if profile.credit_score >= MIN_CREDIT_SCORE + 15 {
                profile.credit_score -= 15;
            } else {
                profile.credit_score = MIN_CREDIT_SCORE;
            }
        }

        profile.tier = calculate_tier(profile.credit_score);
        profile.qualifies_for_monthly_rent = profile.credit_score >= MONTHLY_RENT_QUALIFYING_SCORE;

        env.storage()
            .persistent()
            .set(&DataKey::Tenant(tenant.clone()), &profile);
        env.storage().persistent().extend_ttl(
            &DataKey::Tenant(tenant.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        // Record payment in history
        let mut history: Vec<PaymentRecord> = env
            .storage()
            .persistent()
            .get(&DataKey::PaymentHistory(tenant.clone()))
            .unwrap_or(Vec::new(&env));

        history.push_back(PaymentRecord {
            lease_id,
            amount,
            timestamp: env.ledger().timestamp(),
            was_on_time,
        });

        env.storage()
            .persistent()
            .set(&DataKey::PaymentHistory(tenant.clone()), &history);
        env.storage().persistent().extend_ttl(
            &DataKey::PaymentHistory(tenant.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("credit"), symbol_short!("pay")),
            (tenant, profile.credit_score, was_on_time),
        );

        Ok(profile.credit_score)
    }

    /// Record completed lease with full deposit return (+25 pts) or dispute fault (-50 pts)
    pub fn record_lease_completion(
        env: Env,
        caller: Address,
        tenant: Address,
        _lease_id: u64,
        was_clean_refund: bool,
    ) -> Result<u32, CreditError> {
        caller.require_auth();

        let mut profile: TenantCreditProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Tenant(tenant.clone()))
            .ok_or(CreditError::TenantNotFound)?;

        profile.total_leases_completed += 1;

        if was_clean_refund {
            profile.clean_deposit_refunds += 1;
            if profile.credit_score + 25 <= MAX_CREDIT_SCORE {
                profile.credit_score += 25;
            } else {
                profile.credit_score = MAX_CREDIT_SCORE;
            }
        } else {
            profile.disputes_count += 1;
            if profile.credit_score >= MIN_CREDIT_SCORE + 50 {
                profile.credit_score -= 50;
            } else {
                profile.credit_score = MIN_CREDIT_SCORE;
            }
        }

        profile.tier = calculate_tier(profile.credit_score);
        profile.qualifies_for_monthly_rent = profile.credit_score >= MONTHLY_RENT_QUALIFYING_SCORE;

        env.storage()
            .persistent()
            .set(&DataKey::Tenant(tenant.clone()), &profile);
        env.storage().persistent().extend_ttl(
            &DataKey::Tenant(tenant.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("credit"), symbol_short!("lease_end")),
            (tenant, profile.credit_score, was_clean_refund),
        );

        Ok(profile.credit_score)
    }

    /// Get tenant full credit passport
    pub fn get_tenant_profile(
        env: Env,
        tenant: Address,
    ) -> Result<TenantCreditProfile, CreditError> {
        env.storage()
            .persistent()
            .get(&DataKey::Tenant(tenant))
            .ok_or(CreditError::TenantNotFound)
    }

    /// Query whether a tenant qualifies for monthly flexible rent (instead of 1 year cash upfront)
    pub fn is_eligible_for_monthly_rent(env: Env, tenant: Address) -> bool {
        if let Some(profile) = env
            .storage()
            .persistent()
            .get::<DataKey, TenantCreditProfile>(&DataKey::Tenant(tenant))
        {
            profile.qualifies_for_monthly_rent
        } else {
            false
        }
    }

    /// Get payment history of tenant
    pub fn get_payment_history(env: Env, tenant: Address) -> Vec<PaymentRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::PaymentHistory(tenant))
            .unwrap_or(Vec::new(&env))
    }

    /// Get total registered tenants count
    pub fn get_total_tenants(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalTenants)
            .unwrap_or(0)
    }

    /// Attach a registered guarantor to tenant profile with credit score bonus (+20 pts)
    pub fn attach_guarantor(
        env: Env,
        tenant: Address,
        guarantor: Address,
    ) -> Result<u32, CreditError> {
        tenant.require_auth();

        let mut profile: TenantCreditProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Tenant(tenant.clone()))
            .ok_or(CreditError::TenantNotFound)?;

        if profile.credit_score + 20 <= MAX_CREDIT_SCORE {
            profile.credit_score += 20;
        } else {
            profile.credit_score = MAX_CREDIT_SCORE;
        }

        profile.tier = calculate_tier(profile.credit_score);
        profile.qualifies_for_monthly_rent = profile.credit_score >= MONTHLY_RENT_QUALIFYING_SCORE;

        env.storage()
            .persistent()
            .set(&DataKey::Tenant(tenant.clone()), &profile);
        env.storage()
            .persistent()
            .set(&DataKey::Guarantor(tenant.clone()), &guarantor);
        env.storage().persistent().extend_ttl(
            &DataKey::Guarantor(tenant.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("credit"), symbol_short!("guarantor")),
            (tenant, guarantor, profile.credit_score),
        );

        Ok(profile.credit_score)
    }

    /// Attach cryptographic income / salary verification digest
    pub fn attach_income_verification(
        env: Env,
        tenant: Address,
        employer_hash: BytesN<32>,
    ) -> Result<(), CreditError> {
        tenant.require_auth();

        if !env.storage().persistent().has(&DataKey::Tenant(tenant.clone())) {
            return Err(CreditError::TenantNotFound);
        }

        env.storage()
            .persistent()
            .set(&DataKey::IncomeProof(tenant.clone()), &employer_hash);
        env.storage().persistent().extend_ttl(
            &DataKey::IncomeProof(tenant.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("credit"), symbol_short!("income")),
            (tenant, employer_hash),
        );

        Ok(())
    }

    /// Read guarantor for tenant
    pub fn get_tenant_guarantor(env: Env, tenant: Address) -> Option<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::Guarantor(tenant))
    }

    /// Read income verification hash for tenant
    pub fn get_income_verification(env: Env, tenant: Address) -> Option<BytesN<32>> {
        env.storage()
            .persistent()
            .get(&DataKey::IncomeProof(tenant))
    }
}
