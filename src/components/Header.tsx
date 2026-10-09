'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Wallet, Shield, Award, Scale, Calculator, Mic } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function Header() {
  const pathname = usePathname();
  const { walletState, setIsTelemetryOpen, isConnecting } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand-mark">⌂</span> LUMENSLEASE
      </Link>

      <nav className="navlinks">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          Explore Homes
        </Link>

        <Link href="/escrow" className={pathname === '/escrow' ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Shield size={13} color="#10b981" />
          Escrow
        </Link>

        <Link href="/passport" className={pathname === '/passport' ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Award size={13} color="#fbbf24" />
          Credit Passport
        </Link>

        <Link href="/arbitration" className={pathname === '/arbitration' ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Scale size={13} color="#c084fc" />
          Dispute Jury
        </Link>

        <Link href="/calculator" className={pathname === '/calculator' ? 'active' : ''}>
          Savings Calc
        </Link>

        {/* Stellar & Soroban Wallet / Telemetry Pill */}
        <button
          onClick={() => setIsTelemetryOpen(true)}
          className="aws-telemetry-btn"
          title="Click to manage wallet and inspect live Soroban contracts"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span className="aws-dot" />
          {walletState.isConnected && walletState.publicKey ? (
            <span>
              {truncateAddress(walletState.publicKey)} · {walletState.balanceXlm} XLM
            </span>
          ) : (
            <span>{isConnecting ? 'Connecting...' : 'Connect Stellar Wallet'}</span>
          )}
        </button>

        <Link href="/studio" className="nav-cta">
          List Property <ArrowRight size={13} />
        </Link>
      </nav>
    </header>
  );
}
