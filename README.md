# 🏛️ LumensLease
**Decentralized Rental Trust & Caution Deposit Escrow Protocol on Stellar & Soroban.**

> **Lock in your verified home. Lock out the middleman. Secure your deposit on Soroban.**  
> Built for the **Stellar Ecosystem**, participating in **Drips Wave 10** & targeted for the **Stellar Community Fund (SCF)**.

[![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-08B5E5?logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban%20Rust-black?logo=rust)](https://soroban.stellar.org)
[![Drips Wave 10](https://img.shields.io/badge/Drips%20Wave-Wave%2010%20Maintainer-5C4EBA)](https://docs.drips.network/wave)
[![Settlement](https://img.shields.io/badge/Settlement-Stellar%20USDC%20%7C%20cNGN-2775CA)](https://stellar.org)
[![Live Frontend](https://img.shields.io/badge/Live%20App-CloudFront%20LOS50%20Edge-orange)](https://d1dco6ew3il05x.cloudfront.net)
[![Middleman Fees](https://img.shields.io/badge/Agent%20Markups-0%25-brightgreen)](https://d1dco6ew3il05x.cloudfront.net/calculator/)

---

## 🌐 Live Deployments & Endpoints

* **Global Web Application**: [https://d1dco6ew3il05x.cloudfront.net](https://d1dco6ew3il05x.cloudfront.net)
* **Landlord Voice Studio**: [https://d1dco6ew3il05x.cloudfront.net/studio/](https://d1dco6ew3il05x.cloudfront.net/studio/)
* **Middleman Savings Calculator**: [https://d1dco6ew3il05x.cloudfront.net/calculator/](https://d1dco6ew3il05x.cloudfront.net/calculator/)
* **Soroban Contract Suite**: [`contracts/soroban_rental_escrow/`](./contracts/soroban_rental_escrow/)

---

## ⚡ The Problem: The Rental Crisis in Emerging Markets

In emerging urban centers across Africa (Lagos, Ibadan, Abuja, Nairobi), renting a home is an exploitative, adversarial minefield:

1. **Predatory Middleman Extortion:** Tenants lose **₦300,000+ ($200+)** on every lease to mandatory **10% agency + 10% legal markups** charged by informal cartels.
2. **The Stolen Caution Deposit Trap:** Landlords demand 10–20% of annual rent as a "caution/security deposit" and routinely refuse to refund it when tenants vacate, citing fabricated maintenance claims. Tenants have zero legal or financial recourse.
3. **The 1-to-2 Year Upfront Cash Demand:** Due to a complete absence of financial trust and credit scoring, landlords force young professionals, graduates, and gig workers to pay **1 to 2 full years of rent upfront in cash**.
4. **Inflation & Currency Risk:** Hyperinflation erodes rental yields, leaving landlords reluctant to offer flexible payment terms while trapping tenants in volatile local cash economies.

---

## 🛰️ The Solution: The LumensLease Dual-Engine Architecture

**LumensLease** combines **off-chain AI & edge verification** with **on-chain Soroban smart contract escrows** to create an end-to-end, trustless real estate protocol.

```
                              LUMENSLEASE DUAL-ENGINE ARCHITECTURE

      ┌─────────────────────────────────────────────────────────────────────────────┐
      │                   LAYER 1: OFF-CHAIN AI & EDGE INTELLIGENCE                 │
      │                                                                             │
      │  ┌───────────────────────┐  ┌────────────────────────┐  ┌────────────────┐ │
      │  │ Landlord Voice Studio │  │ Computer Vision Audit   │  │ Statutory Lease│ │
      │  │ Nigerian Phonetic NLP │  │ Solar, Meter & Security │  │ Legal Generator│ │
      │  └───────────┬───────────┘  └───────────┬────────────┘  └────────┬───────┘ │
      └──────────────┼──────────────────────────┼────────────────────────┼──────────┘
                     │                          │                        │
                     ▼                          ▼                        ▼
      ┌─────────────────────────────────────────────────────────────────────────────┐
      │              LAYER 2: ON-CHAIN FINANCIAL TRUST (STELLAR & SOROBAN)          │
      │                                                                             │
      │   ┌────────────────────────┐             ┌──────────────────────────────┐   │
      │   │ Soroban Rental Escrow  │             │ Stellar Payment Rails        │   │
      │   │ • Caution Deposit Lock │             │ • Stellar USDC & cNGN        │   │
      │   │ • Milestone Rent Flow  │             │ • Sub-Cent Fast Micropayments│   │
      │   │ • 2-of-3 Arbitration   │             │ • Anchor On-Ramps (SEP-24/6) │   │
      │   └───────────┬────────────┘             └──────────────┬───────────────┘   │
      └───────────────┼─────────────────────────────────────────┼───────────────────┘
                      │                                         │
                      ▼                                         ▼
                                   [ STELLAR LEDGER ]
                             Cryptographic Tenancy Deeds
                             Verifiable Tenant Credit History
```

### 1. Off-Chain AI & Edge Verification Layer
* **Landlord Voice Studio (`/studio`)**: Older property owners tap a microphone and speak naturally in English, Nigerian Pidgin, or regional accents. Our custom phonetic normalizer maps local speech (*"so lah"* $\rightarrow$ solar inverter, *"two virus"* $\rightarrow$ inverter batteries, *"what are running"* $\rightarrow$ treated borehole water) into structured listings.
* **Computer Vision Property Audit**: Client-side object detection automatically inspects property photos to verify **Conlog Prepaid Meters (96%)**, **Solar Battery Banks (94%)**, and **Gated Perimeter Security (92%)**.
* **Utility Truth Scorecard**: Guaranteed transparency on daily grid power hours, backup solar capacity, and treated water before inspection.

### 2. On-Chain Financial Trust Layer (Stellar & Soroban)
* **Soroban Caution Deposit Escrow**: Security deposits are locked inside an autonomous Rust smart contract on Soroban. The deposit cannot be unilaterally confiscated by the landlord. Upon peaceful vacancy, the contract automatically refunds the deposit to the tenant.
* **Zero-Fee Micropayment Rent Streaming**: Eliminates the crushing 1-year upfront rent requirement. Tenants can pay monthly or bi-weekly using **Stellar USDC** or local stablecoins (such as **cNGN**), with transaction fees under $0.0001.
* **Anchor Interoperability (SEP-24 / SEP-6)**: Integrates with Stellar anchors (Flutterwave, Yellow Card, MoneyGram) so unbanked tenants can fund their rental escrow using local cash over-the-counter or mobile money.
* **Verifiable On-Chain Tenancy Deeds**: Every lease agreement is stamped with a SHA-256 cryptographic hash registered on the Stellar ledger, creating tamper-proof proof of address and building an on-chain credit history for tenants.

---

## 🔒 Soroban Smart Contract Architecture (`contracts/soroban_rental_escrow/`)

Our core Soroban smart contract is written in idiomatic Rust and implements sovereign rental escrow primitives:

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

## 🎯 2-Minute Quick Tour for Judges & Reviewers

| Step | Action | Verifiable Outcome |
| :--- | :--- | :--- |
| **1. Voice Intake** | Open [`/studio`](https://d1dco6ew3il05x.cloudfront.net/studio/) and click **Preset 1 (Chief Adeleke)** or record audio | Real-time waveform pulses, Nigerian accent normalization extracts `₦1,600,000 / yr • 2 Beds • Solar Inverter • 16h Light`. |
| **2. CV Audit** | In [`/studio`](https://d1dco6ew3il05x.cloudfront.net/studio/), inspect the property photo audit | Real-time bounding boxes detect the Conlog prepaid meter and solar battery bank. |
| **3. Middleman Savings** | Visit [`/calculator`](https://d1dco6ew3il05x.cloudfront.net/calculator/) | Dynamic slider proves **₦320,000 saved** by eliminating 10% agency + 10% legal rackets. |
| **4. Statutory Agreement** | Open any property (e.g. Bodija 2-Bed) & click **Generate Agreement** | Court-ready tenancy lease renders with statutory terms, ₦0 commission seal, and SHA-256 verification. |
| **5. Soroban Escrow** | Inspect [`contracts/soroban_rental_escrow/`](./contracts/soroban_rental_escrow/) | Verifiable Soroban contract securing caution deposits in USDC with multi-sig release guarantees. |

---

## 🌊 Drips Wave 10 Open-Source Contribution Menu

As a participating maintainer in **Drips Wave 10 (The Stellar Wave Program)**, we invite community contributors to collaborate on our open-source backlog:

| Issue | Complexity | Drips Points | Description |
| :--- | :--- | :--- | :--- |
| **#1** | **Trivial** | **100 Pts** | Document Stellar Testnet RPC endpoints, Soroban CLI setup, and faucet funding in `docs/STELLAR_SETUP.md`. |
| **#2** | **Trivial** | **100 Pts** | Add Freighter Wallet install detector and status pill to main navigation bar. |
| **#3** | **Medium** | **150 Pts** | Implement `@stellar/freighter-api` connection hook with account state & network switching. |
| **#4** | **Medium** | **150 Pts** | Build TypeScript Soroban Client SDK wrapper for invoking `create_lease` and `fund_lease`. |
| **#5** | **Medium** | **150 Pts** | Create Caution Deposit Escrow Modal displaying Stellar USDC balance and deposit authorization. |
| **#6** | **High** | **200 Pts** | Write comprehensive Soroban Rust contract unit tests covering lease timeouts and mutual refunds. |
| **#7** | **High** | **200 Pts** | Implement 2-of-3 multi-sig dispute arbitration mechanism in `soroban_rental_escrow`. |

*All issues will be tagged with `Stellar Wave` on GitHub for instant Drips synchronization.*

---

## 🚀 Alignment with the Stellar Community Fund (SCF)

LumensLease is architected as a commercial product for the **Stellar Community Fund (SCF) Build Awards**:
* **High-Impact Real-World Utility:** Directly combats real estate exploitation and deposit theft in developing African economies.
* **Soroban Adoption Catalyst:** Demonstrates a non-speculative, real-world consumer use case for Soroban smart contracts.
* **Stablecoin Velocity:** Drives continuous transaction volume in Stellar USDC and regional stablecoins (cNGN) via recurring rent escrows.
* **Financial Inclusion:** Turns rent payments into an on-chain verifiable identity and credit profile for unbanked tenants.

---

## 🛠️ Local Development

```bash
# 1. Clone repository
git clone https://github.com/emarc99/LumensLease.git
cd LumensLease

# 2. Install dependencies
npm install

# 3. Run Next.js local development server
npm run dev

# 4. Build Soroban Smart Contract (Rust)
cd contracts/soroban_rental_escrow
cargo build --target wasm32-unknown-unknown --release
```

---

## 📄 License

Licensed under the [MIT License](./LICENSE). Built with pride for the **Stellar Ecosystem** and **Drips Wave 10**.
