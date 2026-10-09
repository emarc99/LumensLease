# Contributing to LumensLease

Thank you for your interest in contributing to **LumensLease**! We welcome community developers, designers, and researchers helping us build the decentralized rental trust & caution deposit escrow standard on Stellar & Soroban.

---

## 🛠️ Project Architecture

LumensLease consists of two primary components:
1. **Frontend & AI Verification Engine (`src/`)**: Next.js (App Router), TypeScript, Web Speech API audio processing, and HTML5 Canvas Computer Vision.
2. **On-Chain Escrow Protocol (`contracts/soroban_rental_escrow/`)**: Autonomous Soroban smart contract written in Rust defining sovereign lease state machines and multi-sig arbitration.

---

## 💻 Local Setup & Prerequisites

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Rust & Cargo**: Latest stable toolchain (`rustup default stable`)
* **WASM Target**: `rustup target add wasm32-unknown-unknown`
* **Soroban CLI** (optional for local contract invocation): `cargo install --locked soroban-cli`

### Getting Started

```bash
# 1. Clone your fork of the repository
git clone https://github.com/emarc99/LumensLease.git
cd LumensLease

# 2. Install frontend dependencies
npm install

# 3. Start the Next.js local development server
npm run dev
# Open http://localhost:3000 in your browser

# 4. Build and test Soroban Smart Contracts
cd contracts/soroban_rental_escrow
cargo build --target wasm32-unknown-unknown --release
cargo test
```

---

## 🌊 Drips Wave Workflow & Issue Guidelines

If you are participating through the **Stellar Wave Program on Drips Network**:
1. Apply to an issue on the [Drips Wave dashboard](https://www.drips.network/wave).
2. Wait for assignment from the maintainer before starting work.
3. Each issue specifies its scope and complexity tier:
   * **Trivial (100 Points)**: Minor bug fixes, documentation, linting, CI adjustments.
   * **Medium (150 Points)**: Standard features, event publishing, UI contract hooks.
   * **High (200 Points)**: Core Soroban logic, security hardening, full test suites.

---

## 🌿 Contribution Workflow & Pull Requests

1. **Branch Naming**:
   * Features: `feat/issue-number-short-description`
   * Bug fixes: `fix/issue-number-short-description`
   * Docs: `docs/short-description`
2. **Code Quality**:
   * Ensure TypeScript types are clean: `npm run lint`
   * Ensure Rust contracts compile without warnings: `cargo check`
3. **Submitting a PR**:
   * Reference the issue number in the PR description (e.g., `Closes #12`).
   * Include a clear description of the change and screenshots/test output if applicable.
   * Maintainers review and merge within 24–48 hours during active Wave sprints.

---

## 📄 License
By contributing to LumensLease, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
