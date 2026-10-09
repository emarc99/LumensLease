#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, BytesN, Env, String,
};

#[test]
fn test_reputation_and_audit_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let landlord = Address::generate(&env);

    let contract_id = env.register_contract(None, LandlordReputationContract);
    let client = LandlordReputationContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    assert_eq!(client.get_total_landlords(), 0);

    // 1. Register landlord
    let name = String::from_str(&env, "Chief Adeleke");
    client.register_landlord(&landlord, &name, &true);

    assert_eq!(client.get_total_landlords(), 1);
    let profile = client.get_landlord(&landlord);
    assert_eq!(profile.name, name);
    assert_eq!(profile.is_verified_owner, true);
    assert_eq!(profile.trust_score, 80); // Verified landlord starts at 80

    // 2. Record property visual inspection audit proof
    let prop_id = String::from_str(&env, "prop-bodija-01");
    let meter = String::from_str(&env, "dedicated_prepaid");
    let audit_hash = BytesN::from_array(&env, &[42u8; 32]);

    client.record_property_audit(&landlord, &prop_id, &meter, &16, &5, &audit_hash);

    let audit = client.get_property_audit(&prop_id);
    assert_eq!(audit.grid_hours, 16);
    assert_eq!(audit.solar_kva, 5);
    assert_eq!(audit.visual_audit_hash, audit_hash);
    assert!(client.verify_audit_hash(&prop_id, &audit_hash));

    // 3. Complete lease with clean refund: score increases (+5)
    let new_score = client.record_lease_outcome(&admin, &landlord, &true);
    assert_eq!(new_score, 85);

    let profile2 = client.get_landlord(&landlord);
    assert_eq!(profile2.successful_refunds, 1);
    assert_eq!(profile2.trust_score, 85);

    // 4. Bad-faith dispute: score penalized (-15)
    let disputed_score = client.record_lease_outcome(&admin, &landlord, &false);
    assert_eq!(disputed_score, 70);
}
