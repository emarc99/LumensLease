# LockHouse — Product Requirements Document (PRD)

> **User Experience, Screen Workflows, and Functional Behavior**  
> *"Lock in your verified home. Lock out the middleman."*

---

## 1. Core User Journeys

### User Journey A: The Gen-Z / Remote Renter (Finding a Verified Home)
1. **Landing & First Impression**:
   - The user arrives at LockHouse. The top banner proudly declares: *"₦0 AGENT FEES. DIRECT FROM VERIFIED OWNERS."*
   - An active ticker displays: *"Total Extortion Fees Saved by Tenants: ₦14,250,000"*.
2. **Search & Utility Filtering**:
   - The user can either type or speak a conversational request: *"I need a 1-bedroom flat in Yaba or Surulere with guaranteed solar or inverter light so I can code without generator noise, under ₦1.5M."*
   - Alternatively, they click the 90s retro filter chips:
     - `[⚡ 24/7 Solar/Inverter]`
     - `[🔌 Dedicated Prepaid Meter]`
     - `[💧 Treated Borehole Water]`
     - `[🚗 Gated & Paved Compound]`
3. **Inspecting a Property**:
   - The user clicks on a listing card.
   - They see verified photos tagged with AI verification badges: `[✓ PREPAID METER VERIFIED]`, `[✓ INVERTER BATTERY SYSTEM DETECTED]`.
   - The **Utility Truth Scorecard** shows exact daily grid light hours (e.g., "16 hrs grid + 8 hrs solar backup"), water pumping schedule, and landlord house rules.
   - A **Compatibility Score** (e.g., "94% Match") explains why this home fits their lifestyle.
4. **Direct Action**:
   - The user clicks **"Message Landlord Directly"**.
   - No street agent, no ₦10,000 inspection fee. A direct, polite messaging modal opens to introduce themselves and schedule a visit.

---

### User Journey B: The Direct Landlord (Listing a Property in 60 Seconds)
1. **Frictionless Entry**:
   - The landlord clicks **"List My Property"** (large, high-contrast button).
   - Instead of a confusing 30-field form, they see a simple, welcoming prompt: *"Tell us about your house or tap the mic to speak."*
2. **Voice Intake**:
   - The landlord taps the vintage microphone button and speaks:
     > *"My house is at 14 Ogunlana Drive, Surulere. It is a 2-bedroom flat on the first floor. Rent is ₦1.6 million per year. We have a dedicated prepaid meter, 24-hour security at the gate, and borehole water. I want a quiet working person, no loud music or smoking."*
   - As they speak, the AI Agent transcribes their voice and instantly fills out the structured listing fields:
     - **Title**: *Spacious 2-Bedroom Flat with Prepaid Meter*
     - **Location**: *Ogunlana Drive, Surulere, Lagos*
     - **Rent**: *₦1,600,000 / year*
     - **Power**: *Prepaid Meter (Dedicated)*
     - **Water**: *Treated Borehole*
     - **Preferences**: *Working Professional, Quiet, Non-Smoker*
3. **Photo Analysis**:
   - The landlord drags and drops or snaps 3–4 photos.
   - The AI Computer Vision inspector highlights key features (e.g., *"Prepaid Conlog meter detected on wall"*, *"Well-ventilated sliding windows"*).
4. **Publishing**:
   - The landlord previews the retro card, adjusts any price or rule if desired, and clicks **"Publish to LockHouse"**.
   - It instantly appears on the live public feed.

---

## 2. Screen-by-Screen Specifications

### Screen 1: The Main Command Board & Property Feed
* **Top Navigation**:
  - Logo: `[LOCKHOUSE]` in bold retro monospace.
  - Live Status Pill: `[⚡ AWS AGENT CONNECTED • REGION: US-EAST-1]`.
  - Middleman Savings Tracker: Dynamic counter showing money saved from 50% agent fees.
  - Action Toggle: `[Explore Homes]` | `[List Property (Landlord Studio)]` | `[Tenancy Generator]`.
* **Hero Search Bar**:
  - Conversational input with mic button + quick location pills (Yaba, Surulere, Lekki, Ikeja, Garki Abuja).
* **The Retro Filter Bar**:
  - High-contrast toggle chips with instant feedback.
* **The Property Grid**:
  - Responsive grid of tactile retro property cards.
  - Each card features:
    - Verified Photo Carousel with watermark protection.
    - Title, Rent (formatted in ₦/year and ₦/month equivalent).
    - **Utility Truth Scorecard**:
      - ⚡ Light: Grid hours + Solar/Inverter indicator.
      - 💧 Water: Borehole / Water quality badge.
      - 🔌 Meter: Dedicated vs. Shared.
      - 🛡️ Security: Gated compound, flood rating.
    - Landlord Compatibility Tags (e.g. Single / Married / Working).
    - CTAs: `[Inspect Details]` and `[Direct Chat]`.

### Screen 2: Property Detail & Infrastructure Truth Inspector Modal
* Full photo gallery with AI Computer Vision callouts.
* Landlord Bio & Direct Verification status (e.g. "Pa Michael Adebayo — Verified Owner since 2018").
* Complete breakdown of fees:
  - Rent: ₦1,500,000
  - Agency Fee: **₦0 (Normally ₦150,000 with agents)**
  - Agreement Fee: **₦0 (Normally ₦150,000 with agents)**
  - Total Savings: **₦300,000 SAVED**
* Neighborhood Community Telemetry:
  - Average weekly power reliability rating.
  - Rainy season flood status.
* Direct Action: `[Start Direct Chat with Landlord]`.

### Screen 3: Landlord Voice-to-Listing Studio
* Mic recorder with audio waveform visualization and one-click sample voice memos for testing.
* Interactive real-time transcript box showing AI extraction in progress.
* Photo uploader with instant AI feature detection badges.
* Instant live card preview that updates as voice/text is processed.
* One-click "Publish Property" action.

### Screen 4: Direct Landlord-Tenant Messaging & Agreement Room
* Direct, secure chat thread between prospective tenant and verified landlord.
* Pre-filled quick question chips for tenants:
  - *"Can I come for inspection this Saturday morning?"*
  - *"How many hours does the solar inverter run when NEPA takes light?"*
  - *"Is parking space allocated inside the gate?"*
* **Zero-Agent Tenancy Agreement Generator**:
  - One-click generates a clean, legally binding, printable Standard Residential Tenancy Agreement customized with tenant and landlord names, property address, rent, and house rules.
  - Shows ₦0 agency fee stamp.
