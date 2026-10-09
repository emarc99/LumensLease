#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, BytesN, Env, String,
};

fn setup_test() -> (
    Env,
    RentalEscrowContractClient<'static>,
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

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = TokenClient::new(&env, &token_contract.address());
    let token_admin_client = StellarAssetClient::new(&env, &token_contract.address());

    let contract_id = env.register_contract(None, RentalEscrowContract);
    let client = RentalEscrowContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_contract.address());

    (
        env,
        client,
        admin,
        landlord,
        tenant,
        token_client,
        token_admin_client,
    )
}

#[test]
fn test_initialization() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token = Address::generate(&env);

    let contract_id = env.register_contract(None, RentalEscrowContract);
    let client = RentalEscrowContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token);

    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_payment_token(), token);
    assert_eq!(client.get_lease_count(), 0);

    // Double initialization should fail
    let res = client.try_initialize(&admin, &token);
    assert!(res.is_err());
}

#[test]
fn test_create_lease_and_verify_hash() {
    let (env, client, _admin, landlord, tenant, _token_client, _token_admin_client) = setup_test();

    let rent = 1_600_000_0000000i128; // 1,600,000 units in 7 decimals
    let caution = 160_000_0000000i128; // 10% caution deposit
    let duration_days = 365u64;

    let hash_bytes = [7u8; 32];
    let property_hash = BytesN::from_array(&env, &hash_bytes);

    let lease_id = client.create_lease(
        &tenant,
        &landlord,
        &rent,
        &caution,
        &duration_days,
        &property_hash,
    );

    assert_eq!(lease_id, 1);
    assert_eq!(client.get_lease_count(), 1);

    let lease = client.get_lease(&1);
    assert_eq!(lease.lease_id, 1);
    assert_eq!(lease.tenant, tenant);
    assert_eq!(lease.landlord, landlord);
    assert_eq!(lease.rent_amount, rent);
    assert_eq!(lease.caution_deposit, caution);
    assert_eq!(lease.status, EscrowStatus::Created);
    assert_eq!(lease.property_hash, property_hash);

    assert!(client.verify_property_hash(&1, &property_hash));
    let wrong_hash = BytesN::from_array(&env, &[9u8; 32]);
    assert!(!client.verify_property_hash(&1, &wrong_hash));
}

#[test]
fn test_full_happy_path_lease_lifecycle() {
    let (env, client, _admin, landlord, tenant, token_client, token_admin_client) = setup_test();

    let rent = 1_000_000_0000000i128;
    let caution = 100_000_0000000i128;
    let total_required = rent + caution;

    // Mint funds to tenant
    token_admin_client.mint(&tenant, &total_required);
    assert_eq!(token_client.balance(&tenant), total_required);

    let hash = BytesN::from_array(&env, &[1u8; 32]);
    let lease_id = client.create_lease(&tenant, &landlord, &rent, &caution, &365, &hash);

    // 1. Tenant funds the escrow
    client.fund_lease(&lease_id, &tenant);
    let lease = client.get_lease(&lease_id);
    assert_eq!(lease.status, EscrowStatus::Funded);
    assert_eq!(token_client.balance(&tenant), 0);
    assert_eq!(token_client.balance(&client.address), total_required);

    // 2. Initial occupancy check passed: disburse rent to landlord
    client.disburse_rent(&lease_id, &tenant);
    let lease = client.get_lease(&lease_id);
    assert_eq!(lease.status, EscrowStatus::Active);
    assert!(lease.rent_disbursed);
    assert_eq!(token_client.balance(&landlord), rent);
    assert_eq!(token_client.balance(&client.address), caution); // Caution deposit remains locked

    // 3. Tenancy completed peacefully: Landlord signs off on caution deposit refund
    client.release_deposit(&lease_id, &landlord);
    let lease = client.get_lease(&lease_id);
    assert_eq!(lease.status, EscrowStatus::Completed);
    assert!(lease.deposit_released);
    assert_eq!(token_client.balance(&tenant), caution); // Tenant gets full caution back!
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_dispute_and_admin_arbitration() {
    let (env, client, admin, landlord, tenant, token_client, token_admin_client) = setup_test();

    let rent = 2_000_000_0000000i128;
    let caution = 200_000_0000000i128;
    let total = rent + caution;

    token_admin_client.mint(&tenant, &total);

    let hash = BytesN::from_array(&env, &[2u8; 32]);
    let lease_id = client.create_lease(&tenant, &landlord, &rent, &caution, &365, &hash);

    client.fund_lease(&lease_id, &tenant);
    client.disburse_rent(&lease_id, &landlord);

    // Landlord alleges damage at move-out
    let reason = String::from_str(&env, "Inverter battery bank damaged by tenant overload");
    client.raise_dispute(&lease_id, &landlord, &reason);

    let lease = client.get_lease(&lease_id);
    assert_eq!(lease.status, EscrowStatus::Disputed);

    // Admin arbitrates based on Move-in vs Move-out SHA-256 evidence:
    // Split: 75% returned to tenant, 25% paid to landlord for replacement
    let tenant_refund = 150_000_0000000i128;
    let landlord_payout = 50_000_0000000i128;

    client.resolve_dispute(&lease_id, &admin, &tenant_refund, &landlord_payout);

    let lease = client.get_lease(&lease_id);
    assert_eq!(lease.status, EscrowStatus::Completed);
    assert_eq!(token_client.balance(&tenant), tenant_refund);
    assert_eq!(token_client.balance(&landlord), rent + landlord_payout);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_invalid_amounts_fail() {
    let (env, client, _admin, landlord, tenant, _tc, _tac) = setup_test();
    let hash = BytesN::from_array(&env, &[0u8; 32]);

    // Negative or zero rent should fail
    let res = client.try_create_lease(&tenant, &landlord, &0, &100, &365, &hash);
    assert!(res.is_err());

    let res2 = client.try_create_lease(&tenant, &landlord, &-500, &100, &365, &hash);
    assert!(res2.is_err());
}
