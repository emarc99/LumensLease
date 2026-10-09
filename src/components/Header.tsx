'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Cloud, Server, Shield, Check, X, ExternalLink } from 'lucide-react';
import { useProperty } from '../context/PropertyContext';

export default function Header() {
  const pathname = usePathname();
  const { awsConnection } = useProperty();
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">⌂</span> LUMENSLEASE
        </Link>

        <nav className="navlinks">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            Explore homes
          </Link>
          <Link href="/calculator" className={pathname === '/calculator' ? 'active' : ''}>
            Savings calculator
          </Link>
          <Link href="/messages" className={pathname === '/messages' ? 'active' : ''}>
            Messages
          </Link>

          {/* Stellar Soroban Protocol HUD Pill */}
          <button
            onClick={() => setShowTelemetryModal(true)}
            className="aws-telemetry-btn"
            title="Click to inspect live Stellar Testnet contract and Soroban escrow protocol"
          >
            <span className="aws-dot" />
            <span>Stellar: Testnet (Soroban)</span>
          </button>

          <Link href="/studio" className="nav-cta">
            List a property <ArrowRight size={13} />
          </Link>
        </nav>
      </header>

      {/* Stellar & Soroban Protocol HUD Modal */}
      {showTelemetryModal && (
        <div className="modal-overlay" onClick={() => setShowTelemetryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="var(--orange)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>LumensLease Protocol & Network HUD</h3>
              </div>
              <button
                onClick={() => setShowTelemetryModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Soroban Rental Escrow Contract (Testnet)
                </span>
                <code style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 700, wordBreak: 'break-all' }}>
                  CBK6CZCHOUNZOPBYZCIVFUVUAVBGIBLUOY3KPB4RQL6ISMQQKJYZYYZE
                </code>
                <div style={{ marginTop: '8px' }}>
                  <a
                    href="https://stellar.expert/explorer/testnet/contract/CBK6CZCHOUNZOPBYZCIVFUVUAVBGIBLUOY3KPB4RQL6ISMQQKJYZYYZE"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11px', color: 'var(--orange)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View Verified Contract on Stellar Expert <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Network</span>
                  <strong>Test SDF Network (Testnet)</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Settlement Assets</span>
                  <strong>Stellar USDC • cNGN • XLM</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Wallet Standard</span>
                  <strong>Freighter & Passkey Kit</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Edge Acceleration</span>
                  <strong style={{ color: 'var(--green)' }}>CloudFront LOS50 Edge (Lagos)</strong>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', color: '#14532d', fontSize: '12px' }}>
                <span style={{ fontWeight: 700 }}>Zero Extortion Escrow Architecture:</span> Caution deposits are non-custodial and locked inside Soroban smart contracts. Landlords cannot unilaterally confiscate deposits, guaranteeing automated refunds upon peaceful vacancy.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button onClick={() => setShowTelemetryModal(false)} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                Close HUD
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
