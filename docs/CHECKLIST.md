# LockHouse — Execution Checklist

> **Bite-Sized Slices for Iterative Building & Verification**

---

### Phase 1: Foundation & Design System
- [x] **Task 1.1**: Initialize Next.js (App Router + TypeScript) project in `aws-zero`.
- [x] **Task 1.2**: Install Lucide React & Canvas Confetti.
- [x] **Task 1.3**: Create the 90s Retro-Tech design token system in `index.css` (custom variables, high-contrast dark theme, warm amber & retro teal accents, scanlines & tactile borders, typography).

### Phase 2: Domain Data & State Engine
- [x] **Task 2.1**: Define TypeScript interfaces in `src/types.ts` for `PropertyListing`, `UtilityScorecard`, `LandlordPreferences`, and `ChatMessage`.
- [x] **Task 2.2**: Build mock property seed database (`src/data/mockProperties.ts`) with realistic Lagos & Abuja properties (Yaba, Surulere, Lekki, Ikeja, Garki) featuring real utility metrics (solar/inverter, grid hours, borehole, prepaid meters, landlord rules).
- [x] **Task 2.3**: Implement reactive store / context with localStorage persistence (`src/context/PropertyContext.tsx`).

### Phase 3: Core UI & Infrastructure Truth Feed
- [x] **Task 3.1**: Build Top Navigation Bar with AWS Connected Agent telemetry badge, ₦0 agent savings ticker, and view switchers (`src/components/Navbar.tsx`).
- [x] **Task 3.2**: Build Conversational Search & Retro Utility Filter Chips (`[⚡ 24/7 Solar]`, `[🔌 Dedicated Prepaid]`, `[💧 Treated Borehole]`, `[₦ Budget Slider]`) in `src/components/HeroSearch.tsx`.
- [x] **Task 3.3**: Build Property Card component featuring the **Utility Truth Scorecard** and Landlord Compatibility tags (`src/components/PropertyCard.tsx`).
- [x] **Task 3.4**: Build Detailed Property Inspection Modal with AI verification callouts and cost comparison table (showing exact ₦ saved vs. traditional agent) in `src/components/PropertyDetailModal.tsx`.

### Phase 4: Landlord Voice-to-Listing Studio
- [x] **Task 4.1**: Build Audio Recording / Waveform visualizer component with Web Speech API integration and one-click realistic voice sample presets (`src/components/LandlordVoiceStudio.tsx`).
- [x] **Task 4.2**: Implement AI voice parser that extracts rent, bedrooms, location, power/water specs, and landlord preferences in real-time.
- [x] **Task 4.3**: Build Photo Inspector with AI Computer Vision badges (Prepaid meter verified, clean compound, inverter detected).
- [x] **Task 4.4**: Build live card preview and one-click "Publish to LockHouse" workflow with celebration confetti.

### Phase 5: Direct Landlord-Tenant Chat & Legal Tenancy Generator
- [x] **Task 5.1**: Build Direct Messaging room with pre-made quick questions ("How many hours does the inverter last?", "Is inspection free?", "Can I see compound gate?") in `src/components/DirectChatModal.tsx`.
- [x] **Task 5.2**: Build Zero-Agent Tenancy Agreement Generator producing an official, printable legal contract with ₦0 commission stamp and SHA-256 integrity hash in `src/components/TenancyAgreementModal.tsx`.
- [x] **Task 5.3**: Build Interactive Savings Calculator widget (`src/components/SavingsCalculator.tsx`).

### Phase 6: AWS Live Deployment & "Ship Gate" Verification
- [x] **Task 6.1**: Test production build (`npm run build` — passed with 0 errors via Turbopack).
- [x] **Task 6.2**: Deploy to AWS S3 Website Hosting (`s3://lockhouse-direct-226579698869`).
- [x] **Task 6.3**: Provision AWS CloudFront Distribution (`E25APX0VCRR5EM`).
- [x] **Task 6.4**: Verify the live app is reachable, fast, and passes the hackathon Ship Gate!
