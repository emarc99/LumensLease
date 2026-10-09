#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient},
    Address, BytesN, Env, String,
};

fn setup_test() -> (
    Env,
    PropertyMaintenanceVaultContractClient<'static>,
    Address,
    Address,
    Address,
    Address,
    TokenClient<'static>,
    StellarAssetClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let landlord = Address::generate(&env);
    let tenant = Address::generate(&env);
    let technician = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();
    let token_client = TokenClient::new(&env, &token_id);
    let stellar_token = StellarAssetClient::new(&env, &token_id);

    let contract_id = env.register_contract(None, PropertyMaintenanceVaultContract);
    let client = PropertyMaintenanceVaultContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    (
        env,
        client,
        admin,
        landlord,
        tenant,
        technician,
        token_client,
        stellar_token,
    )
}

#[test]
fn test_vault_creation_and_topup() {
    let (env, client, _admin, landlord, _tenant, _technician, token_client, stellar_token) =
        setup_test();

    let initial_reserve = 500_0000000i128; // 500 USDC
    stellar_token.mint(&landlord, &1000_0000000);

    let prop_id = String::from_str(&env, "prop-bodija-penthouse");
    client.create_vault(&landlord, &prop_id, &initial_reserve);

    let vault = client.get_vault(&prop_id);
    assert_eq!(vault.vault_balance, initial_reserve);
    assert_eq!(vault.landlord, landlord);
    assert_eq!(token_client.balance(&client.address), initial_reserve);

    // Top up reserve with 200 USDC
    let topup = 200_0000000i128;
    let new_balance = client.deposit_reserve(&landlord, &prop_id, &topup);
    assert_eq!(new_balance, initial_reserve + topup);
    assert_eq!(token_client.balance(&client.address), initial_reserve + topup);
}

#[test]
fn test_repair_ticket_approval_and_disbursement() {
    let (env, client, _admin, landlord, tenant, technician, token_client, stellar_token) =
        setup_test();

    let initial_reserve = 300_0000000i128;
    stellar_token.mint(&landlord, &initial_reserve);

    let prop_id = String::from_str(&env, "prop-lekki-villa");
    client.create_vault(&landlord, &prop_id, &initial_reserve);

    // Tenant files ticket: Broken solar inverter capacitor (80 USDC)
    let estimated_cost = 80_0000000i128;
    let desc = String::from_str(&env, "Solar inverter fault error 04");
    let evidence_hash = BytesN::from_array(&env, &[11u8; 32]);

    let ticket_id = client.file_repair_ticket(
        &tenant,
        &prop_id,
        &estimated_cost,
        &technician,
        &desc,
        &evidence_hash,
        &false,
    );

    assert_eq!(ticket_id, 1);
    assert_eq!(client.get_ticket_count(), 1);

    let ticket = client.get_ticket(&ticket_id);
    assert_eq!(ticket.status, TicketStatus::Pending);

    // Landlord approves ticket
    client.approve_repair_ticket(&landlord, &ticket_id);

    // Funds automatically disbursed to technician
    assert_eq!(token_client.balance(&technician), estimated_cost);
    let vault_after = client.get_vault(&prop_id);
    assert_eq!(vault_after.vault_balance, initial_reserve - estimated_cost);
    assert_eq!(vault_after.total_spent, estimated_cost);

    let ticket_approved = client.get_ticket(&ticket_id);
    assert_eq!(ticket_approved.status, TicketStatus::Approved);

    // Technician marks completed with invoice hash
    let comp_hash = BytesN::from_array(&env, &[99u8; 32]);
    client.complete_repair_ticket(&technician, &ticket_id, &comp_hash);

    let ticket_done = client.get_ticket(&ticket_id);
    assert_eq!(ticket_done.status, TicketStatus::Completed);
    assert_eq!(ticket_done.completion_hash, comp_hash);
}

#[test]
fn test_emergency_repair_execution() {
    let (env, client, _admin, landlord, tenant, technician, token_client, stellar_token) =
        setup_test();

    let reserve = 200_0000000i128;
    stellar_token.mint(&landlord, &reserve);

    let prop_id = String::from_str(&env, "prop-yaba-loft");
    client.create_vault(&landlord, &prop_id, &reserve);

    // Emergency ticket: Borehole pump burnt out, zero water in compound
    let cost = 120_0000000i128;
    let desc = String::from_str(&env, "Emergency: Borehole submerged pump burnt out");
    let evidence_hash = BytesN::from_array(&env, &[77u8; 32]);

    let ticket_id = client.file_repair_ticket(
        &tenant,
        &prop_id,
        &cost,
        &technician,
        &desc,
        &evidence_hash,
        &true, // is_emergency
    );

    // Premature execution before 48h fails
    let fail_res = client.try_execute_emergency_repair(&tenant, &ticket_id);
    assert!(fail_res.is_err());

    // Advance ledger past 48h (172,800s)
    let now = env.ledger().timestamp();
    env.ledger().set_timestamp(now + 172_801);

    // Now emergency execution succeeds
    client.execute_emergency_repair(&tenant, &ticket_id);

    assert_eq!(token_client.balance(&technician), cost);
    let ticket = client.get_ticket(&ticket_id);
    assert_eq!(ticket.status, TicketStatus::EmergencyExecuted);
}
