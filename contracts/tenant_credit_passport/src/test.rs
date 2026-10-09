#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, BytesN, Env,
};

#[test]
fn test_tenant_credit_passport_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    let contract_id = env.register_contract(None, TenantCreditPassportContract);
    let client = TenantCreditPassportContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    assert_eq!(client.get_total_tenants(), 0);

    // 1. Register tenant with biometric / national ID hash
    let id_hash = BytesN::from_array(&env, &[12u8; 32]);
    client.register_tenant(&tenant, &id_hash);

    assert_eq!(client.get_total_tenants(), 1);
    let profile = client.get_tenant_profile(&tenant);
    assert_eq!(profile.credit_score, 500);
    assert_eq!(profile.tier, CreditTier::Bronze);
    assert_eq!(profile.qualifies_for_monthly_rent, false);
    assert_eq!(client.is_eligible_for_monthly_rent(&tenant), false);

    // 2. Record 15 on-time monthly rent payments (+10 points each = +150 points -> 650, Silver tier)
    for i in 1..=15 {
        client.record_payment(&landlord, &tenant, &i, &100_000, &true);
    }

    let profile2 = client.get_tenant_profile(&tenant);
    assert_eq!(profile2.credit_score, 650);
    assert_eq!(profile2.tier, CreditTier::Silver);
    assert_eq!(profile2.on_time_payments_streak, 15);
    assert_eq!(client.is_eligible_for_monthly_rent(&tenant), false); // Needs 680

    // 3. Complete lease with clean caution deposit refund (+25 points -> 675, Gold tier)
    client.record_lease_completion(&landlord, &tenant, &1, &true);

    let profile3 = client.get_tenant_profile(&tenant);
    assert_eq!(profile3.credit_score, 675);
    assert_eq!(profile3.tier, CreditTier::Gold);

    // 4. One more on-time payment (+10 points -> 685, Gold tier)
    // Now reaches 685 -> Qualifies for Monthly Rent!
    client.record_payment(&landlord, &tenant, &2, &100_000, &true);

    let profile4 = client.get_tenant_profile(&tenant);
    assert_eq!(profile4.credit_score, 685);
    assert_eq!(profile4.qualifies_for_monthly_rent, true);
    assert_eq!(client.is_eligible_for_monthly_rent(&tenant), true);

    // 5. Payment history has 16 items
    let history = client.get_payment_history(&tenant);
    assert_eq!(history.len(), 16);
}

#[test]
fn test_default_penalizes_credit_score() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let tenant = Address::generate(&env);
    let caller = Address::generate(&env);

    let contract_id = env.register_contract(None, TenantCreditPassportContract);
    let client = TenantCreditPassportContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    let id_hash = BytesN::from_array(&env, &[1u8; 32]);
    client.register_tenant(&tenant, &id_hash);

    // Default on lease (-50 points -> 450)
    client.record_lease_completion(&caller, &tenant, &1, &false);

    let profile = client.get_tenant_profile(&tenant);
    assert_eq!(profile.credit_score, 450);
    assert_eq!(profile.disputes_count, 1);
    assert_eq!(profile.tier, CreditTier::Bronze);
}

#[test]
fn test_guarantor_and_income_verification() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let tenant = Address::generate(&env);
    let guarantor = Address::generate(&env);

    let contract_id = env.register_contract(None, TenantCreditPassportContract);
    let client = TenantCreditPassportContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    let id_hash = BytesN::from_array(&env, &[1u8; 32]);
    client.register_tenant(&tenant, &id_hash);

    // Initial score = 500
    // Attaching guarantor gives +20 points -> 520
    let score = client.attach_guarantor(&tenant, &guarantor);
    assert_eq!(score, 520);
    assert_eq!(client.get_tenant_guarantor(&tenant), Some(guarantor));

    // Attach employer income proof hash
    let emp_hash = BytesN::from_array(&env, &[88u8; 32]);
    client.attach_income_verification(&tenant, &emp_hash);
    assert_eq!(client.get_income_verification(&tenant), Some(emp_hash));
}

