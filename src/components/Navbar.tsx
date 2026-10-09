'use client';

import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { ShieldCheck, Zap, Home, Mic, FileText, Calculator, Server, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { totalSavingsNgn, activeView, setActiveView, awsConnection } = useProperty();
  const [showAwsModal, setShowAwsModal] = useState(false);

  return (
    <>
      <header style={{
        background: 'rgba(18, 23, 34, 0.95)',
        borderBottom: '2px solid var(--border-bold)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 24px'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logo & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setActiveView('feed')}>
            <div style={{
              background: 'linear-gradient(135deg, var(--amber-primary), #d97706)',
              color: '#000',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--border-hard)',
              boxShadow: 'var(--shadow-retro)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
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
          <div style={{
            background: 'rgba(10, 13, 20, 0.85)',
            border: '1px solid var(--border-bold)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
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
                borderColor: activeView === 'feed' ? '#000' : 'var(--border-bold)'
              }}
            >
              <Home size={16} />
              <span>Explore Homes</span>
            </button>

            <button
              onClick={() => setActiveView('landlord_studio')}
              className="retro-btn"
              style={{
                padding: '8px 14px',
                fontSize: '0.85rem',
                background: activeView === 'landlord_studio' ? 'var(--teal-primary)' : 'var(--bg-card)',
                color: activeView === 'landlord_studio' ? '#000' : 'var(--text-primary)',
                borderColor: activeView === 'landlord_studio' ? '#000' : 'var(--border-bold)'
              }}
            >
              <Mic size={16} />
              <span>Landlord Voice Studio</span>
            </button>

            <button
              onClick={() => setActiveView('savings_calculator')}
              className="retro-btn retro-btn-dark"
              style={{
                padding: '8px 14px',
                fontSize: '0.85rem',
                borderColor: activeView === 'savings_calculator' ? 'var(--amber-primary)' : 'var(--border-bold)'
              }}
            >
              <Calculator size={16} />
              <span>Savings Calc</span>
            </button>

            {/* AWS Connected Agent Badge */}
            <div
              onClick={() => setShowAwsModal(true)}
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid var(--teal-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Click to view Stellar & Soroban Protocol Telemetry"
            >
              <div className="pulse-dot" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--teal-light)', fontWeight: 800 }}>
                  STELLAR TESTNET
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                  Soroban Escrow • Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stellar & Soroban Protocol Modal */}
      {showAwsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}
        onClick={() => setShowAwsModal(false)}
        >
          <div
            className="retro-window"
            style={{ maxWidth: '560px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="window-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--teal-primary)" />
                <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  LUMENSLEASE PROTOCOL & NETWORK TELEMETRY
                </span>
              </div>
              <button
                onClick={() => setShowAwsModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700 }}
              >
                [ESC]
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(10, 13, 20, 0.8)',
                border: '1px solid var(--border-bold)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Deployed Soroban Contract:</span>
                  <span style={{ color: 'var(--amber-light)', fontWeight: 700, fontSize: '0.75rem', wordBreak: 'break-all' }}>
                    CBK6CZCHOUNZOPBYZCIVFUVUAVBGIBLUOY3KPB4RQL6ISMQQKJYZYYZE
                  </span>
                  <a
                    href="https://stellar.expert/explorer/testnet/contract/CBK6CZCHOUNZOPBYZCIVFUVUAVBGIBLUOY3KPB4RQL6ISMQQKJYZYYZE"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--teal-light)', fontSize: '0.72rem', textDecoration: 'underline' }}
                  >
                    View Contract on Stellar Expert →
                  </a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Network:</span>
                  <span style={{ color: 'var(--teal-light)' }}>Test SDF Network (Testnet)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Settlement Currencies:</span>
                  <span style={{ color: 'var(--emerald-light)' }}>Stellar USDC • cNGN • XLM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Account Abstraction:</span>
                  <span style={{ color: 'var(--text-primary)' }}>Freighter & Passkey Kit Ready</span>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--emerald-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={24} color="var(--emerald-primary)" />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  <strong>Autonomous Escrow Protection:</strong> Security deposits are escrowed directly on Soroban. Landlords cannot unilaterally confiscate funds; peaceful move-outs automatically refund tenants.
                </div>
              </div>

              <button
                onClick={() => setShowAwsModal(false)}
                className="retro-btn retro-btn-amber"
                style={{ width: '100%', marginTop: '6px' }}
              >
                Close Protocol Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
