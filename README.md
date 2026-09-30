# 🏠 LockHouse

> **"Lock in your verified home. Lock out the middleman."**  
> **AWS Zero to Shipped Hackathon 2026**  
> **Lane**: `#startups` | **App Category**: `#commercial-potential`

[![AWS Live](https://img.shields.io/badge/AWS-Live%20on%20S3%20%26%20CloudFront-orange?logo=amazon-aws)](http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com)
[![Next.js](https://img.shields.io/badge/Next.js-16%20Turbopack-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zero Agent Fees](https://img.shields.io/badge/Agent%20Fees-0%25-brightgreen)](http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com)

---

## 🚀 Live Public Deployment (The Ship Gate)

* **CloudFront HTTPS URL**: [https://d1dco6ew3il05x.cloudfront.net](https://d1dco6ew3il05x.cloudfront.net)
* **Direct AWS S3 URL**: [http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com](http://lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com)
* **Local Dev Server**: `http://localhost:3001`

---

## 🎯 What is LockHouse?

**LockHouse** is an autonomous direct-to-landlord rental intelligence platform designed to eliminate the predatory 50%+ middleman "house agent" fees in Nigeria and emerging rental markets.

### Key Capabilities:
1. **60-Second Landlord Voice Studio**: Older property owners tap a retro mic and speak in English/Pidgin. The **AWS Bedrock AI Agent** extracts rent, utility specs, and house rules automatically.
2. **The "Light & Utility Truth Scorecard"**: Guaranteed transparency on daily grid power hours, solar/inverter capacity, dedicated prepaid metering, treated borehole water, and compound security.
3. **Computer Vision Property Audit**: Detects prepaid meters, solar inverter battery banks, and secure compound gates.
4. **Direct Landlord-Tenant Chat Room**: 100% free inspections and direct communication with zero agent gatekeepers.
5. **Zero-Agent Legal Tenancy Agreement Generator**: Printable legal contract with an official ₦0 commission stamp and SHA-256 integrity hash.
6. **Middleman Savings Calculator**: Real-time counter of total Naira saved by renters.

---

## 🛠️ Tech Stack & AWS Cloud Infrastructure

* **Frontend**: Next.js 16 (App Router + Turbopack), React 19, TypeScript.
* **Styling**: Vanilla CSS Design Tokens (Bespoke 90s Retro-Tech aesthetic with high-contrast tactile cards).
* **AWS Services Connected**:
  - **AWS S3**: Static website hosting (`s3://lockhouse-direct-226579698869`).
  - **AWS CloudFront**: Distribution ID `E25APX0VCRR5EM`.
  - **AWS STS**: Caller identity verified (`Account: 226579698869`, `Region: us-east-1`).
  - **AWS Bedrock**: Extraction agent prompts for West African real-estate intelligence.

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start development server on port 3001
npm run dev -- -p 3001

# Production build & static export
npm run build
```
