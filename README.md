# 🏢 LumensLease
**Decentralized Rental Trust & Caution Deposit Escrow Protocol on Stellar & Soroban.**

> **Lock in your verified home. Lock out the middleman. Secure your deposit on Soroban.**  
> Built for the **Stellar Ecosystem** & targeted for the **Stellar Community Fund (SCF)**.

[![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-08B5E5?logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban%20Rust-black?logo=rust)](https://soroban.stellar.org)
[![Settlement](https://img.shields.io/badge/Settlement-Stellar%20USDC%20%7C%20cNGN-2775CA)](https://stellar.org)
[![Live Frontend](https://img.shields.io/badge/Live%20App-CloudFront%20LOS50%20Edge-orange)](https://d1dco6ew3il05x.cloudfront.net)
[![Middleman Fees](https://img.shields.io/badge/Agent%20Markups-0%25-brightgreen)](https://d1dco6ew3il05x.cloudfront.net/calculator/)

---

## 🔗 Live Deployments & Endpoints

* **Global Web Application**: [https://d1dco6ew3il05x.cloudfront.net](https://d1dco6ew3il05x.cloudfront.net)
* **Deployed Soroban Contract (Stellar Testnet)**: [`CBK6CZCHOUNZOPBYZCIVFUVUAVBGIBLUOY3KPB4RQL6ISMQQKJYZYYZE`](https://stellar.expert/explorer/testnet/contract/CBK6CZCHOUNZOPBYZCIVFUVUAVBGIBLUOY3KPB4RQL6ISMQQKJYZYYZE)
* **Contract Deploy Transaction**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/21d6fa783d747820b26e9924c0d3586ddd9ee88b069766d1627255bd99896528)
* **Landlord Voice Studio**: [https://d1dco6ew3il05x.cloudfront.net/studio/](https://d1dco6ew3il05x.cloudfront.net/studio/)
* **Middleman Savings Calculator**: [https://d1dco6ew3il05x.cloudfront.net/calculator/](https://d1dco6ew3il05x.cloudfront.net/calculator/)
* **Soroban Contract Suite**: [`contracts/soroban_rental_escrow/`](./contracts/soroban_rental_escrow/)

---

## ⚡ Protocol Roadmap & Specifications

* 🗺️ **[Protocol Roadmap & Milestones](./docs/ROADMAP.md)**: Real phase statuses (Phase 0 partially completed, Phase 1 ongoing) and P1/P2/P3 priorities.

---

## 🛑 The Problem: The Rental Crisis in Emerging Markets

In emerging urban centers across Africa (Lagos, Ibadan, Abuja, Nairobi), renting a home is an exploitative, adversarial minefield:

1. **Predatory Middleman Extortion:** Tenants lose **₦300,000+ ($200+)** on every lease to mandatory **10% agency + 10% legal markups** charged by informal cartels.
2. **The Stolen Caution Deposit Trap:** Landlords demand 10–20% of annual rent as a "caution/security deposit" and routinely refuse to refund it when tenants vacate, citing fabricated maintenance claims. Tenants have zero legal or financial recourse.
3. **The 1-to-2 Year Upfront Cash Demand:** Due to a complete absence of financial trust and credit scoring, landlords force young professionals, graduates, and gig workers to pay **1 to 2 full years of rent upfront in cash**.
4. **Inflation & Currency Risk:** Hyperinflation erodes rental yields, leaving landlords reluctant to offer flexible payment terms while trapping tenants in volatile local cash economies.

---

## 🏛️ The Solution: The LumensLease Dual-Engine Architecture

**LumensLease** combines **off-chain AI & edge verification** with **on-chain Soroban smart contract escrows** to create an end-to-end, trustless real estate protocol.

```
                              LUMENSLEASE DUAL-ENGINE ARCHITECTURE
                      Decentralized Rental Trust & Caution Deposit Escrow

 +-----------------------------------------------------------------------------------------+
 |                      LAYER 1: OFF-CHAIN AI & EDGE INTELLIGENCE                          |
 |                                                                                         |
 |  +--------------------------+  +--------------------------+  +-----------------------+  |
 |  |  Landlord Voice Studio   |  |   Computer Vision Audit  |  |   Statutory Contract  |  |
 |  | • Nigerian Phonetic NLP  |  | • Conlog Meter Inspection|  | • Legal Lease Draft   |  |
 |  | • Pidgin Audio Pipeline  |  | • Solar/Inverter Detect  |  | • SHA-256 Digest      |  |
 |  | • Voice-to-Listing Agent |  | • Move-In/Out Delta Diff |  | • Utility Truth Card  |  |
 |  +--------------------------+  +--------------------------+  +-----------------------+  |
 +-----------------------------------------------------------------------------------------+
               │                                │                              │
               │ Cryptographic Lease Digest     │ Damage Evidence Hashes       │ WebAuthn /
               │ (Property SHA-256)             │ (Inspection Audit State)     │ Biometric Sig
               ▼                                ▼                              ▼
 +-----------------------------------------------------------------------------------------+
 |             LAYER 2: ON-CHAIN FINANCIAL TRUST & PROTOCOL ENGINE (STELLAR & SOROBAN)     |
 |                                                                                         |
 |  +--------------------------------------------+  +------------------------------------+ |
 |  |      SOROBAN RENTAL ESCROW PROTOCOL        |  |     STELLAR LIQUIDITY & RAMPS      | |
 |  | • Non-Custodial Caution Deposit Lock       |  | • Stellar USDC & cNGN Settlement   | |
 |  | • Milestone / Micro-Rent Streaming         |  | • Reflector Oracle (NGN/USD Feeds) | |
 |  | • 2-of-3 Multi-Sig Dispute Arbitration     |  | • Soroswap / Phoenix DEX Swaps     | |
 |  | • Persistent Storage TTL & Rent Extension  |  | • Anchor Ramps (SEP-24, 6, 38)     | |
 |  +--------------------------------------------+  +------------------------------------+ |
 |                                       │                                                 |
 |  +-----------------------------------------------------------------------------------+  |
 |  |                      ACCOUNT ABSTRACTION & IDENTITY LAYER                         |  |
 |  |  • Soroban Passkey Kit (FaceID/TouchID)  • SEP-10 WebAuth  • SEP-30 Key Recovery  |  |
 |  +-----------------------------------------------------------------------------------+  |
 +-----------------------------------------------------------------------------------------+
                                         │
                                         ▼
                            [ STELLAR CONSENSUS LEDGER ]
                     • Immutable Tenancy Deeds & Evidence Hashes
                     • Trustless Caution Deposit Escrow Balance
                     • Verifiable On-Chain Tenant Credit & Reputation
```

### 1. Off-Chain AI & Edge Verification Layer
* **Landlord Voice Studio (`/studio`)**: Older property owners tap a microphone and speak naturally in English, Nigerian Pidgin, or regional accents. Our custom phonetic normalizer maps local speech (*"so lah"* $\rightarrow$ solar inverter, *"two virus"* $\rightarrow$ inverter batteries, *"what are running"* $\rightarrow$ treated borehole water) into structured listings.
* **Computer Vision Property Audit (`src/lib/computerVision.ts`)**: Client-side canvas inspection and feature detection automatically verify **Prepaid Meters**, **Solar Battery Banks**, and **Gated Compound Security** directly from uploaded images, creating a move-in baseline to evaluate future damage claims.
* **Statutory Lease Generator & Cryptographic Digest**: Auto-generates court-ready legal lease documents bound to a **SHA-256 digest** (`property_hash`), immutably tying the physical property condition to the on-chain escrow.

### 2. On-Chain Financial Trust Layer (Stellar & Soroban)
* **Soroban Caution Deposit Escrow**: Security deposits are locked inside an autonomous Rust smart contract on Soroban ([`contracts/soroban_rental_escrow/`](./contracts/soroban_rental_escrow/)). The deposit cannot be unilaterally confiscated by the landlord. Upon peaceful vacancy, the contract automatically refunds the deposit to the tenant.
* **Account Abstraction via Soroban Passkey Kit**: Eliminates seed phrases and browser extensions. Renters and landlords sign agreements and release funds using smartphone biometrics (**FaceID / TouchID**), underpinned by **SEP-10** cryptographic auth and **SEP-30** account recovery servers.
* **Reflector Oracle Price Feeds**: Connects decentralized price feeds for `cNGN / USD` and `XLM / USD`, allowing leases to be negotiated in local Naira while escrowing and disbursing in inflation-hedged **Stellar USDC**.
* **Soroswap / Phoenix DEX Swaps**: Enables atomic in-contract token routing, allowing tenants to pay rent in any supported Stellar asset (`cNGN`, `XLM`) while landlords receive pure USDC.
* **Anchor Banking Rails (SEP-24 / SEP-6 / SEP-38)**: Integrates with regulated African Stellar anchors so unbanked tenants can fund their rental escrow directly via Nigerian bank transfers, USSD, or cash over-the-counter.
* **Verifiable On-Chain Tenancy Deeds**: Every lease agreement and completed rent cycle is recorded on the Stellar ledger, building an undeniable on-chain credit and address history for tenants.

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

## 💻 Local Development

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

Licensed under the [MIT License](./LICENSE). Built with pride for the **Stellar Ecosystem**.
