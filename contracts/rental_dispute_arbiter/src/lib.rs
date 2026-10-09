#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    String,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days in ledgers
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days in ledgers
const REQUIRED_QUORUM: u32 = 2; // 2 concurring votes required for verdict

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum DisputeError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    DisputeNotFound = 4,
    DisputeAlreadyExists = 5,
    DisputeAlreadyResolved = 6,
    ArbitratorAlreadyVoted = 7,
    InvalidAmount = 8,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeVerdict {
    Pending = 0,
    RefundTenantFull = 1,  // 100% back to tenant (no proof of damage beyond fair wear)
    PayLandlordFull = 2,   // 100% to landlord (proven catastrophic damage)
    SplitFiftyFifty = 3,   // 50% tenant / 50% landlord (shared responsibility)
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArbitratorVote {
    pub arbitrator: Address,
    pub verdict: DisputeVerdict,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeCase {
    pub dispute_id: u64,
    pub lease_id: u64,
    pub tenant: Address,
    pub landlord: Address,
    pub caution_amount: i128,
    pub move_in_hash: BytesN<32>,
    pub move_out_hash: BytesN<32>,
    pub final_verdict: DisputeVerdict,
    pub is_resolved: bool,
    pub tenant_payout: i128,
    pub landlord_payout: i128,
    pub votes_refund_tenant: u32,
    pub votes_pay_landlord: u32,
    pub votes_split: u32,
    pub lodged_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Arbitrator(Address),
    Dispute(u64),
    DisputeCounter,
    TotalArbitrators,
}

#[contract]
pub struct RentalDisputeArbiterContract;

#[contractimpl]
impl RentalDisputeArbiterContract {
    /// Initialize the decentralized dispute arbitration panel
    pub fn initialize(env: Env, admin: Address) -> Result<(), DisputeError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DisputeError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::DisputeCounter, &0u64);
        env.storage().instance().set(&DataKey::TotalArbitrators, &0u32);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("arbiter"), symbol_short!("init")),
            admin,
        );

        Ok(())
    }

    /// Admin accredits an independent community arbitrator (e.g. Housing Aid, Surveyor)
    pub fn register_arbitrator(
        env: Env,
        admin: Address,
        arbitrator: Address,
        _name: String,
    ) -> Result<(), DisputeError> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(DisputeError::NotInitialized)?;

        if admin != stored_admin {
            return Err(DisputeError::Unauthorized);
        }

        if env.storage().persistent().has(&DataKey::Arbitrator(arbitrator.clone())) {
            return Ok(());
        }

        env.storage()
            .persistent()
            .set(&DataKey::Arbitrator(arbitrator.clone()), &true);
        env.storage().persistent().extend_ttl(
            &DataKey::Arbitrator(arbitrator.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        let mut total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalArbitrators)
            .unwrap_or(0);
        total += 1;
        env.storage().instance().set(&DataKey::TotalArbitrators, &total);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("arbiter"), symbol_short!("reg")),
            arbitrator,
        );

        Ok(())
    }

    /// Lodge an on-chain dispute with photographic move-in vs move-out visual hashes
    pub fn lodge_dispute(
        env: Env,
        caller: Address,
        lease_id: u64,
        tenant: Address,
        landlord: Address,
        caution_amount: i128,
        move_in_hash: BytesN<32>,
        move_out_hash: BytesN<32>,
    ) -> Result<u64, DisputeError> {
        caller.require_auth();

        if caution_amount <= 0 {
            return Err(DisputeError::InvalidAmount);
        }

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::DisputeCounter)
            .unwrap_or(0);
        counter += 1;

        let case = DisputeCase {
            dispute_id: counter,
            lease_id,
            tenant: tenant.clone(),
            landlord: landlord.clone(),
            caution_amount,
            move_in_hash: move_in_hash.clone(),
            move_out_hash: move_out_hash.clone(),
            final_verdict: DisputeVerdict::Pending,
            is_resolved: false,
            tenant_payout: 0,
            landlord_payout: 0,
            votes_refund_tenant: 0,
            votes_pay_landlord: 0,
            votes_split: 0,
            lodged_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Dispute(counter), &case);
        env.storage().persistent().extend_ttl(
            &DataKey::Dispute(counter),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.storage().instance().set(&DataKey::DisputeCounter, &counter);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("dispute"), symbol_short!("lodge")),
            (counter, lease_id, caution_amount),
        );

        Ok(counter)
    }

    /// Accredited arbitrator casts binding vote based on visual inspection delta
    pub fn cast_vote(
        env: Env,
        arbitrator: Address,
        dispute_id: u64,
        verdict: DisputeVerdict,
    ) -> Result<DisputeVerdict, DisputeError> {
        arbitrator.require_auth();

        let is_valid_arb: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Arbitrator(arbitrator.clone()))
            .unwrap_or(false);

        if !is_valid_arb {
            return Err(DisputeError::Unauthorized);
        }

        let mut case: DisputeCase = env
            .storage()
            .persistent()
            .get(&DataKey::Dispute(dispute_id))
            .ok_or(DisputeError::DisputeNotFound)?;

        if case.is_resolved {
            return Err(DisputeError::DisputeAlreadyResolved);
        }

        match verdict {
            DisputeVerdict::RefundTenantFull => {
                case.votes_refund_tenant += 1;
            }
            DisputeVerdict::PayLandlordFull => {
                case.votes_pay_landlord += 1;
            }
            DisputeVerdict::SplitFiftyFifty => {
                case.votes_split += 1;
            }
            DisputeVerdict::Pending => {
                return Err(DisputeError::Unauthorized);
            }
        }

        // Check if quorum (2 votes) is reached
        if case.votes_refund_tenant >= REQUIRED_QUORUM {
            case.final_verdict = DisputeVerdict::RefundTenantFull;
            case.is_resolved = true;
            case.tenant_payout = case.caution_amount;
            case.landlord_payout = 0;
        } else if case.votes_pay_landlord >= REQUIRED_QUORUM {
            case.final_verdict = DisputeVerdict::PayLandlordFull;
            case.is_resolved = true;
            case.tenant_payout = 0;
            case.landlord_payout = case.caution_amount;
        } else if case.votes_split >= REQUIRED_QUORUM {
            case.final_verdict = DisputeVerdict::SplitFiftyFifty;
            case.is_resolved = true;
            case.tenant_payout = case.caution_amount / 2;
            case.landlord_payout = case.caution_amount - case.tenant_payout;
        }

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &case);
        env.storage().persistent().extend_ttl(
            &DataKey::Dispute(dispute_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        if case.is_resolved {
            env.events().publish(
                (symbol_short!("dispute"), symbol_short!("verdict")),
                (dispute_id, case.tenant_payout, case.landlord_payout),
            );
        }

        Ok(case.final_verdict)
    }

    /// Read dispute case details
    pub fn get_dispute(env: Env, dispute_id: u64) -> Result<DisputeCase, DisputeError> {
        env.storage()
            .persistent()
            .get(&DataKey::Dispute(dispute_id))
            .ok_or(DisputeError::DisputeNotFound)
    }

    /// Check if address is accredited arbitrator
    pub fn is_arbitrator(env: Env, address: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Arbitrator(address))
            .unwrap_or(false)
    }

    /// Read total accredited arbitrators
    pub fn get_arbitrator_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalArbitrators)
            .unwrap_or(0)
    }

    /// Read total disputes count
    pub fn get_dispute_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::DisputeCounter)
            .unwrap_or(0)
    }
}
