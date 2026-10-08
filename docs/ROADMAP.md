# LumensLease Protocol Roadmap

> **Mission:** Building the decentralized rental trust and caution deposit escrow standard for emerging markets using Stellar and Soroban.

---

## 🏛️ Phase 0: Off-Chain AI Intake & Property Audit Engine
**Status:** `Partially Completed`

* **What Is Built:**
  * ✅ **Web Speech API Voice Capture:** Real-time waveform audio recording with authentic Nigerian Pidgin and English presets (`Chief Adeleke`, `Madam Bassey`, `Alhaji Danladi`).
  * ✅ **Client-Side Computer Vision Engine (`src/lib/computerVision.ts`):** HTML5 Canvas pixel inspection, luminance profiling, edge detection, and automated hardware recognition (Conlog prepaid meters, solar inverter battery banks, gated perimeters).
  * ✅ **Fullstack Marketplace UI:** High-contrast 90s retro-tech design system with interactive "Light & Utility Truth Scorecards" (grid hours, solar backup, borehole water).
  * ✅ **Direct Communication & Legal Generator:** Real-time landlord-tenant messaging room and statutory zero-commission tenancy agreement generator with SHA-256 cryptographic verification.
* **Remaining / In-Flight in Phase 0:**
  * 🔄 **Production Multimodal Audio Pipeline:** Streaming Whisper / cloud speech-to-text model integration to replace browser-only Web Speech API limits.
  * 🔄 **Move-In vs. Move-Out Visual Delta Inspection:** Automated visual diffing between move-in and exit photos to detect true wear-and-tear vs. tenant damage.
  * 🔄 **Cloud & Decentralized Media Persistence:** IPFS / cloud storage pipeline for persistent property evidence and inspection logs.

---

## 🔒 Phase 1: Core Soroban Escrow Architecture
**Status:** `Ongoing (Active Implementation)`

* **What Is Built:**
  * ✅ **Soroban Smart Contract Core (`contracts/soroban_rental_escrow/`):** Idiomatic Rust contract defining sovereign lease state machines (`Created` → `Funded` → `Active` → `Completed` / `Disputed`).
  * ✅ **Financial Escrow Logic:** Non-custodial deposit locking, periodic rent release, mutual refund mechanisms, and multi-party arbitration handlers.
  * ✅ **Frontend Stellar Client Adapter (`src/lib/stellar.ts`):** Freighter wallet detection, Testnet RPC configuration, and stroop-to-token mathematical converters.
* **Remaining / In-Flight in Phase 1:**
  * 🔄 **Rust Contract Test Suite:** Comprehensive test harness (`cargo test`) covering edge cases: unauthorized releases, premature withdrawals, and reentrancy safety.
  * 🔄 **WASM Build & Testnet Deployment:** Compiling to `wasm32-unknown-unknown` and deploying contract instances to the public Stellar Testnet.
  * 🔄 **UI Integration:** Connecting frontend rental cards and agreement modals directly to on-chain Soroban invocations via Freighter.

---

## ⚡ Phase 2: Native Account Abstraction & Frictionless Auth
**Status:** `Planned (Immediate Priority)`

### **Priority 1 (P1): Zero Seed-Phrase Onboarding & Key Safety**

* **Soroban Passkey Kit (WebAuthn / Biometric Smart Wallets):**
  * *Objective:* Replace crypto seed phrases and browser extension requirements with device-native biometrics (FaceID, TouchID, Android biometric prompt).
  * *Why:* In emerging markets, seed phrases cause overwhelming onboarding abandonment. Passkey Kit enables everyday African renters and landlords to create non-custodial smart accounts and sign leases in seconds.
* **SEP-10 (Stellar Web Authentication):**
  * *Objective:* Passwordless cryptographic session authentication between client and API using Stellar keypair signatures.
  * *Why:* Eliminates credential stuffing, insecure password storage, and central database authentication risks.
* **SEP-30 (Account Recovery Servers):**
  * *Objective:* Multi-party custodial key recovery standard for Passkey smart accounts.
  * *Why:* Ensures tenants never lose access to their locked caution deposit if their phone is lost or replaced during a 1-year lease term.

---

## 📈 Phase 3: Dynamic Price Feeds & Cross-Asset Liquidity
**Status:** `Upcoming`

### **Priority 2 (P2): Oracle Valuation & In-Contract Swaps**

* **Reflector Oracle Integration (Soroban Decentralized Price Feeds):**
  * *Objective:* Pull tamper-proof, on-chain price feeds for `cNGN / USD`, `XLM / USD`, and `USDC`.
  * *Why:* Rents in Nigeria are negotiated in local Naira (NGN) but escrowed and settled in USDC to hedge against local currency inflation. Reflector guarantees exact, manipulation-proof exchange calculations at the moment of payment disbursement.
* **Soroswap / Phoenix DEX Liquidity Routing:**
  * *Objective:* Embed Automated Market Maker (AMM) atomic swap logic directly into the contract call.
  * *Why:* If a tenant holds XLM or local stablecoins (such as cNGN), the contract can atomically swap them into pure Stellar USDC before depositing into the landlord’s escrow.

---

## 🌍 Phase 4: Local Banking Integration & Anchor On-Ramps
**Status:** `Future Scale`

### **Priority 3 (P3): Direct Fiat-to-Escrow Banking Rails**

* **SEP-24 & SEP-6 (Anchor Hosted Deposit & Withdrawal):**
  * *Objective:* Integrate regulated African Stellar Anchors (e.g., Cowrie, Yellow Card) supporting Nigerian NIBSS bank transfers and USSD.
  * *Why:* Users never need to interact with centralized crypto exchanges. Tenants pay via their regular mobile banking app; the anchor auto-mints Stellar tokens straight into the Soroban escrow.
* **SEP-38 (Anchor RFQ — Request for Quote):**
  * *Objective:* Real-time FX quote locks for high-value rental agreements.
  * *Why:* Locks conversion rates for both parties prior to bank transfer execution, shielding them from intraday currency volatility.

---

### Phase Summary Matrix

| Phase | Milestone | Real Status | Priority | Tech Stack / Standards |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | AI Voice Intake & CV Audit Engine | **Partially Completed** | — | Web Speech API, Canvas CV, Next.js |
| **Phase 1** | Soroban Escrow Smart Contract | **Ongoing** | — | Rust, Soroban SDK, Freighter |
| **Phase 2** | Biometric Passkeys & Key Recovery | Planned | **P1** | **Passkey Kit, SEP-10, SEP-30** |
| **Phase 3** | Oracle Price Feeds & AMM Swaps | Planned | **P2** | **Reflector Oracle, Soroswap / Phoenix** |
| **Phase 4** | African Fiat Bank Transfers & FX | Planned | **P3** | **SEP-24, SEP-6, SEP-38 Anchors** |
