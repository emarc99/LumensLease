#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_initialize_and_create_deed() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TenancyDeedRegistry);
    let client = TenancyDeedRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let landlord = Address::generate(&env);
    let tenant = Address::generate(&env);

    client.initialize(&admin);

    let dummy_hash = BytesN::from_array(&env, &[1u8; 32]);
    let title = String::from_str(&env, "Bodija 2-Bed Flat");
    let addr = String::from_str(&env, "Plot 14, UI Road, Bodija, Ibadan");

    let now = env.ledger().timestamp();
    let start = now;
    let end = now + 365 * 86400;

    let input = DeedInput {
        landlord: landlord.clone(),
        tenant: tenant.clone(),
        property_title: title,
        property_address: addr,
        annual_rent_stroops: 1_200_000_0000000,
        caution_deposit_stroops: 120_000_0000000,
        start_timestamp: start,
        end_timestamp: end,
        legal_terms_hash: dummy_hash.clone(),
        hardware_specs_hash: dummy_hash.clone(),
    };

    // Landlord creates deed
    let deed_id = client.create_deed(&landlord, &input);

    assert_eq!(deed_id, 1);
    let deed = client.get_deed(&deed_id);
    assert_eq!(deed.landlord_signed, true);
    assert_eq!(deed.tenant_signed, false);
    assert_eq!(deed.status, DeedStatus::LandlordSigned);
    assert_eq!(client.get_total_deeds(), 1);
}

#[test]
fn test_dual_signatures_and_address_proof() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TenancyDeedRegistry);
    let client = TenancyDeedRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let landlord = Address::generate(&env);
    let tenant = Address::generate(&env);

    client.initialize(&admin);

    let dummy_hash = BytesN::from_array(&env, &[2u8; 32]);
    let title = String::from_str(&env, "Lekki Phase 1 Studio");
    let addr = String::from_str(&env, "Admiralty Way, Lekki, Lagos");

    let now = env.ledger().timestamp();
    let start = now;
    let end = now + 180 * 86400;

    let input = DeedInput {
        landlord: landlord.clone(),
        tenant: tenant.clone(),
        property_title: title,
        property_address: addr,
        annual_rent_stroops: 800_000_0000000,
        caution_deposit_stroops: 80_000_0000000,
        start_timestamp: start,
        end_timestamp: end,
        legal_terms_hash: dummy_hash.clone(),
        hardware_specs_hash: dummy_hash.clone(),
    };

    // Tenant creates deed
    let deed_id = client.create_deed(&tenant, &input);

    let mut deed = client.get_deed(&deed_id);
    assert_eq!(deed.tenant_signed, true);
    assert_eq!(deed.landlord_signed, false);
    assert_eq!(deed.status, DeedStatus::TenantSigned);

    // Landlord signs
    client.sign_deed_landlord(&deed_id, &landlord);

    deed = client.get_deed(&deed_id);
    assert_eq!(deed.landlord_signed, true);
    assert_eq!(deed.status, DeedStatus::FullyExecuted);

    // Proof of address passes
    assert_eq!(client.verify_address_proof(&tenant), true);
    assert_eq!(client.get_tenant_active_deed(&tenant), Some(deed_id));

    // Terminate
    client.terminate_deed(&deed_id, &tenant);
    deed = client.get_deed(&deed_id);
    assert_eq!(deed.status, DeedStatus::Terminated);
    assert_eq!(client.verify_address_proof(&tenant), false);
}

#[test]
fn test_deed_amendment() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TenancyDeedRegistry);
    let client = TenancyDeedRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let landlord = Address::generate(&env);
    let tenant = Address::generate(&env);

    client.initialize(&admin);

    let dummy_hash = BytesN::from_array(&env, &[5u8; 32]);
    let title = String::from_str(&env, "Yaba Tech Hub Loft");
    let addr = String::from_str(&env, "Herbert Macaulay Way, Yaba");

    let now = env.ledger().timestamp();
    let input = DeedInput {
        landlord: landlord.clone(),
        tenant: tenant.clone(),
        property_title: title,
        property_address: addr,
        annual_rent_stroops: 1_000_000_0000000,
        caution_deposit_stroops: 100_000_0000000,
        start_timestamp: now,
        end_timestamp: now + 365 * 86400,
        legal_terms_hash: dummy_hash.clone(),
        hardware_specs_hash: dummy_hash.clone(),
    };

    let deed_id = client.create_deed(&landlord, &input);
    client.sign_deed_tenant(&deed_id, &tenant);

    // Add amendment (e.g. solar backup battery addendum)
    let amendment_hash = BytesN::from_array(&env, &[99u8; 32]);
    client.add_deed_amendment(&deed_id, &landlord, &amendment_hash);

    let amendments = client.get_deed_amendments(&deed_id);
    assert_eq!(amendments.len(), 1);
    assert_eq!(amendments.get(0).unwrap(), amendment_hash);
}

