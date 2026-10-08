# Soroban Smart Contract Architecture

> **Contract Path:** `contracts/soroban_rental_escrow/`  
> **Target:** `wasm32-unknown-unknown`  
> **Network:** Stellar Testnet / Mainnet

---

## Overview

The **`soroban_rental_escrow`** contract is an autonomous, non-custodial rental trust and caution deposit escrow protocol built natively on Soroban (Stellar's smart contract platform). It replaces predatory real estate middlemen and unsecured landlord deposit accounts with an immutable, code-enforced financial agreement.

---

## Core Smart Contract Trait

Written in idiomatic Rust using the Soroban SDK:

```rust
pub trait RentalEscrowTrait {
    /// Initialize contract with admin address and accepted token (USDC / XLM)
    fn initialize(env: Env, admin: Address, token: Address);

    /// Create a new lease escrow agreement with cryptographic property digest
    fn create_lease(
        env: Env,
        tenant: Address,
        landlord: Address,
        rent_amount: i128,
        caution_deposit: i128,
        lease_duration_days: u64,
        property_hash: BytesN<32>,
    ) -> u64;

    /// Tenant deposits rent + caution deposit into the Soroban escrow
    fn fund_lease(env: Env, lease_id: u64, caller: Address);

    /// Disburse periodic rent to landlord after move-in verification
    fn disburse_rent(env: Env, lease_id: u64, caller: Address);

    /// Return caution deposit back to tenant upon verified completion
    fn release_deposit(env: Env, lease_id: u64, caller: Address);

    /// Trigger dispute arbitration if damage is claimed
    fn raise_dispute(env: Env, lease_id: u64, caller: Address, reason: String);

    /// Multi-sig arbitrator resolves disputed caution deposit
    fn resolve_dispute(
        env: Env,
        lease_id: u64,
        admin: Address,
        tenant_refund: i128,
        landlord_payout: i128,
    );
}
```

---

## State Machine & Lease Lifecycle

A lease progresses through strict, authenticated state transitions:

```
[ Created ]
     │
     ▼ (Tenant invokes fund_lease with token transfer)
[ Funded ]
     │
     ▼ (Inspection confirmed / move-in date)
[ Active ]
   ├──► [ Completed ] ──► (release_deposit refunds caution deposit to tenant)
   │
   └──► [ Disputed ]  ──► (resolve_dispute splits funds via multi-sig arbitration)
```

1. **`Created`**: Landlord or platform instantiates terms (rent amount, caution deposit, property hash digest, duration).
2. **`Funded`**: Tenant deposits caution deposit + upfront rent into the contract. Both parties' signatures are locked into contract storage.
3. **`Active`**: Tenancy is live. Rent can be disbursed to the landlord on agreed intervals or streams.
4. **`Completed`**: Tenancy terminates peacefully. The contract returns 100% of the caution deposit back to the tenant's wallet.
5. **`Disputed`**: If property damage is contested, funds are frozen until resolved through cryptographic evidence and multi-sig arbitration.

---

## Storage & Archival Management

* **Persistent Storage:** Used for `LeaseAgreement` state records to ensure tenancy terms remain archived and recoverable throughout multi-year lease periods.
* **Instance Storage:** Used for protocol configuration, token address references, and administrator keys.
* **Storage TTL Maintenance:** State entries are extended using `env.storage().persistent().extend_ttl()` to prevent premature archival during the lease lifespan.

---

## Local Compilation & Testing

```bash
# Navigate to the contract directory
cd contracts/soroban_rental_escrow

# Build the WebAssembly binary
cargo build --target wasm32-unknown-unknown --release

# Run unit tests
cargo test
```
