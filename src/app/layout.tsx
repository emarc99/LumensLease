import type { Metadata } from "next";
import "../index.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "LumensLease — Decentralized Rental Trust & Escrow on Stellar",
  description: "Direct-to-landlord rental trust and caution deposit escrow on Soroban & Stellar. 0% middleman agent fees, verified light scorecards, and trustless security deposit refunds.",
  keywords: ["LumensLease", "Stellar", "Soroban", "escrow", "caution deposit", "rental", "Nigeria", "direct landlord", "no agent fee", "smart contract"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏠</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
