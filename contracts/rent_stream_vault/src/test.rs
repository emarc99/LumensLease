#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env,
};

#[test]
fn test_create_fund_and_claim_stream() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();
    let token_client = TokenClient::new(&env, &token_id);
    let stellar_token = StellarAssetClient::new(&env, &token_id);

    let contract_id = env.register_contract(None, RentStreamVaultContract);
    let client = RentStreamVaultContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    // Monthly: 100 USDC, Buffer: 100 USDC, Total: 3 months
    let monthly_amount = 100_0000000i128;
    let buffer_amount = 100_0000000i128;
    let total_months = 3u32;

    stellar_token.mint(&tenant, &(monthly_amount * 3 + buffer_amount));
    assert_eq!(token_client.balance(&tenant), monthly_amount * 3 + buffer_amount);

    let stream_id = client.create_stream(
        &tenant,
        &tenant,
        &landlord,
        &monthly_amount,
        &buffer_amount,
        &total_months,
    );
    assert_eq!(stream_id, 1);

    // Tenant funds initial installment + buffer (200 USDC)
    client.fund_initial_stream(&stream_id, &tenant);
    let mut stream = client.get_stream(&stream_id);
    assert_eq!(stream.vault_balance, 200_0000000i128);
    assert_eq!(stream.status, StreamStatus::Active);

    // Landlord claims Month 1
    client.claim_installment(&stream_id, &landlord);
    assert_eq!(token_client.balance(&landlord), monthly_amount);
    stream = client.get_stream(&stream_id);
    assert_eq!(stream.months_claimed, 1);
    assert_eq!(stream.vault_balance, buffer_amount); // 100 USDC buffer remaining

    // Tenant tops up for Month 2 and Month 3 (200 USDC)
    client.top_up_stream(&stream_id, &tenant, &(monthly_amount * 2));
    stream = client.get_stream(&stream_id);
    assert_eq!(stream.vault_balance, 300_0000000i128);

    // Landlord claims Month 2
    client.claim_installment(&stream_id, &landlord);
    assert_eq!(token_client.balance(&landlord), monthly_amount * 2);

    // Landlord claims Month 3 (final month!)
    client.claim_installment(&stream_id, &landlord);
    assert_eq!(token_client.balance(&landlord), monthly_amount * 3);

    // Stream completes and remaining buffer (100 USDC) is returned to tenant
    stream = client.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Completed);
    assert_eq!(stream.vault_balance, 0);
    assert_eq!(token_client.balance(&tenant), buffer_amount);
}

#[test]
fn test_default_buffer_payout() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();
    let token_client = TokenClient::new(&env, &token_id);
    let stellar_token = StellarAssetClient::new(&env, &token_id);

    let contract_id = env.register_contract(None, RentStreamVaultContract);
    let client = RentStreamVaultContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    let monthly_amount = 150_0000000i128;
    let buffer_amount = 50_0000000i128; // Buffer is 50 USDC
    let total_months = 6u32;

    stellar_token.mint(&tenant, &(monthly_amount + buffer_amount));

    let stream_id = client.create_stream(
        &tenant,
        &tenant,
        &landlord,
        &monthly_amount,
        &buffer_amount,
        &total_months,
    );

    client.fund_initial_stream(&stream_id, &tenant);

    // Landlord claims Month 1
    client.claim_installment(&stream_id, &landlord);
    assert_eq!(token_client.balance(&landlord), monthly_amount);

    // Tenant does not top up! Vault only has buffer (150 USDC) which is < monthly_amount to proceed next claim
    // Landlord triggers default buffer payout
    client.claim_default_buffer(&stream_id, &landlord);
    assert_eq!(token_client.balance(&landlord), monthly_amount + buffer_amount);

    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Defaulted);
}
