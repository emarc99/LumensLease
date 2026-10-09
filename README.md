# 🏢 LumensLease
**Decentralized Rental Trust & Caution Deposit Escrow Protocol on Stellar & Soroban.**

> **Lock in your verified home. Lock out the middleman. Secure your deposit on Soroban.**  
> Built for the **Stellar Ecosystem** & targeted for the **Stellar Community Fund (SCF)**.

[![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-08B5E5?logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban%20Rust-black?logo=rust)](https://soroban.stellar.org)
[![Settlement](https://img.shields.io/badge/Settlement-Stellar%20USDC%20%7C%20cNGN-2775CA)](https://stellar.org)
[![Live Frontend](https://img.shields.io/badge/Live%20App-CloudFront%20Edge-orange)](https://d3oldfajqt8tgt.cloudfront.net)
[![Middleman Fees](https://img.shields.io/badge/Agent%20Markups-0%25-brightgreen)](https://d3oldfajqt8tgt.cloudfront.net/calculator/)

---

## 🔗 Live Deployments & Endpoints

* **Global Web Application**: [https://d3oldfajqt8tgt.cloudfront.net](https://d3oldfajqt8tgt.cloudfront.net)  
  *(Alternative S3 Mirror: [http://lumenslease-stellar-226579698869.s3-website-us-east-1.amazonaws.com](http://lumenslease-stellar-226579698869.s3-website-us-east-1.amazonaws.com))*
* **Landlord Voice Studio**: [https://d3oldfajqt8tgt.cloudfront.net/studio/](https://d3oldfajqt8tgt.cloudfront.net/studio/)
* **Rental Escrow Protocol Console**: [https://d3oldfajqt8tgt.cloudfront.net/escrow/](https://d3oldfajqt8tgt.cloudfront.net/escrow/)
* **Tenant Credit Passport**: [https://d3oldfajqt8tgt.cloudfront.net/passport/](https://d3oldfajqt8tgt.cloudfront.net/passport/)
* **Dispute Arbitration Jury Room**: [https://d3oldfajqt8tgt.cloudfront.net/arbitration/](https://d3oldfajqt8tgt.cloudfront.net/arbitration/)
* **Middleman Savings Calculator**: [https://d3oldfajqt8tgt.cloudfront.net/calculator/](https://d3oldfajqt8tgt.cloudfront.net/calculator/)

### 📜 Deployed 10-Contract Soroban Suite on Stellar Testnet

| # | Smart Contract | Testnet Contract ID | Explorer Link | Core Role in LumensLease |
| :- | :--- | :--- | :--- | :--- |
| **01** | `soroban_rental_escrow` | [`CBW7X3JMND3R3JBVUUIPREXW3L2QAB2OISCSE4XHNFKUNVTOBKD6JETN`](https://stellar.expert/explorer/testnet/contract/CBW7X3JMND3R3JBVUUIPREXW3L2QAB2OISCSE4XHNFKUNVTOBKD6JETN) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBW7X3JMND3R3JBVUUIPREXW3L2QAB2OISCSE4XHNFKUNVTOBKD6JETN) | Non-custodial caution deposit locks, lease funding & statutory releases |
| **02** | `landlord_reputation` | [`CAETU7N2Y62QYKAAM22Z54RDGMJKQTVKYIX6MHXMAEUYC2FWD5SDXPKE`](https://stellar.expert/explorer/testnet/contract/CAETU7N2Y62QYKAAM22Z54RDGMJKQTVKYIX6MHXMAEUYC2FWD5SDXPKE) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAETU7N2Y62QYKAAM22Z54RDGMJKQTVKYIX6MHXMAEUYC2FWD5SDXPKE) | 0–100 Landlord trust scores, physical title history & violation reports |
| **03** | `tenant_credit_passport` | [`CCYZMG5TED7KI2UAVZYLZHGB2KMJIVEGMYQXXR4ZTWAN5XTOHQQILXT3`](https://stellar.expert/explorer/testnet/contract/CCYZMG5TED7KI2UAVZYLZHGB2KMJIVEGMYQXXR4ZTWAN5XTOHQQILXT3) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCYZMG5TED7KI2UAVZYLZHGB2KMJIVEGMYQXXR4ZTWAN5XTOHQQILXT3) | Rent-to-Credit scoring (300–850), monthly rent gating & guarantor links |
| **04** | `rental_dispute_arbiter` | [`CCA4NJKOADMF273XQ77FVBJEHPSOHKCQA36LUKTWBAEU6COZYHXWR3MP`](https://stellar.expert/explorer/testnet/contract/CCA4NJKOADMF273XQ77FVBJEHPSOHKCQA36LUKTWBAEU6COZYHXWR3MP) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCA4NJKOADMF273XQ77FVBJEHPSOHKCQA36LUKTWBAEU6COZYHXWR3MP) | 2-of-3 community juror panel voting on Move-In/Move-Out SHA-256 diffs |
| **05** | `tenancy_deed_registry` | [`CABCZ2EHEO62ONIVWILIBVR5AVNTBGOSXM6DI3FXKAGKEL5HSZMU2IVI`](https://stellar.expert/explorer/testnet/contract/CABCZ2EHEO62ONIVWILIBVR5AVNTBGOSXM6DI3FXKAGKEL5HSZMU2IVI) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CABCZ2EHEO62ONIVWILIBVR5AVNTBGOSXM6DI3FXKAGKEL5HSZMU2IVI) | Dual-signed Soulbound Token (SBT) Tenancy Deeds & Proof of Address |
| **06** | `rent_stream_vault` | [`CAG43Q6I7OFHOTAKJG5RIHMXU6N3G5YSE5AXCFEMHGISGXEIC6OGDVN4`](https://stellar.expert/explorer/testnet/contract/CAG43Q6I7OFHOTAKJG5RIHMXU6N3G5YSE5AXCFEMHGISGXEIC6OGDVN4) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAG43Q6I7OFHOTAKJG5RIHMXU6N3G5YSE5AXCFEMHGISGXEIC6OGDVN4) | Micro-rent monthly streaming vault with automated default buffers |
| **07** | `property_maintenance_vault` | [`CAHEZNOJ4ZKA5WFLIL6UL5KIMPXJ4LBXGR26LEB6FGNTQCGXJIM76SAH`](https://stellar.expert/explorer/testnet/contract/CAHEZNOJ4ZKA5WFLIL6UL5KIMPXJ4LBXGR26LEB6FGNTQCGXJIM76SAH) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAHEZNOJ4ZKA5WFLIL6UL5KIMPXJ4LBXGR26LEB6FGNTQCGXJIM76SAH) | 48-Hour Emergency SLA repair vault & direct certified technician disbursements |
| **08** | `rental_guarantor_vault` | [`CBF4YBDXUP3WWD2AG2XIE3MB5EL6QKUFIZTO4TJ4TYNEWXS4NH47J3MK`](https://stellar.expert/explorer/testnet/contract/CBF4YBDXUP3WWD2AG2XIE3MB5EL6QKUFIZTO4TJ4TYNEWXS4NH47J3MK) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBF4YBDXUP3WWD2AG2XIE3MB5EL6QKUFIZTO4TJ4TYNEWXS4NH47J3MK) | Co-signer surety stakes backing tenants with score < 650 with return guarantee |
| **09** | `community_scout_verifier` | [`CA7COEZNMG7UXNGH53SSV5GTNMUTHFEJU7AZQJYPUWOM5EEVMFLDKCFK`](https://stellar.expert/explorer/testnet/contract/CA7COEZNMG7UXNGH53SSV5GTNMUTHFEJU7AZQJYPUWOM5EEVMFLDKCFK) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CA7COEZNMG7UXNGH53SSV5GTNMUTHFEJU7AZQJYPUWOM5EEVMFLDKCFK) | Physical on-site property audits (Conlog meter, solar kVA, GPS coordinates) |
| **10** | `utility_billing_escrow` | [`CA4JVBFM6QCHP4KJG6A5U2UUNAAIGDE4JIPZTNK66SKIAQZBSANWXQQI`](https://stellar.expert/explorer/testnet/contract/CA4JVBFM6QCHP4KJG6A5U2UUNAAIGDE4JIPZTNK66SKIAQZBSANWXQQI) | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CA4JVBFM6QCHP4KJG6A5U2UUNAAIGDE4JIPZTNK66SKIAQZBSANWXQQI) | Automated multi-tenant shared diesel generator and grid prepay pool |

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
| **1. Voice Intake** | Open [`/studio`](https://d3oldfajqt8tgt.cloudfront.net/studio/) and click **Preset 1 (Chief Adeleke)** or record audio | Real-time waveform pulses, Nigerian accent normalization extracts `₦1,600,000 / yr • 2 Beds • Solar Inverter • 16h Light`. |
| **2. CV & Scout Audit** | In [`/studio`](https://d3oldfajqt8tgt.cloudfront.net/studio/), inspect the property photo audit | Real-time bounding boxes detect Conlog prepaid meter, solar bank, and on-site scout bounty verification. |
| **3. Middleman Savings** | Visit [`/calculator`](https://d3oldfajqt8tgt.cloudfront.net/calculator/) | Dynamic slider proves **₦320,000 saved** by eliminating 10% agency + 10% legal rackets. |
| **4. Caution Escrow Console** | Visit [`/escrow`](https://d3oldfajqt8tgt.cloudfront.net/escrow/) | Live console managing caution locks, 48h emergency SLA repairs, diesel pooling, and surety bonds on Soroban. |
| **5. Credit Passport** | Visit [`/passport`](https://d3oldfajqt8tgt.cloudfront.net/passport/) | Sovereign 300–850 credit passport unlocking monthly rent, co-signer bonds, and ZK salary proofs. |
| **6. Community Jury** | Visit [`/arbitration`](https://d3oldfajqt8tgt.cloudfront.net/arbitration/) | 2-of-3 quorum community jury voting on Move-In vs Move-Out photo diffs. |
| **7. Statutory Agreement** | Open any property dossier & click **Generate Agreement** | Court-ready tenancy lease renders with statutory terms, ₦0 commission seal, and SHA-256 verification. |

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
