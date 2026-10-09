#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, BytesN, Env, String,
};

fn setup_test() -> (
    Env,
    UtilityBillingEscrowContractClient<'static>,
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
    let manager = Address::generate(&env);
    let tenant1 = Address::generate(&env);
    let vendor = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();
    let token_client = TokenClient::new(&env, &token_id);
    let stellar_token = StellarAssetClient::new(&env, &token_id);

    let contract_id = env.register_contract(None, UtilityBillingEscrowContract);
    let client = UtilityBillingEscrowContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    (
        env,
        client,
        admin,
        manager,
        tenant1,
        vendor,
        token_client,
        stellar_token,
    )
}

#[test]
fn test_create_pool_and_contribute() {
    let (env, client, _admin, manager, tenant1, _vendor, token_client, stellar_token) =
        setup_test();

    let prop_id = String::from_str(&env, "prop-bodija-quadplex");
    let target = 400_0000000i128; // 400 USDC monthly pool
    let util_name = String::from_str(&env, "Diesel Generator & Solar Maintenance");

    let pool_id = client.create_utility_pool(&manager, &prop_id, &target, &util_name);
    assert_eq!(pool_id, 1);
    assert_eq!(client.get_pool_count(), 1);

    // Tenant 1 deposits their 100 USDC share
    let share = 100_0000000i128;
    stellar_token.mint(&tenant1, &share);

    let new_bal = client.contribute_share(&pool_id, &tenant1, &share);
    assert_eq!(new_bal, share);
    assert_eq!(client.get_tenant_contribution(&pool_id, &tenant1), share);
    assert_eq!(token_client.balance(&client.address), share);

    let pool = client.get_pool(&pool_id);
    assert_eq!(pool.current_balance, share);
    assert_eq!(pool.status, PoolStatus::Active);
}

#[test]
fn test_disburse_utility_payment() {
    let (env, client, _admin, manager, tenant1, vendor, token_client, stellar_token) = setup_test();

    let prop_id = String::from_str(&env, "prop-lekki-compound");
    let target = 500_0000000i128;
    let util_name = String::from_str(&env, "Prepaid NEPA Power Token Pool");

    let pool_id = client.create_utility_pool(&manager, &prop_id, &target, &util_name);

    let share = 250_0000000i128;
    stellar_token.mint(&tenant1, &share);
    client.contribute_share(&pool_id, &tenant1, &share);

    // Manager disburses 200 USDC to Disco Prepaid Vendor with receipt hash
    let disburse_amt = 200_0000000i128;
    let receipt_hash = BytesN::from_array(&env, &[88u8; 32]);

    client.disburse_utility_payment(&pool_id, &manager, &vendor, &disburse_amt, &receipt_hash);

    assert_eq!(token_client.balance(&vendor), disburse_amt);
    let pool = client.get_pool(&pool_id);
    assert_eq!(pool.current_balance, share - disburse_amt);
    assert_eq!(pool.total_disbursed, disburse_amt);
}

#[test]
fn test_refund_surplus_share() {
    let (env, client, _admin, manager, tenant1, _vendor, token_client, stellar_token) = setup_test();

    let prop_id = String::from_str(&env, "prop-yaba-compound");
    let target = 300_0000000i128;
    let util_name = String::from_str(&env, "Estate Water Supply Levies");

    let pool_id = client.create_utility_pool(&manager, &prop_id, &target, &util_name);

    let share = 150_0000000i128;
    stellar_token.mint(&tenant1, &share);
    client.contribute_share(&pool_id, &tenant1, &share);

    // Tenant relocates before month end; manager refunds remaining 50 USDC surplus
    let refund_amt = 50_0000000i128;
    client.refund_surplus_share(&pool_id, &manager, &tenant1, &refund_amt);

    assert_eq!(token_client.balance(&tenant1), refund_amt);
    let pool = client.get_pool(&pool_id);
    assert_eq!(pool.current_balance, 100_0000000i128);
}
