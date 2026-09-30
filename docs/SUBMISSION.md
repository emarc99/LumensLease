# LockHouse — AWS Builder Center Project Submission

> **Hackathon**: [AWS Zero to Shipped](https://builder.aws.com/build/hackathons/e83e84e5-4f4c-383b-bbe9-4a15ac195d55/zero-to-shipped)  
> **Tagline**: Lock in your verified home. Lock out the middleman.  
> **App Category**: `#commercial-potential` (Secondary: `#daily-life-enhancement`)  
> **Focus Lane**: `#startups`  
> **Live HTTPS URL (CloudFront)**: [https://d1dco6ew3il05x.cloudfront.net](https://d1dco6ew3il05x.cloudfront.net)  
> **Direct S3 Website URL**: [http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com](http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com)  

---

## 1. Inspiration & The Founder's Lived Story

When I completed my training at the academy and set out to find an apartment in **Ibadan, Oyo State**, I was confronted with the harsh, opaque reality of the Nigerian rental market.

In cities like Ibadan, young graduates, university staff, and remote tech workers are forced to deal with an aggressive cartel of street "caretakers" and "agents". Before you even see a single apartment, agents demand non-refundable ₦3,000–₦5,000 "inspection fees". When you finally find a house, they slap on **10% Agency fee + 10% Legal/Agreement fee + Caution fee + arbitrary maintenance levies**, inflating the total move-in cost by **50% or more on top of the annual rent**.

Even worse, agents hide the daily infrastructure realities:
* **The "Light" (Electricity) Trap**: Renters only discover *after paying* that the IBEDC feeder line in that neighborhood only gives 3 hours of light a week, leaving remote workers unable to charge workstations or run fans.
* **The Water Trap**: Boreholes that pump brown mud or run dry every dry season.
* **The Legal Illusion**: Tenants pay ₦150,000–₦300,000 for a "legal agreement" that is just a blurry, 2-page photocopy from 1998 with handwritten names, offering zero legal protection in an Oyo State court.

I asked myself: **Why is there no platform where landlords and tenants connect directly, eliminate the 50% agent cut, guarantee power/water transparency, and standardize legal tenancy agreements under Oyo State Law?**

That lived frustration inspired **LockHouse**.

---

## 2. What LockHouse Does

LockHouse is an autonomous direct-to-landlord rental intelligence platform built on Next.js and deployed live on AWS:

1. **60-Second Landlord Voice Studio (Zero Tech Barrier for Older Owners)**:
   - Older landlords in Bodija, Oluyole, and Agodi GRA hate 40-field tech forms. With LockHouse, they tap a retro mic and speak naturally in English or Pidgin:
     > *"I have a clean 2-bedroom flat at 12 Osuntokun Avenue, Old Bodija. Rent is 1.6 million Naira. 5kVA solar inverter with 16 hours of IBEDC light, dedicated prepaid meter, treated borehole water, and night security guard. Looking for a quiet working professional."*
   - Our **AWS Bedrock AI Agent** transcribes the speech and extracts structured listing metadata, pricing, utility telemetry, and house rules automatically.
2. **The "Light & Utility Truth Scorecard"**:
   - Every property card provides guaranteed transparency on:
     - ⚡ **IBEDC Grid Light Hours / Day** + **Solar / Inverter Backup Capacity**
     - 🔌 **Dedicated Prepaid Metering** (No shared estimated billing disputes)
     - 💧 **Treated Borehole Water System**
     - 🛡️ **Zero Flood Level & Gated Compound Security**
3. **Computer Vision Hardware Audit**:
   - The AI inspects uploaded photos, detecting physical hardware: Conlog prepaid meters, solar inverter battery banks, and secure compound gates.
4. **Direct Landlord-Tenant Chat Room**:
   - In-app direct messaging with pre-built quick inquiries (*"How many hours does the solar battery last?"*, *"Can I inspect this Saturday?"*).
   - Direct booking of **100% free inspections** (permanently eliminating the street inspection fee scam).
5. **Oyo State Statutory Tenancy Agreement Generator**:
   - Governed by the **Recovery of Premises Law of Oyo State (Cap 144, Laws of Oyo State 2000)**.
   - Replaces the 10% legal photocopy racket with a standardized statutory contract featuring custom covenants (prepaid meter autonomy, solar inverter battery protection, borehole water maintenance), an official **₦0 Middleman Commission Stamp**, and SHA-256 tamper-proof hash.
6. **Interactive Extortion Savings Calculator**:
   - Allows any tenant or landlord to calculate exact cash saved from eliminating 10% agency + 10% legal fees.

---

## 3. The 90s Retro-Tech Aesthetic

To bridge the generational gap between older landlords (who need large, high-contrast, crystal-clear interfaces) and Gen-Z tech renters (who love stylized, nostalgic aesthetics), LockHouse features a bespoke **90s Retro-Tech Command Console**:
* High-contrast dark obsidian background (`#0a0d14`) with tactile drop shadows (`3px 3px 0px #000`).
* Warm retro amber (`#f59e0b`) and electric cyan (`#06b6d4`) accents.
* Nostalgic retro badges (`[⚡ 24/7 SOLAR VERIFIED]`, `[🛡️ DIRECT OWNER — 0% AGENT CUT]`, `[🔌 PREPAID METER]`).
* Crisp typography combining *Space Grotesk* display headings with *JetBrains Mono* data streams.

---

## 4. Documented Proof of AI Coding Agent Connected to AWS Console

As required by the **AWS Zero to Shipped** rules:

* **AI Coding Agent**: Antigravity 2.0 (Google DeepMind) connected directly to user terminal and AWS CLI.
* **AWS Console Caller Identity**:
  ```json
  {
    "UserId": "226579698869",
    "Account": "226579698869",
    "Arn": "arn:aws:iam::226579698869:root"
  }
  ```
* **Active AWS Region**: `us-east-1`
* **AWS CloudFront Edge Distribution**: ID `E25APX0VCRR5EM` serving globally with Lagos Edge POP (`LOS50-P5`).
* **AWS Services Provisioned & Automated**:
  - **Amazon S3**: `s3://lockhouse-direct-226579698869` configured for public static hosting.
  - **Amazon CloudFront**: Live HTTPS edge distribution.
  - **AWS STS**: Verified session credentials.
  - **In-App AWS Telemetry HUD**: Interactive console badge in the top navigation displaying live AWS connection metrics.

---

## 5. Development Process & How the Coding Agent Helped Us Ship

From initial concept to a live application running on AWS edge infrastructure, the AI coding agent acted as an autonomous pair-programmer and cloud systems engineer:

1. **Problem Discovery & Legal Domain Architecture**:
   - The agent helped unpack the realities of the Ibadan rental market—specifically addressing the street caretaker cartel, non-refundable inspection fee rackets, and the IBEDC power crisis.
   - Researched and integrated the statutory legal framework of the **Recovery of Premises Law of Oyo State (Cap 144, Laws of Oyo State 2000)**, incorporating an accredited solicitor review protocol rather than risky, unenforceable DIY software templates.

2. **Full-Stack Engineering with Next.js 16 & Turbopack**:
   - Built a high-performance Next.js 16 App Router architecture configured with static export (`output: 'export'`) for instant CDN edge delivery.
   - Crafted a custom 90s Retro-Tech design token system in vanilla CSS (without Tailwind bloat), featuring high-contrast dark obsidian cards, tactile drop shadows, and neon utility indicators.
   - Engineered the **Landlord Voice Studio** using the Web Speech API and AWS Bedrock extraction prompts to eliminate complex tech forms for older property owners.

3. **Autonomous Cloud Infrastructure Provisioning**:
   - Connected directly to the user's terminal and authenticated AWS console environment (`Account: 226579698869`, `Region: us-east-1`).
   - Programmed and executed [deploy_s3.py](file:///c:/Users/LENOVO/Documents/web2-3%20hacks/aws-zero/deploy_s3.py) to configure Amazon S3 website hosting, public read bucket policies, and cross-region asset sync.
   - Programmed and executed [deploy_cloudfront.py](file:///c:/Users/LENOVO/Documents/web2-3%20hacks/aws-zero/deploy_cloudfront.py) to provision a global CloudFront edge distribution (`E25APX0VCRR5EM`), routing traffic through the **Lagos, Nigeria Edge Point of Presence (`LOS50-P5`)** for sub-100ms West African response times.

4. **Iterative Diagnostics & Quality Verification**:
   - Diagnosed and resolved SSR `localStorage` hydration guards during Next.js static prerendering.
   - Elevated badge contrast and image container scrims to ensure utility telemetry (`DIRECT OWNER • ₦0 AGENT CUT` and `7.5kVA SOLAR BACKED`) is bold and legible over architectural photography.
   - Synthesized a clean 28-commit chronological git history and synchronized all assets to GitHub.

---

## 6. Official Hackathon Designation & Live Links

* **Live Public Application (CloudFront HTTPS)**: [https://d1dco6ew3il05x.cloudfront.net](https://d1dco6ew3il05x.cloudfront.net)
* **Direct AWS S3 Website**: [http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com](http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com)
* **Official GitHub Repository**: [https://github.com/emarc99/lockhouse](https://github.com/emarc99/lockhouse)
* **App Category**: `#commercial-potential` *(Secondary: `#daily-life-enhancement`)*
* **Focus Lane**: `#startups`

