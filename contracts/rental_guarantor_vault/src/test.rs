#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env,
};

fn setup_test() -> (
    Env,
    RentalGuarantorVaultContractClient<'static>,
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
    let guarantor = Address::generate(&env);
    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();
    let token_client = TokenClient::new(&env, &token_id);
    let stellar_token = StellarAssetClient::new(&env, &token_id);

    let contract_id = env.register_contract(None, RentalGuarantorVaultContract);
    let client = RentalGuarantorVaultContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    (
        env,
        client,
        admin,
        guarantor,
        tenant,
        landlord,
        token_client,
        stellar_token,
    )
}

#[test]
fn test_guarantor_registration_and_stake() {
    let (_env, client, _admin, guarantor, tenant, landlord, token_client, stellar_token) =
        setup_test();

    let max_capacity = 5000_0000000i128; // 5,000 USDC backing pool
    client.register_guarantor(&guarantor, &max_capacity);

    let profile = client.get_guarantor(&guarantor);
    assert_eq!(profile.max_backing_amount, max_capacity);
    assert_eq!(profile.active_bonded_amount, 0);

    // Stake 1,000 USDC for tenant on lease 101
    let bond_amt = 1000_0000000i128;
    stellar_token.mint(&guarantor, &bond_amt);

    let bond_id = client.stake_bond(&guarantor, &101, &tenant, &landlord, &bond_amt);
    assert_eq!(bond_id, 1);
    assert_eq!(client.get_bond_count(), 1);
    assert_eq!(client.get_bond_by_lease(&101), Some(1));

    let bond = client.get_bond(&bond_id);
    assert_eq!(bond.status, BondStatus::Active);
    assert_eq!(bond.bond_amount, bond_amt);
    assert_eq!(token_client.balance(&client.address), bond_amt);

    let prof_after = client.get_guarantor(&guarantor);
    assert_eq!(prof_after.active_bonded_amount, bond_amt);
    assert_eq!(prof_after.total_backed_leases, 1);
}

#[test]
fn test_guarantor_bond_release_on_completion() {
    let (_env, client, _admin, guarantor, tenant, landlord, token_client, stellar_token) =
        setup_test();

    client.register_guarantor(&guarantor, &3000_0000000);

    let bond_amt = 800_0000000i128;
    stellar_token.mint(&guarantor, &bond_amt);

    let bond_id = client.stake_bond(&guarantor, &202, &tenant, &landlord, &bond_amt);

    // Lease completes cleanly: landlord or guarantor releases bond
    client.release_bond(&bond_id, &landlord);

    let bond = client.get_bond(&bond_id);
    assert_eq!(bond.status, BondStatus::Released);
    assert_eq!(token_client.balance(&guarantor), bond_amt); // Guarantor gets funds back

    let prof = client.get_guarantor(&guarantor);
    assert_eq!(prof.active_bonded_amount, 0);
    assert_eq!(prof.successful_releases, 1);
}

#[test]
fn test_landlord_claims_defaulted_guarantor_bond() {
    let (_env, client, _admin, guarantor, tenant, landlord, token_client, stellar_token) =
        setup_test();

    client.register_guarantor(&guarantor, &2000_0000000);

    let bond_amt = 500_0000000i128;
    stellar_token.mint(&guarantor, &bond_amt);

    let bond_id = client.stake_bond(&guarantor, &303, &tenant, &landlord, &bond_amt);

    // Tenant absconds/defaults: Landlord liquidates surety bond
    client.claim_defaulted_bond(&bond_id, &landlord);

    let bond = client.get_bond(&bond_id);
    assert_eq!(bond.status, BondStatus::ClaimedDefault);
    assert_eq!(token_client.balance(&landlord), bond_amt); // Landlord made whole

    let prof = client.get_guarantor(&guarantor);
    assert_eq!(prof.active_bonded_amount, 0);
    assert_eq!(prof.defaulted_count, 1);
}
