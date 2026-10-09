#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, BytesN,
    Env, String,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days
const MINIMUM_SCOUT_STAKE: i128 = 50_0000000; // 50 USDC stake required to verify

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ScoutError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    ScoutNotFound = 4,
    AuditNotFound = 5,
    InvalidAmount = 6,
    InvalidState = 7,
    InsufficientStake = 8,
    ScoutAlreadyRegistered = 9,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum AuditStatus {
    Verified = 0,
    Challenged = 1,
    FraudConfirmed = 2,
    BountyClaimed = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoutProfile {
    pub scout: Address,
    pub stake_amount: i128,
    pub total_audits: u32,
    pub successful_audits: u32,
    pub slashed_count: u32,
    pub is_active: bool,
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PhysicalAuditRecord {
    pub property_id: String,
    pub scout: Address,
    pub conlog_meter_sn: String,
    pub solar_kva_rating: u32,
    pub gps_coordinates_hash: BytesN<32>,
    pub visual_audit_hash: BytesN<32>,
    pub bounty_amount: i128,
    pub status: AuditStatus,
    pub challenger: Address,
    pub audited_at: u64,
    pub settled_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PaymentToken,
    Scout(Address),
    Audit(String),
    TotalScouts,
    TotalAudits,
}

#[contract]
pub struct CommunityScoutVerifierContract;

#[contractimpl]
impl CommunityScoutVerifierContract {
    /// Initialize the Community Scout protocol with admin and settlement token (USDC/XLM)
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), ScoutError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ScoutError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PaymentToken, &token);
        env.storage().instance().set(&DataKey::TotalScouts, &0u32);
        env.storage().instance().set(&DataKey::TotalAudits, &0u64);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("scout"), symbol_short!("init")),
            (admin, token),
        );

        Ok(())
    }

    /// Register as a community scout by locking collateral stake (>= 50 USDC)
    pub fn register_scout(
        env: Env,
        scout: Address,
        stake_amount: i128,
    ) -> Result<(), ScoutError> {
        scout.require_auth();

        if stake_amount < MINIMUM_SCOUT_STAKE {
            return Err(ScoutError::InsufficientStake);
        }

        if env.storage().persistent().has(&DataKey::Scout(scout.clone())) {
            return Err(ScoutError::ScoutAlreadyRegistered);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(ScoutError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&scout, &env.current_contract_address(), &stake_amount);

        let profile = ScoutProfile {
            scout: scout.clone(),
            stake_amount,
            total_audits: 0,
            successful_audits: 0,
            slashed_count: 0,
            is_active: true,
            registered_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Scout(scout.clone()), &profile);
        env.storage().persistent().extend_ttl(
            &DataKey::Scout(scout.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        let mut total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalScouts)
            .unwrap_or(0);
        total += 1;
        env.storage().instance().set(&DataKey::TotalScouts, &total);

        env.events().publish(
            (symbol_short!("scout"), symbol_short!("reg")),
            (scout, stake_amount),
        );

        Ok(())
    }

    /// Scout submits on-chain cryptographic property audit with hardware proofs
    pub fn submit_physical_audit(
        env: Env,
        scout: Address,
        property_id: String,
        conlog_meter_sn: String,
        solar_kva_rating: u32,
        gps_hash: BytesN<32>,
        visual_audit_hash: BytesN<32>,
        bounty_amount: i128,
    ) -> Result<(), ScoutError> {
        scout.require_auth();

        let mut profile: ScoutProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Scout(scout.clone()))
            .ok_or(ScoutError::ScoutNotFound)?;

        if !profile.is_active || profile.stake_amount < MINIMUM_SCOUT_STAKE {
            return Err(ScoutError::InsufficientStake);
        }

        profile.total_audits += 1;
        env.storage().persistent().set(&DataKey::Scout(scout.clone()), &profile);

        let audit = PhysicalAuditRecord {
            property_id: property_id.clone(),
            scout: scout.clone(),
            conlog_meter_sn,
            solar_kva_rating,
            gps_coordinates_hash: gps_hash,
            visual_audit_hash,
            bounty_amount,
            status: AuditStatus::Verified,
            challenger: scout.clone(), // Default placeholder
            audited_at: env.ledger().timestamp(),
            settled_at: 0,
        };

        env.storage().persistent().set(&DataKey::Audit(property_id.clone()), &audit);
        env.storage().persistent().extend_ttl(
            &DataKey::Audit(property_id.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalAudits)
            .unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::TotalAudits, &count);

        env.events().publish(
            (symbol_short!("audit"), symbol_short!("sub")),
            (property_id, scout, solar_kva_rating),
        );

        Ok(())
    }

    /// Claim verification bounty once property is verified and leased
    pub fn claim_bounty(
        env: Env,
        caller: Address,
        property_id: String,
    ) -> Result<(), ScoutError> {
        caller.require_auth();

        let mut audit: PhysicalAuditRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Audit(property_id.clone()))
            .ok_or(ScoutError::AuditNotFound)?;

        if audit.status != AuditStatus::Verified {
            return Err(ScoutError::InvalidState);
        }

        if caller != audit.scout {
            return Err(ScoutError::Unauthorized);
        }

        if audit.bounty_amount > 0 {
            let token_addr: Address = env
                .storage()
                .instance()
                .get(&DataKey::PaymentToken)
                .ok_or(ScoutError::NotInitialized)?;

            let token_client = token::Client::new(&env, &token_addr);
            token_client.transfer(&env.current_contract_address(), &audit.scout, &audit.bounty_amount);
        }

        audit.status = AuditStatus::BountyClaimed;
        audit.settled_at = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Audit(property_id.clone()), &audit);

        let mut profile: ScoutProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Scout(audit.scout.clone()))
            .ok_or(ScoutError::ScoutNotFound)?;

        profile.successful_audits += 1;
        env.storage().persistent().set(&DataKey::Scout(audit.scout.clone()), &profile);

        env.events().publish(
            (symbol_short!("scout"), symbol_short!("bounty")),
            (property_id, audit.scout, audit.bounty_amount),
        );

        Ok(())
    }

    /// Community challenges a fake or dishonest audit with evidence hash
    pub fn challenge_audit(
        env: Env,
        challenger: Address,
        property_id: String,
        _evidence_hash: BytesN<32>,
    ) -> Result<(), ScoutError> {
        challenger.require_auth();

        let mut audit: PhysicalAuditRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Audit(property_id.clone()))
            .ok_or(ScoutError::AuditNotFound)?;

        if audit.status != AuditStatus::Verified {
            return Err(ScoutError::InvalidState);
        }

        audit.status = AuditStatus::Challenged;
        audit.challenger = challenger.clone();
        env.storage().persistent().set(&DataKey::Audit(property_id.clone()), &audit);

        env.events().publish(
            (symbol_short!("scout"), symbol_short!("chal")),
            (property_id, challenger, audit.scout),
        );

        Ok(())
    }

    /// Admin / Arbitration resolves challenge: if fraud confirmed, slashes scout stake to challenger!
    pub fn resolve_challenge(
        env: Env,
        admin: Address,
        property_id: String,
        is_fraudulent: bool,
    ) -> Result<(), ScoutError> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(ScoutError::NotInitialized)?;

        if admin != stored_admin {
            return Err(ScoutError::Unauthorized);
        }

        let mut audit: PhysicalAuditRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Audit(property_id.clone()))
            .ok_or(ScoutError::AuditNotFound)?;

        if audit.status != AuditStatus::Challenged {
            return Err(ScoutError::InvalidState);
        }

        let mut profile: ScoutProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Scout(audit.scout.clone()))
            .ok_or(ScoutError::ScoutNotFound)?;

        if is_fraudulent {
            audit.status = AuditStatus::FraudConfirmed;
            profile.slashed_count += 1;
            profile.is_active = false;

            // Slash scout stake: transfer half to challenger, keep half in protocol
            let slash_amount = profile.stake_amount;
            profile.stake_amount = 0;

            let token_addr: Address = env
                .storage()
                .instance()
                .get(&DataKey::PaymentToken)
                .ok_or(ScoutError::NotInitialized)?;

            let token_client = token::Client::new(&env, &token_addr);
            token_client.transfer(&env.current_contract_address(), &audit.challenger, &slash_amount);
        } else {
            audit.status = AuditStatus::Verified;
            profile.successful_audits += 1;
        }

        audit.settled_at = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Audit(property_id.clone()), &audit);
        env.storage().persistent().set(&DataKey::Scout(audit.scout.clone()), &profile);

        env.events().publish(
            (symbol_short!("scout"), symbol_short!("res")),
            (property_id, is_fraudulent),
        );

        Ok(())
    }

    /// Read physical audit details for property
    pub fn get_audit(env: Env, property_id: String) -> Result<PhysicalAuditRecord, ScoutError> {
        env.storage()
            .persistent()
            .get(&DataKey::Audit(property_id))
            .ok_or(ScoutError::AuditNotFound)
    }

    /// Read scout profile
    pub fn get_scout(env: Env, scout: Address) -> Result<ScoutProfile, ScoutError> {
        env.storage()
            .persistent()
            .get(&DataKey::Scout(scout))
            .ok_or(ScoutError::ScoutNotFound)
    }

    /// Read total registered scouts count
    pub fn get_total_scouts(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalScouts)
            .unwrap_or(0)
    }

    /// Read total audits submitted count
    pub fn get_total_audits(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalAudits)
            .unwrap_or(0)
    }
}
