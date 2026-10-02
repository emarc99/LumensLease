# 🏠 LockHouse
**Lock in your verified home. Lock out the middleman.**

> **AWS Zero to Shipped Hackathon 2026**  
> **Track**: `#startups` | **Prize Category**: `#commercial-potential`  

[![AWS Live](https://img.shields.io/badge/AWS-Live%20on%20S3%20%26%20CloudFront-orange?logo=amazon-aws)](https://d1dco6ew3il05x.cloudfront.net)
[![Next.js](https://img.shields.io/badge/Next.js-16%20Turbopack-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zero Agent Fees](https://img.shields.io/badge/Agent%20Fees-0%25-brightgreen)](https://d1dco6ew3il05x.cloudfront.net)
[![Lagos Edge POP](https://img.shields.io/badge/CloudFront-LOS50--P5%20Edge-purple)](https://d1dco6ew3il05x.cloudfront.net)

---

## 🚀 Live Public Deployments

* **Global CloudFront CDN (HTTPS)**: [https://d1dco6ew3il05x.cloudfront.net](https://d1dco6ew3il05x.cloudfront.net)
* **Direct AWS S3 Website**: [http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com](http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com)
* **Landlord Voice Studio**: [https://d1dco6ew3il05x.cloudfront.net/studio/](https://d1dco6ew3il05x.cloudfront.net/studio/)
* **Middleman Savings Calculator**: [https://d1dco6ew3il05x.cloudfront.net/calculator/](https://d1dco6ew3il05x.cloudfront.net/calculator/)

---

## 🎯 What is LockHouse?

**LockHouse** is an autonomous direct-to-landlord rental intelligence platform designed to eliminate predatory house agent commissions and informal inspection rackets in Nigeria and emerging rental markets.

In cities like **Ibadan, Oyo State**, young graduates, software engineers, and university workers lose **₦300,000+** in 10% agency + 10% legal markups on top of annual rent, only to discover after moving in that the neighborhood suffers from a crippling 3-hour daily electricity deficit and dry boreholes.

LockHouse replaces informal middlemen with verified digital truth and zero-friction voice intake.

---

## ✨ Features Working in Production Today

1. **60-Second Landlord Voice Studio (`/studio`)**:
   - Older property owners tap a retro mic and speak naturally in English, Pidgin, or regional phrasing.
   - Built-in **Nigerian Phonetic Normalizer** maps accents (*"so lah"* $\rightarrow$ solar, *"two virus"* $\rightarrow$ inverter, *"what are running"* $\rightarrow$ running water).
   - Our **AWS Bedrock NLP extraction pipeline** structures rent, bedrooms, utility specs, and house rules automatically.
2. **In-Browser Computer Vision Property Audit (`/studio`)**:
   - Inspects property photos with real-time bounding boxes detecting **Conlog Prepaid Meters (96%)**, **Solar Inverter Battery Banks (94%)**, and **Gated Perimeter Security (92%)**.
3. **The Light & Utility Truth Scorecard (`/` and `/properties/[id]`)**:
   - Guaranteed transparency on daily IBEDC grid power hours, backup solar inverter capacity (kVA), dedicated prepaid metering, treated borehole water, and zero flood risk.
4. **Natural Language Spoken Search**:
   - Search the home catalog using natural spoken phrasing like *"Below 700,000 naira"* or *"Solar in Bodija"*.
5. **Direct Landlord-Tenant Chat Room**:
   - Direct communication with property owners and 1-click booking of **100% free inspections** (permanently eliminating ₦3,000–₦5,000 inspection fee rackets).
6. **Statutory Oyo State Tenancy Agreement Generator**:
   - Court-ready legal lease compliant with the **Recovery of Premises Law of Oyo State (Cap 144)**, stamped with an official **₦0 Middleman Commission Seal** and verified with a SHA-256 cryptographic integrity hash.
7. **Interactive Middleman Savings Calculator (`/calculator`)**:
   - Real-time calculator demonstrating the exact cash saved from eliminating 10% agency + 10% legal fees.

---

## ⚡ 2-Minute Quick Test for Judges

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Voice Intake** | Visit [`/studio`](https://d1dco6ew3il05x.cloudfront.net/studio/) and click **Preset 1 (Chief Adeleke)** or speak into the mic | Real-time soundwave pulses, transcript appears, and green **Structured via AWS Bedrock NLP** badge displays `₦1,600,000 / yr · 2 Beds · Solar Inverter · 16h Light`. Form auto-populates. |
| **2. CV Audit** | In [`/studio`](https://d1dco6ew3il05x.cloudfront.net/studio/), inspect the uploaded photo | Real bounding boxes overlay on screen detecting the Conlog prepaid meter and solar battery bank. |
| **3. Spoken Search** | On [`/`](https://d1dco6ew3il05x.cloudfront.net), type `"Below 700,000 naira"` in search | Instantly filters the live property catalog to homes under ₦700k (e.g. Samonda 1-Bed at ₦650k). |
| **4. Legal Agreement** | Open any property (e.g. Bodija 2-Bed) and click **Generate Tenancy Agreement** | Court-ready Oyo State statutory agreement renders with official ₦0 commission seal and SHA-256 verification. |
| **5. Savings Calc** | Visit [`/calculator`](https://d1dco6ew3il05x.cloudfront.net/calculator/) and move the slider | Live counter calculates exact cash savings (e.g. **₦320,000 saved** on ₦1.6m rent). |

---

## 🛠️ Architecture & AWS Cloud Infrastructure

```
                      AWS ZERO-TO-SHIPPED ARCHITECTURE
  
       [Next.js 16 App Router] ──► [Amazon S3 Website Hosting]
          (output: 'export')         (lockhouse-direct-226579698869)
                                                  │
                                                  ▼
                                      [Amazon CloudFront CDN]
                                         (ID: E25APX0VCRR5EM)
                                                  │
                                                  ▼
                                      [Lagos Edge POP: LOS50-P5]
                                     (Sub-100ms West Africa TTFB)
```

* **Frontend**: Next.js 16 (App Router + Turbopack), React 19, TypeScript.
* **Design System**: Editorial Publication aesthetic with *Newsreader* serif headings, *Plus Jakarta Sans* body, and *JetBrains Mono* data streams in vanilla CSS tokens.
* **Cloud Infrastructure**:
  - **Amazon S3**: Static hosting bucket (`s3://lockhouse-direct-226579698869`).
  - **Amazon CloudFront**: Edge distribution (`E25APX0VCRR5EM`) routed through the **Lagos, Nigeria Edge Point of Presence (`LOS50-P5`)** for sub-100ms response times across West Africa.
  - **AWS STS**: Authenticated session verified (`Account: 226579698869`, `Region: us-east-1`).
  - **AWS Bedrock NLP Prompts**: Structured extraction for West African property specs.

---

## 🏃 Running Locally

```bash
# Clone the repository
git clone https://github.com/emarc99/lockhouse.git
cd lockhouse

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle and static export
npm run build
```

---

## 📚 Project Documentation

Deep-dive architectural, product, and hackathon documentation is available in the [`docs/`](./docs) folder:

| Document | Purpose & Content |
| :--- | :--- |
| **[SUBMISSION.md](./docs/SUBMISSION.md)** | **Official AWS Hackathon Dossier** — Problem origin story in Ibadan, 6-point interactive verification guide, documented proof of AWS console connection (`226579698869`), and technical gotchas solved. |
| **[PRD.md](./docs/PRD.md)** | **Product Requirements Document** — Dual user journeys (Gen-Z renter vs. non-tech older landlord), screen specs, and Phase 2 serverless backend roadmap. |
| **[SPEC.md](./docs/SPEC.md)** | **Technical Specification** — System architecture, TypeScript data schemas, Bedrock AI extraction prompts, and Phase 2 Mermaid cloud topology. |
| **[CHECKLIST.md](./docs/CHECKLIST.md)** | **Implementation Audit** — Step-by-step development checklist tracking Phase 1 through 6 milestones and deployment verification. |

---

## 📄 License

This project is open-source and available under the [MIT License](./LICENSE).
