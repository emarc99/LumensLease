#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, BytesN, Env, String,
};

fn setup_test() -> (
    Env,
    CommunityScoutVerifierContractClient<'static>,
    Address,
    Address,
    Address,
    TokenClient<'static>,
    StellarAssetClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let scout = Address::generate(&env);
    let challenger = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = token_contract.address();
    let token_client = TokenClient::new(&env, &token_id);
    let stellar_token = StellarAssetClient::new(&env, &token_id);

    let contract_id = env.register_contract(None, CommunityScoutVerifierContract);
    let client = CommunityScoutVerifierContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    (
        env,
        client,
        admin,
        scout,
        challenger,
        token_client,
        stellar_token,
    )
}

#[test]
fn test_scout_registration_and_audit() {
    let (env, client, _admin, scout, _challenger, token_client, stellar_token) = setup_test();

    let stake = 100_0000000i128; // 100 USDC stake
    stellar_token.mint(&scout, &stake);

    client.register_scout(&scout, &stake);

    assert_eq!(client.get_total_scouts(), 1);
    let profile = client.get_scout(&scout);
    assert_eq!(profile.stake_amount, stake);
    assert_eq!(profile.is_active, true);
    assert_eq!(token_client.balance(&client.address), stake);

    let prop_id = String::from_str(&env, "prop-surulere-flat2");
    let meter = String::from_str(&env, "CNLG-90214-LAG");
    let gps_hash = BytesN::from_array(&env, &[12u8; 32]);
    let visual_hash = BytesN::from_array(&env, &[34u8; 32]);

    client.submit_physical_audit(
        &scout,
        &prop_id,
        &meter,
        &8, // 8 kVA solar
        &gps_hash,
        &visual_hash,
        &25_0000000i128, // 25 USDC bounty
    );

    assert_eq!(client.get_total_audits(), 1);
    let audit = client.get_audit(&prop_id);
    assert_eq!(audit.status, AuditStatus::Verified);
    assert_eq!(audit.solar_kva_rating, 8);
    assert_eq!(audit.conlog_meter_sn, meter);
}

#[test]
fn test_bounty_claim() {
    let (env, client, _admin, scout, _challenger, token_client, stellar_token) = setup_test();

    let stake = 100_0000000i128;
    let bounty = 30_0000000i128;
    stellar_token.mint(&scout, &stake);
    stellar_token.mint(&client.address, &bounty); // Fund contract bounty pool

    client.register_scout(&scout, &stake);

    let prop_id = String::from_str(&env, "prop-ikeja-05");
    let meter = String::from_str(&env, "CNLG-44123-IKJ");
    let h1 = BytesN::from_array(&env, &[1u8; 32]);
    let h2 = BytesN::from_array(&env, &[2u8; 32]);

    client.submit_physical_audit(&scout, &prop_id, &meter, &10, &h1, &h2, &bounty);

    // Scout claims bounty after lease executed
    client.claim_bounty(&scout, &prop_id);

    let audit = client.get_audit(&prop_id);
    assert_eq!(audit.status, AuditStatus::BountyClaimed);
    assert_eq!(token_client.balance(&scout), bounty);
}

#[test]
fn test_challenge_and_slashing() {
    let (env, client, admin, scout, challenger, token_client, stellar_token) = setup_test();

    let stake = 100_0000000i128;
    stellar_token.mint(&scout, &stake);
    client.register_scout(&scout, &stake);

    let prop_id = String::from_str(&env, "prop-fake-listing-99");
    let meter = String::from_str(&env, "CNLG-FAKE");
    let h1 = BytesN::from_array(&env, &[5u8; 32]);
    let h2 = BytesN::from_array(&env, &[6u8; 32]);

    client.submit_physical_audit(&scout, &prop_id, &meter, &0, &h1, &h2, &0);

    // Tenant / Challenger reports property is a vacant lot / ghost listing!
    let fraud_proof = BytesN::from_array(&env, &[77u8; 32]);
    client.challenge_audit(&challenger, &prop_id, &fraud_proof);

    let audit_challenged = client.get_audit(&prop_id);
    assert_eq!(audit_challenged.status, AuditStatus::Challenged);

    // Admin / Jury confirms fraud: Scout is slashed, stake awarded to whistleblower!
    client.resolve_challenge(&admin, &prop_id, &true);

    let audit_resolved = client.get_audit(&prop_id);
    assert_eq!(audit_resolved.status, AuditStatus::FraudConfirmed);
    assert_eq!(token_client.balance(&challenger), stake); // Whistleblower paid!

    let prof = client.get_scout(&scout);
    assert_eq!(prof.is_active, false);
    assert_eq!(prof.slashed_count, 1);
    assert_eq!(prof.stake_amount, 0);
}
