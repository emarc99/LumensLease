# LockHouse — Product Scope Document

> *"Lock in your verified home. Lock out the middleman."*  
> **AWS Zero to Shipped Hackathon 2026**  
> **Lane**: `#startups` | **App Category**: `#commercial-potential` (Secondary: `#daily-life-enhancement`)

---

## 1. Executive Summary & Founder Story

### The Lived Pain
In emerging rental markets like Nigeria, finding an apartment is a grueling, predatory experience. Young graduates, remote workers, and families are forced to navigate an opaque network of street "house agents" who:
1. **Extort 50%+ in Middleman Fees**: A ₦1,000,000/year apartment routinely balloons to ₦1,500,000+ after factoring in a 10% Agency fee, 10% Legal/Agreement fee, Caution deposits, and recurring ₦5,000–₦10,000 non-refundable "inspection fees" just to view a single run-down room.
2. **Conceal Infrastructure Realities ("The Light Problem")**: Agents actively hide dealbreakers. Renters only discover *after paying* that the neighborhood gets only 3 hours of grid power ("light") per week, the water is rusty, or the street becomes an impassable swamp during the rainy season.
3. **Misalign Landlord-Tenant Expectations**: Older landlords have strict preferences (e.g., quiet working professionals, married vs. single, religion, non-smokers), while younger Gen-Z renters just want honest pricing and autonomy. Street agents lie to both parties to close the deal, leading to immediate tenancy disputes.

### The LockHouse Vision
**LockHouse** is an autonomous direct-to-landlord rental intelligence platform running live on AWS. It completely eliminates the parasitic 50% agent cut by empowering landlords to list properties via voice/AI intake, providing an undeniable "Light & Utility Truth Scorecard", and enabling direct, verified tenant-landlord matchmaking.

---

## 2. Target Users

| User Persona | Profile & Behavior | Primary Pain Points | What LockHouse Gives Them |
| :--- | :--- | :--- | :--- |
| **The Direct Landlord** (e.g. Pa Ade / Alhaja) | Older property owner (50–70 yrs), low-to-medium tech literacy, skeptical of complicated apps, values peace of mind and respectful tenants. | Overwhelmed by 40-field web forms; harassed by 10 different aggressive street agents; gets bad tenants who default on rent or trash the house. | **Voice/Audio-to-Listing Agent**: Just speak or upload photos. The AI structures the listing, extracts rules, and filters applicants before they ever call. |
| **The Gen-Z / Remote Renter** (e.g. Devs, Designers, Graduates) | Tech-savvy, remote worker, values high-speed internet, power uptime ("light"), fair pricing, and mobile-first speed. | Bleeding 50%+ of rent on useless agent fees; gets scammed with fake photos; moves into dark houses with no power to charge work laptops. | **Infrastructure Truth Scorecard**: Guaranteed transparency on solar/inverter backup, grid hours, borehole water, and 0% agent fees. |

---

## 3. Core Pillars & Capabilities

### 1. Voice-to-Listing AI Intake for Landlords
* Landlords don't fill out tedious forms. They simply tap a mic button and speak in natural English or Pidgin:
  > *"I have a clean 2-bedroom flat in Surulere. Dedicated prepaid meter, 5kVA solar inverter system so light is 24/7, treated borehole water. Compound is paved and gated with night guard. I want a responsible working professional, no loud parties."*
* The AWS Bedrock AI agent parses the audio/text, extracts structured metadata (rent, bedrooms, location, amenities, preferences), and drafts an official verified listing.

### 2. The "Light & Utility Truth Scorecard"
Every property card features a prominent, unmissable utility transparency matrix:
* **⚡ Power / Light Status**: Grid hours/day + Backup Power (Solar / Inverter / Generator / None).
* **💧 Water Source**: Treated Borehole / Municipal / Well + Pumping schedule.
* **🛡️ Security & Compound**: Gated perimeter, night security, paved compound vs. flood-prone soil.
* **🔌 Metering**: Dedicated Prepaid Meter (no shared estimated billing drama).

### 3. Computer Vision Photo Inspector
* Landlords upload raw apartment photos (compound, living room, bathroom, prepaid meter).
* The AI agent inspects the images:
  - Verifies presence of key infrastructure (e.g. inverter batteries, prepaid meter, water pump).
  - Assesses interior finishing quality (tiles, lighting fixtures, ceiling condition).
  - Flags potential red flags (dampness, broken fittings, deceptive wide-angle distortion).

### 4. Smart Compatibility & Natural Language Matchmaker
* Renters search conversationally: *"I'm a remote frontend engineer, budget ₦1.5M, need constant power for my workstation, looking in Yaba or Surulere."*
* The agent matches tenant profiles against landlord requirements (lifestyle, working status, noise level) to generate a **Compatibility Index (%)**.

### 5. Direct Landlord-Tenant Chat & Zero-Agent Lease Contract
* In-app direct messaging with zero middleman phone numbers.
* Auto-generated, standardized legal tenancy agreement template protecting both tenant and landlord rights with ₦0 agent commission.

---

## 4. Visual Design System: 90s Retro-Tech Meets Modern Cleanliness

* **Visual Identity**: Warm 90s retro-tech command aesthetic.
* **Palette**: 
  - Rich dark background (`#0d1117`, `#161b22`) with high-contrast warm cream/amber accents (`#f59e0b`, `#fbbf24`) and crisp electric retro teal (`#10b981`, `#06b6d4`).
* **Tactile Retro Badges**:
  - `[⚡ 24/7 SOLAR VERIFIED]`
  - `[🛡️ DIRECT OWNER — 0% AGENT CUT]`
  - `[🔌 DEDICATED PREPAID METER]`
  - `[💧 TREATED BOREHOLE]`
* **Typography**: Bold, high-legibility display fonts with retro monospaced accents. Clear and readable for older eyes, yet fresh and stylish for younger renters.

---

## 5. AWS Architecture & The "Ship Gate" Execution

* **Frontend**: React + TypeScript + Vite, bespoke Vanilla CSS design system, responsive mobile & desktop views.
* **Backend Engine**: Node.js / Express API deployed on AWS (App Runner / Amplify / S3 + CloudFront).
* **AWS Services Connected**:
  - **AWS Bedrock / AI Agent Loop**: Natural language listing extraction & conversational matchmaker.
  - **Amazon S3**: Secure storage for verified property photos and audio snippets.
  - **AWS CloudWatch / IAM**: Documented credentials and console connection proof.
* **Ship Gate Compliance**: Deployed to a live, publicly reachable AWS URL passing all AI evaluator and human judge checks.
