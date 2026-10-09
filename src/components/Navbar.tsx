'use client';

import React from 'react';
import { useProperty } from '../context/PropertyContext';
import { useWallet } from '../context/WalletContext';
import { ShieldCheck, Zap, Home, Mic, FileText, Calculator, Shield, Award, Scale } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { totalSavingsNgn, activeView, setActiveView } = useProperty();
  const { walletState, setIsTelemetryOpen } = useWallet();

  return (
    <header
      style={{
        background: 'rgba(18, 23, 34, 0.95)',
        borderBottom: '2px solid var(--border-bold)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setActiveView('feed')}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--amber-primary), #d97706)',
              color: '#000',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--border-hard)',
              boxShadow: 'var(--shadow-retro)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Home size={22} strokeWidth={2.5} />
            <span className="mono" style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.05em' }}>
              LUMENSLEASE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--amber-light)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              0% AGENT CUT • STELLAR & SOROBAN ESCROW
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Lock in your verified home. Lock out the middleman.
            </span>
          </div>
        </div>

        {/* Middleman Savings Ticker */}
        <div
          style={{
            background: 'rgba(10, 13, 20, 0.85)',
            border: '1px solid var(--border-bold)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <ShieldCheck size={18} color="var(--emerald-primary)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Extortion Fees Saved by Tenants
            </span>
            <span className="mono" style={{ color: 'var(--emerald-light)', fontWeight: 800, fontSize: '0.95rem' }}>
              ₦{totalSavingsNgn.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Nav Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveView('feed')}
            className="retro-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              background: activeView === 'feed' ? 'var(--amber-primary)' : 'var(--bg-card)',
              color: activeView === 'feed' ? '#000' : 'var(--text-primary)',
              borderColor: activeView === 'feed' ? '#000' : 'var(--border-bold)',
            }}
          >
            <Home size={16} />
            <span>Explore Homes</span>
          </button>

          <Link
            href="/escrow"
            className="retro-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              background: 'var(--bg-card)',
              color: '#38bdf8',
              borderColor: 'var(--border-bold)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={15} color="#38bdf8" />
            <span>Escrow</span>
          </Link>

          <Link
            href="/passport"
            className="retro-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              background: 'var(--bg-card)',
              color: '#fbbf24',
              borderColor: 'var(--border-bold)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Award size={15} color="#fbbf24" />
            <span>Passport</span>
          </Link>

          <Link
            href="/arbitration"
            className="retro-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              background: 'var(--bg-card)',
              color: '#c084fc',
              borderColor: 'var(--border-bold)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Scale size={15} color="#c084fc" />
            <span>Jury</span>
          </Link>

          <button
            onClick={() => setActiveView('landlord_studio')}
            className="retro-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              background: activeView === 'landlord_studio' ? 'var(--teal-primary)' : 'var(--bg-card)',
              color: activeView === 'landlord_studio' ? '#000' : 'var(--text-primary)',
              borderColor: activeView === 'landlord_studio' ? '#000' : 'var(--border-bold)',
            }}
          >
            <Mic size={16} />
            <span>Voice Studio</span>
          </button>

          {/* Stellar & Soroban Wallet Badge */}
          <div
            onClick={() => setIsTelemetryOpen(true)}
            style={{
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid var(--teal-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to manage wallet and view live Soroban contracts"
          >
            <div className="pulse-dot" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--teal-light)', fontWeight: 800 }}>
                {walletState.isConnected && walletState.publicKey
                  ? `${walletState.publicKey.slice(0, 4)}...${walletState.publicKey.slice(-4)} (${walletState.balanceXlm} XLM)`
                  : 'CONNECT STELLAR WALLET'}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                4 Soroban Contracts • Testnet
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
