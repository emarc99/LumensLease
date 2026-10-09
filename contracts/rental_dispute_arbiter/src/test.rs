#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, BytesN, Env, String,
};

#[test]
fn test_dispute_arbitration_lifecycle_with_quorum() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let arbiter1 = Address::generate(&env);
    let arbiter2 = Address::generate(&env);
    let arbiter3 = Address::generate(&env);

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    let contract_id = env.register_contract(None, RentalDisputeArbiterContract);
    let client = RentalDisputeArbiterContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    assert_eq!(client.get_arbitrator_count(), 0);
    assert_eq!(client.get_dispute_count(), 0);

    // 1. Register 3 accredited community arbitrators
    let org1 = String::from_str(&env, "Lagos Tenants Rights Union");
    let org2 = String::from_str(&env, "Estate Surveyors Board");
    let org3 = String::from_str(&env, "Community Housing Ombudsman");

    client.register_arbitrator(&admin, &arbiter1, &org1);
    client.register_arbitrator(&admin, &arbiter2, &org2);
    client.register_arbitrator(&admin, &arbiter3, &org3);

    assert_eq!(client.get_arbitrator_count(), 3);
    assert!(client.is_arbitrator(&arbiter1));
    assert!(client.is_arbitrator(&arbiter2));
    assert!(client.is_arbitrator(&arbiter3));

    // 2. Lodge a dispute for a ₦200,000 caution deposit with Move-In vs Move-Out photo hashes
    let caution_amount = 200_000_0000000i128;
    let move_in_hash = BytesN::from_array(&env, &[11u8; 32]);
    let move_out_hash = BytesN::from_array(&env, &[22u8; 32]);

    let dispute_id = client.lodge_dispute(
        &tenant,
        &101, // lease_id
        &tenant,
        &landlord,
        &caution_amount,
        &move_in_hash,
        &move_out_hash,
    );

    assert_eq!(dispute_id, 1);
    assert_eq!(client.get_dispute_count(), 1);

    let case = client.get_dispute(&1);
    assert_eq!(case.is_resolved, false);
    assert_eq!(case.final_verdict, DisputeVerdict::Pending);

    // 3. First arbitrator votes: RefundTenantFull
    let res1 = client.cast_vote(&arbiter1, &1, &DisputeVerdict::RefundTenantFull);
    assert_eq!(res1, DisputeVerdict::Pending); // 1 vote is not yet quorum (needs 2)

    let case_after_v1 = client.get_dispute(&1);
    assert_eq!(case_after_v1.votes_refund_tenant, 1);
    assert_eq!(case_after_v1.is_resolved, false);

    // 4. Second arbitrator votes: RefundTenantFull -> Quorum reached!
    let res2 = client.cast_vote(&arbiter2, &1, &DisputeVerdict::RefundTenantFull);
    assert_eq!(res2, DisputeVerdict::RefundTenantFull);

    let case_resolved = client.get_dispute(&1);
    assert_eq!(case_resolved.is_resolved, true);
    assert_eq!(case_resolved.final_verdict, DisputeVerdict::RefundTenantFull);
    assert_eq!(case_resolved.tenant_payout, caution_amount); // 100% to tenant
    assert_eq!(case_resolved.landlord_payout, 0);
}

#[test]
fn test_dispute_split_fifty_fifty_ruling() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let arbiter1 = Address::generate(&env);
    let arbiter2 = Address::generate(&env);
    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    let contract_id = env.register_contract(None, RentalDisputeArbiterContract);
    let client = RentalDisputeArbiterContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    let org = String::from_str(&env, "Neutral Panel");
    client.register_arbitrator(&admin, &arbiter1, &org);
    client.register_arbitrator(&admin, &arbiter2, &org);

    let caution = 100_000_0000000i128;
    let h1 = BytesN::from_array(&env, &[1u8; 32]);
    let h2 = BytesN::from_array(&env, &[2u8; 32]);

    client.lodge_dispute(&landlord, &202, &tenant, &landlord, &caution, &h1, &h2);

    client.cast_vote(&arbiter1, &1, &DisputeVerdict::SplitFiftyFifty);
    let verdict = client.cast_vote(&arbiter2, &1, &DisputeVerdict::SplitFiftyFifty);

    assert_eq!(verdict, DisputeVerdict::SplitFiftyFifty);
    let case = client.get_dispute(&1);
    assert_eq!(case.is_resolved, true);
    assert_eq!(case.tenant_payout, 50_000_0000000i128);
    assert_eq!(case.landlord_payout, 50_000_0000000i128);
}

#[test]
fn test_escrow_config_and_appeal() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let escrow = Address::generate(&env);
    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    let contract_id = env.register_contract(None, RentalDisputeArbiterContract);
    let client = RentalDisputeArbiterContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    client.set_escrow_contract(&admin, &escrow);
    assert_eq!(client.get_escrow_contract(), escrow);

    let caution = 100_000_0000000i128;
    let h1 = BytesN::from_array(&env, &[1u8; 32]);
    let h2 = BytesN::from_array(&env, &[2u8; 32]);

    let dispute_id = client.lodge_dispute(&tenant, &555, &tenant, &landlord, &caution, &h1, &h2);

    // Tenant lodges supplementary photo evidence appeal
    let appeal_hash = BytesN::from_array(&env, &[99u8; 32]);
    client.submit_appeal_evidence(&tenant, &dispute_id, &appeal_hash);
}

