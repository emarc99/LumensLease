#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, BytesN,
    Env, String,
};

#[cfg(test)]
mod test;

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days
const EMERGENCY_SLA_SECONDS: u64 = 172_800; // 48 hours for landlord response on emergency

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum MaintenanceError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    VaultNotFound = 4,
    TicketNotFound = 5,
    InvalidAmount = 6,
    InvalidState = 7,
    EmergencySlaNotExpired = 8,
    InsufficientVaultBalance = 9,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum TicketStatus {
    Pending = 0,
    Approved = 1,
    Completed = 2,
    Rejected = 3,
    EmergencyExecuted = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MaintenanceVault {
    pub property_id: String,
    pub landlord: Address,
    pub vault_balance: i128,
    pub total_spent: i128,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RepairTicket {
    pub ticket_id: u64,
    pub property_id: String,
    pub tenant: Address,
    pub estimated_cost: i128,
    pub technician: Address,
    pub description: String,
    pub evidence_hash: BytesN<32>,
    pub completion_hash: BytesN<32>,
    pub is_emergency: bool,
    pub status: TicketStatus,
    pub created_at: u64,
    pub disbursed_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PaymentToken,
    Vault(String),
    Ticket(u64),
    TicketCounter,
}

#[contract]
pub struct PropertyMaintenanceVaultContract;

#[contractimpl]
impl PropertyMaintenanceVaultContract {
    /// Initialize the Property Maintenance Vault protocol with admin and settlement token (USDC/XLM)
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), MaintenanceError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(MaintenanceError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PaymentToken, &token);
        env.storage().instance().set(&DataKey::TicketCounter, &0u64);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("maint"), symbol_short!("init")),
            (admin, token),
        );

        Ok(())
    }

    /// Create or initialize a property maintenance reserve vault
    pub fn create_vault(
        env: Env,
        caller: Address,
        property_id: String,
        initial_deposit: i128,
    ) -> Result<(), MaintenanceError> {
        caller.require_auth();

        if env.storage().persistent().has(&DataKey::Vault(property_id.clone())) {
            return Err(MaintenanceError::InvalidState);
        }

        if initial_deposit > 0 {
            let token_addr: Address = env
                .storage()
                .instance()
                .get(&DataKey::PaymentToken)
                .ok_or(MaintenanceError::NotInitialized)?;

            let token_client = token::Client::new(&env, &token_addr);
            token_client.transfer(&caller, &env.current_contract_address(), &initial_deposit);
        }

        let vault = MaintenanceVault {
            property_id: property_id.clone(),
            landlord: caller.clone(),
            vault_balance: initial_deposit,
            total_spent: 0,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Vault(property_id.clone()), &vault);
        env.storage().persistent().extend_ttl(
            &DataKey::Vault(property_id.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("maint"), symbol_short!("created")),
            (property_id, caller, initial_deposit),
        );

        Ok(())
    }

    /// Deposit funds into the property maintenance reserve
    pub fn deposit_reserve(
        env: Env,
        caller: Address,
        property_id: String,
        amount: i128,
    ) -> Result<i128, MaintenanceError> {
        caller.require_auth();

        if amount <= 0 {
            return Err(MaintenanceError::InvalidAmount);
        }

        let mut vault: MaintenanceVault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(property_id.clone()))
            .ok_or(MaintenanceError::VaultNotFound)?;

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(MaintenanceError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&caller, &env.current_contract_address(), &amount);

        vault.vault_balance += amount;

        env.storage().persistent().set(&DataKey::Vault(property_id.clone()), &vault);
        env.storage().persistent().extend_ttl(
            &DataKey::Vault(property_id.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("maint"), symbol_short!("topup")),
            (property_id, caller, amount, vault.vault_balance),
        );

        Ok(vault.vault_balance)
    }

    /// Tenant files a maintenance / repair ticket with photo evidence hash and technician address
    pub fn file_repair_ticket(
        env: Env,
        caller: Address,
        property_id: String,
        estimated_cost: i128,
        technician: Address,
        description: String,
        evidence_hash: BytesN<32>,
        is_emergency: bool,
    ) -> Result<u64, MaintenanceError> {
        caller.require_auth();

        if estimated_cost <= 0 {
            return Err(MaintenanceError::InvalidAmount);
        }

        if !env.storage().persistent().has(&DataKey::Vault(property_id.clone())) {
            return Err(MaintenanceError::VaultNotFound);
        }

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TicketCounter)
            .unwrap_or(0);
        counter += 1;

        let empty_hash = BytesN::from_array(&env, &[0u8; 32]);

        let ticket = RepairTicket {
            ticket_id: counter,
            property_id: property_id.clone(),
            tenant: caller.clone(),
            estimated_cost,
            technician: technician.clone(),
            description,
            evidence_hash,
            completion_hash: empty_hash,
            is_emergency,
            status: TicketStatus::Pending,
            created_at: env.ledger().timestamp(),
            disbursed_at: 0,
        };

        env.storage().persistent().set(&DataKey::Ticket(counter), &ticket);
        env.storage().persistent().extend_ttl(
            &DataKey::Ticket(counter),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.storage().instance().set(&DataKey::TicketCounter, &counter);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("ticket"), symbol_short!("filed")),
            (counter, property_id, estimated_cost, is_emergency),
        );

        Ok(counter)
    }

    /// Landlord approves repair ticket; funds automatically disburse to technician
    pub fn approve_repair_ticket(
        env: Env,
        caller: Address,
        ticket_id: u64,
    ) -> Result<(), MaintenanceError> {
        caller.require_auth();

        let mut ticket: RepairTicket = env
            .storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_id))
            .ok_or(MaintenanceError::TicketNotFound)?;

        if ticket.status != TicketStatus::Pending {
            return Err(MaintenanceError::InvalidState);
        }

        let mut vault: MaintenanceVault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(ticket.property_id.clone()))
            .ok_or(MaintenanceError::VaultNotFound)?;

        if caller != vault.landlord {
            return Err(MaintenanceError::Unauthorized);
        }

        if vault.vault_balance < ticket.estimated_cost {
            return Err(MaintenanceError::InsufficientVaultBalance);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(MaintenanceError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &ticket.technician, &ticket.estimated_cost);

        vault.vault_balance -= ticket.estimated_cost;
        vault.total_spent += ticket.estimated_cost;
        ticket.status = TicketStatus::Approved;
        ticket.disbursed_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Vault(ticket.property_id.clone()), &vault);
        env.storage().persistent().set(&DataKey::Ticket(ticket_id), &ticket);

        env.events().publish(
            (symbol_short!("ticket"), symbol_short!("approved")),
            (ticket_id, ticket.technician, ticket.estimated_cost),
        );

        Ok(())
    }

    /// Tenant executes emergency repair release if landlord fails to respond within 48h SLA
    pub fn execute_emergency_repair(
        env: Env,
        caller: Address,
        ticket_id: u64,
    ) -> Result<(), MaintenanceError> {
        caller.require_auth();

        let mut ticket: RepairTicket = env
            .storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_id))
            .ok_or(MaintenanceError::TicketNotFound)?;

        if ticket.status != TicketStatus::Pending {
            return Err(MaintenanceError::InvalidState);
        }

        if !ticket.is_emergency {
            return Err(MaintenanceError::Unauthorized);
        }

        if caller != ticket.tenant {
            return Err(MaintenanceError::Unauthorized);
        }

        let now = env.ledger().timestamp();
        if now < ticket.created_at + EMERGENCY_SLA_SECONDS {
            return Err(MaintenanceError::EmergencySlaNotExpired);
        }

        let mut vault: MaintenanceVault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(ticket.property_id.clone()))
            .ok_or(MaintenanceError::VaultNotFound)?;

        if vault.vault_balance < ticket.estimated_cost {
            return Err(MaintenanceError::InsufficientVaultBalance);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::PaymentToken)
            .ok_or(MaintenanceError::NotInitialized)?;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &ticket.technician, &ticket.estimated_cost);

        vault.vault_balance -= ticket.estimated_cost;
        vault.total_spent += ticket.estimated_cost;
        ticket.status = TicketStatus::EmergencyExecuted;
        ticket.disbursed_at = now;

        env.storage().persistent().set(&DataKey::Vault(ticket.property_id.clone()), &vault);
        env.storage().persistent().set(&DataKey::Ticket(ticket_id), &ticket);

        env.events().publish(
            (symbol_short!("ticket"), symbol_short!("emergency")),
            (ticket_id, ticket.technician, ticket.estimated_cost),
        );

        Ok(())
    }

    /// Technician or Landlord marks repair completed with completion evidence hash
    pub fn complete_repair_ticket(
        env: Env,
        caller: Address,
        ticket_id: u64,
        completion_hash: BytesN<32>,
    ) -> Result<(), MaintenanceError> {
        caller.require_auth();

        let mut ticket: RepairTicket = env
            .storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_id))
            .ok_or(MaintenanceError::TicketNotFound)?;

        if ticket.status != TicketStatus::Approved && ticket.status != TicketStatus::EmergencyExecuted {
            return Err(MaintenanceError::InvalidState);
        }

        let vault: MaintenanceVault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(ticket.property_id.clone()))
            .ok_or(MaintenanceError::VaultNotFound)?;

        if caller != ticket.technician && caller != vault.landlord && caller != ticket.tenant {
            return Err(MaintenanceError::Unauthorized);
        }

        ticket.completion_hash = completion_hash.clone();
        ticket.status = TicketStatus::Completed;

        env.storage().persistent().set(&DataKey::Ticket(ticket_id), &ticket);
        env.storage().persistent().extend_ttl(
            &DataKey::Ticket(ticket_id),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("ticket"), symbol_short!("done")),
            (ticket_id, caller, completion_hash),
        );

        Ok(())
    }

    /// Get maintenance vault details
    pub fn get_vault(env: Env, property_id: String) -> Result<MaintenanceVault, MaintenanceError> {
        env.storage()
            .persistent()
            .get(&DataKey::Vault(property_id))
            .ok_or(MaintenanceError::VaultNotFound)
    }

    /// Get repair ticket details
    pub fn get_ticket(env: Env, ticket_id: u64) -> Result<RepairTicket, MaintenanceError> {
        env.storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_id))
            .ok_or(MaintenanceError::TicketNotFound)
    }

    /// Get total tickets filed count
    pub fn get_ticket_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TicketCounter)
            .unwrap_or(0)
    }
}
