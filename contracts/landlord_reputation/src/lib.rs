#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    String,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days in ledgers
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days in ledgers

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ReputationError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    LandlordNotFound = 4,
    PropertyNotFound = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LandlordProfile {
    pub address: Address,
    pub name: String,
    pub is_verified_owner: bool,
    pub total_leases: u32,
    pub successful_refunds: u32,
    pub total_disputes: u32,
    pub trust_score: u32, // 0 to 100 score
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PropertyAuditProof {
    pub property_id: String,
    pub landlord: Address,
    pub meter_type: String,
    pub grid_hours: u32,
    pub solar_kva: u32,
    pub visual_audit_hash: BytesN<32>,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Landlord(Address),
    PropertyAudit(String),
    TotalLandlords,
}

#[contract]
pub struct LandlordReputationContract;

#[contractimpl]
impl LandlordReputationContract {
    /// Initialize the reputation and audit registry protocol
    pub fn initialize(env: Env, admin: Address) -> Result<(), ReputationError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ReputationError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalLandlords, &0u32);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("rep"), symbol_short!("init")),
            admin,
        );

        Ok(())
    }

    /// Register a verified property owner on-chain
    pub fn register_landlord(
        env: Env,
        landlord: Address,
        name: String,
        is_verified_owner: bool,
    ) -> Result<(), ReputationError> {
        landlord.require_auth();

        if env.storage().persistent().has(&DataKey::Landlord(landlord.clone())) {
            // Already registered, return ok
            return Ok(());
        }

        let initial_score = if is_verified_owner { 80u32 } else { 50u32 };

        let profile = LandlordProfile {
            address: landlord.clone(),
            name: name.clone(),
            is_verified_owner,
            total_leases: 0,
            successful_refunds: 0,
            total_disputes: 0,
            trust_score: initial_score,
            registered_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Landlord(landlord.clone()), &profile);
        env.storage().persistent().extend_ttl(
            &DataKey::Landlord(landlord.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        let mut count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLandlords)
            .unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::TotalLandlords, &count);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("landlord"), symbol_short!("reg")),
            (landlord, name, initial_score),
        );

        Ok(())
    }

    /// Record a cryptographic inspection and utility audit for a property
    pub fn record_property_audit(
        env: Env,
        landlord: Address,
        property_id: String,
        meter_type: String,
        grid_hours: u32,
        solar_kva: u32,
        visual_audit_hash: BytesN<32>,
    ) -> Result<(), ReputationError> {
        landlord.require_auth();

        let audit = PropertyAuditProof {
            property_id: property_id.clone(),
            landlord: landlord.clone(),
            meter_type,
            grid_hours,
            solar_kva,
            visual_audit_hash: visual_audit_hash.clone(),
            timestamp: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::PropertyAudit(property_id.clone()), &audit);
        env.storage().persistent().extend_ttl(
            &DataKey::PropertyAudit(property_id.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("audit"), symbol_short!("rec")),
            (property_id, landlord, visual_audit_hash),
        );

        Ok(())
    }

    /// Record lease outcome and automatically update landlord trust score (0-100)
    pub fn record_lease_outcome(
        env: Env,
        caller: Address,
        landlord: Address,
        is_clean_refund: bool,
    ) -> Result<u32, ReputationError> {
        caller.require_auth();

        let mut profile: LandlordProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Landlord(landlord.clone()))
            .ok_or(ReputationError::LandlordNotFound)?;

        profile.total_leases += 1;

        if is_clean_refund {
            profile.successful_refunds += 1;
            // Reward clean deposit refunds (+5 points up to 100)
            if profile.trust_score < 95 {
                profile.trust_score += 5;
            } else {
                profile.trust_score = 100;
            }
        } else {
            profile.total_disputes += 1;
            // Penalize disputes (-15 points down to 20 minimum)
            if profile.trust_score > 35 {
                profile.trust_score -= 15;
            } else {
                profile.trust_score = 20;
            }
        }

        env.storage()
            .persistent()
            .set(&DataKey::Landlord(landlord.clone()), &profile);
        env.storage().persistent().extend_ttl(
            &DataKey::Landlord(landlord.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("rep"), symbol_short!("update")),
            (landlord, profile.trust_score, is_clean_refund),
        );

        Ok(profile.trust_score)
    }

    /// Read landlord profile and trust score
    pub fn get_landlord(env: Env, landlord: Address) -> Result<LandlordProfile, ReputationError> {
        env.storage()
            .persistent()
            .get(&DataKey::Landlord(landlord))
            .ok_or(ReputationError::LandlordNotFound)
    }

    /// Read recorded property inspection audit
    pub fn get_property_audit(
        env: Env,
        property_id: String,
    ) -> Result<PropertyAuditProof, ReputationError> {
        env.storage()
            .persistent()
            .get(&DataKey::PropertyAudit(property_id))
            .ok_or(ReputationError::PropertyNotFound)
    }

    /// Verify if a test hash matches the on-chain property audit hash
    pub fn verify_audit_hash(
        env: Env,
        property_id: String,
        check_hash: BytesN<32>,
    ) -> Result<bool, ReputationError> {
        let audit = Self::get_property_audit(env, property_id)?;
        Ok(audit.visual_audit_hash == check_hash)
    }

    /// Read total registered landlords count
    pub fn get_total_landlords(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalLandlords)
            .unwrap_or(0)
    }
}
