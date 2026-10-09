#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days in ledgers
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days in ledgers

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StreamError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    StreamNotFound = 4,
    InvalidAmount = 5,
    InvalidState = 6,
    NoInstallmentDue = 7,
    InsufficientVaultBalance = 8,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum StreamStatus {
    Created = 0,
    Active = 1,
    Completed = 2,
    Defaulted = 3,
    Cancelled = 4,
    Paused = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RentStream {
    pub stream_id: u64,
    pub tenant: Address,
    pub landlord: Address,
    pub monthly_amount: i128,
    pub buffer_amount: i128, // Default protection buffer (e.g. 1 month)
    pub total_months: u32,
    pub months_claimed: u32,
    pub vault_balance: i128,
    pub start_timestamp: u64,
    pub last_claim_timestamp: u64,
    pub status: StreamStatus,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PaymentToken,
    Stream(u64),
    TotalStreams,
}

#[contract]
pub struct RentStreamVaultContract;

#[contractimpl]
impl RentStreamVaultContract {
    /// Initialize the flexible rent streaming protocol
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), StreamError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(StreamError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PaymentToken, &token);
        env.storage().instance().set(&DataKey::TotalStreams, &0u64);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("init")),
            (admin, token),
        );

        Ok(())
    }

    /// Create a new micro-rent stream with monthly installment schedule and buffer
    pub fn create_stream(
        env: Env,
        caller: Address,
        tenant: Address,
        landlord: Address,
        monthly_amount: i128,
        buffer_amount: i128,
        total_months: u32,
    ) -> Result<u64, StreamError> {
        caller.require_auth();

        if caller != tenant && caller != landlord {
            return Err(StreamError::Unauthorized);
        }

        if monthly_amount <= 0 || buffer_amount < 0 || total_months == 0 {
            return Err(StreamError::InvalidAmount);
        }

        let mut total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStreams)
            .unwrap_or(0);
        total += 1;

        let stream = RentStream {
            stream_id: total,
            tenant: tenant.clone(),
            landlord: landlord.clone(),
            monthly_amount,
            buffer_amount,
            total_months,
            months_claimed: 0,
            vault_balance: 0,
            start_timestamp: 0,
            last_claim_timestamp: 0,
            status: StreamStatus::Created,
        };

        env.storage().persistent().set(&DataKey::Stream(total), &stream);
        env.storage().persistent().extend_ttl(
            &DataKey::Stream(total),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.storage().instance().set(&DataKey::TotalStreams, &total);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("created")),
            (total, tenant, landlord, monthly_amount),
        );

        Ok(total)
    }

    /// Tenant deposits the initial installment + buffer to activate the stream
    pub fn fund_initial_stream(
        env: Env,
        stream_id: u64,
        caller: Address,
    ) -> Result<(), StreamError> {
        caller.require_auth();

        let mut stream: RentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;

        if stream.status != StreamStatus::Created {
            return Err(StreamError::InvalidState);
        }

        if caller != stream.tenant {
            return Err(StreamError::Unauthorized);
        }

        let required_deposit = stream.monthly_amount + stream.buffer_amount;

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(StreamError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&caller, &env.current_contract_address(), &required_deposit);

        let now = env.ledger().timestamp();
        stream.vault_balance = required_deposit;
        stream.status = StreamStatus::Active;
        stream.start_timestamp = now;
        stream.last_claim_timestamp = now;

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);
        env.storage().persistent().extend_ttl(
            &DataKey::Stream(stream_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("funded")),
            (stream_id, caller, required_deposit),
        );

        Ok(())
    }

    /// Top up stream with subsequent monthly rent payments
    pub fn top_up_stream(
        env: Env,
        stream_id: u64,
        caller: Address,
        amount: i128,
    ) -> Result<(), StreamError> {
        caller.require_auth();

        if amount <= 0 {
            return Err(StreamError::InvalidAmount);
        }

        let mut stream: RentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;

        if stream.status != StreamStatus::Active {
            return Err(StreamError::InvalidState);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(StreamError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&caller, &env.current_contract_address(), &amount);

        stream.vault_balance += amount;

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);
        env.storage().persistent().extend_ttl(
            &DataKey::Stream(stream_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("topup")),
            (stream_id, caller, amount, stream.vault_balance),
        );

        Ok(())
    }

    /// Landlord claims the next due monthly installment
    pub fn claim_installment(
        env: Env,
        stream_id: u64,
        landlord: Address,
    ) -> Result<(), StreamError> {
        landlord.require_auth();

        let mut stream: RentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;

        if stream.status != StreamStatus::Active {
            return Err(StreamError::InvalidState);
        }

        if landlord != stream.landlord {
            return Err(StreamError::Unauthorized);
        }

        if stream.months_claimed >= stream.total_months {
            return Err(StreamError::NoInstallmentDue);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(StreamError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);

        let amount_to_pay = stream.monthly_amount;
        if stream.vault_balance < amount_to_pay {
            return Err(StreamError::InsufficientVaultBalance);
        }

        token_client.transfer(&env.current_contract_address(), &stream.landlord, &amount_to_pay);

        stream.vault_balance -= amount_to_pay;
        stream.months_claimed += 1;
        stream.last_claim_timestamp = env.ledger().timestamp();

        // If all scheduled months are claimed, return any remaining buffer to tenant and complete
        if stream.months_claimed == stream.total_months {
            let refund_amount = stream.vault_balance;
            if refund_amount > 0 {
                token_client.transfer(&env.current_contract_address(), &stream.tenant, &refund_amount);
                stream.vault_balance = 0;
            }
            stream.status = StreamStatus::Completed;
        }

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);
        env.storage().persistent().extend_ttl(
            &DataKey::Stream(stream_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("claimed")),
            (stream_id, stream.months_claimed, amount_to_pay),
        );

        Ok(())
    }

    /// Landlord claims buffer payout if tenant defaults and cannot pay rent
    pub fn claim_default_buffer(
        env: Env,
        stream_id: u64,
        landlord: Address,
    ) -> Result<(), StreamError> {
        landlord.require_auth();

        let mut stream: RentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;

        if stream.status != StreamStatus::Active {
            return Err(StreamError::InvalidState);
        }

        if landlord != stream.landlord {
            return Err(StreamError::Unauthorized);
        }

        // If vault balance cannot cover the monthly installment, landlord claims available buffer
        if stream.vault_balance >= stream.monthly_amount {
            return Err(StreamError::InvalidState);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(StreamError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);

        let payout = stream.vault_balance;
        if payout > 0 {
            token_client.transfer(&env.current_contract_address(), &stream.landlord, &payout);
            stream.vault_balance = 0;
        }

        stream.status = StreamStatus::Defaulted;

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);
        env.storage().persistent().extend_ttl(
            &DataKey::Stream(stream_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("default")),
            (stream_id, landlord, payout),
        );

        Ok(())
    }

    /// Query rent stream details
    pub fn get_stream(env: Env, stream_id: u64) -> Result<RentStream, StreamError> {
        env.storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)
    }

    /// Read total number of streams created
    pub fn get_stream_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalStreams)
            .unwrap_or(0)
    }

    /// Tenant or Landlord pauses rent stream pending habitability / maintenance dispute
    pub fn pause_stream(
        env: Env,
        stream_id: u64,
        caller: Address,
    ) -> Result<(), StreamError> {
        caller.require_auth();

        let mut stream: RentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;

        if stream.status != StreamStatus::Active {
            return Err(StreamError::InvalidState);
        }

        if caller != stream.tenant && caller != stream.landlord {
            return Err(StreamError::Unauthorized);
        }

        stream.status = StreamStatus::Paused;

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);
        env.storage().persistent().extend_ttl(
            &DataKey::Stream(stream_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("paused")),
            (stream_id, caller),
        );

        Ok(())
    }

    /// Resume an active rent stream after dispute resolution
    pub fn resume_stream(
        env: Env,
        stream_id: u64,
        caller: Address,
    ) -> Result<(), StreamError> {
        caller.require_auth();

        let mut stream: RentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;

        if stream.status != StreamStatus::Paused {
            return Err(StreamError::InvalidState);
        }

        if caller != stream.tenant && caller != stream.landlord {
            return Err(StreamError::Unauthorized);
        }

        stream.status = StreamStatus::Active;

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);
        env.storage().persistent().extend_ttl(
            &DataKey::Stream(stream_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("resumed")),
            (stream_id, caller),
        );

        Ok(())
    }
}
