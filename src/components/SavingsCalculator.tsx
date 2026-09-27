'use client';

import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { Calculator, ShieldCheck, ArrowRight, Zap, PiggyBank } from 'lucide-react';

export default function SavingsCalculator() {
  const { setActiveView } = useProperty();
  const [rent, setRent] = useState(2000000);

  const agencyFee = rent * 0.10;
  const legalFee = rent * 0.10;
  const inspectionFees = 25000;
  const totalExtortion = agencyFee + legalFee + inspectionFees;
  const percentageExtra = ((totalExtortion / rent) * 100).toFixed(1);

  return (
    <section style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="retro-badge badge-solar">
            <Calculator size={14} /> MIDDLEMAN COST BREAKDOWN
          </span>
          <span className="retro-badge badge-zero-cut">
            <PiggyBank size={14} /> 100% POCKETED BY YOU
          </span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
          The True Cost of Street Agents
        </h1>

        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          In Nigeria, agents charge up to 50% extra in "total package" markups. See how much money LockHouse keeps directly in your bank account.
        </p>
      </div>

      <div className="retro-window">
        <div className="window-header">
          <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--amber-light)', fontWeight: 700 }}>
            EXTORTION CALCULATOR // ZERO COMMISSION SIMULATOR
          </span>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-light)' }}>
            FORMULA: RENT + 0% COMMISSIONS
          </span>
        </div>

        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Slider Input */}
          <div style={{
            background: 'var(--bg-input)',
            border: '2px solid var(--border-bold)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ANNUAL RENT TARGET:
              </span>
              <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-light)' }}>
                ₦{rent.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="500000"
              max="10000000"
              step="100000"
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              style={{ accentColor: 'var(--amber-primary)', width: '100%', height: '8px', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>₦500,000 (Self-Contained)</span>
              <span>₦2,000,000 (2-Bed Flat)</span>
              <span>₦10,000,000 (Luxury House)</span>
            </div>
          </div>

          {/* Extortion Comparison Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Traditional Agent Breakdown */}
            <div className="retro-card" style={{ padding: '18px', background: 'rgba(239, 68, 68, 0.05)', borderColor: '#ef4444' }}>
              <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                Traditional Street Agent Cost
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Agency Fee (10%):</span>
                  <strong style={{ color: '#ef4444' }}>+₦{agencyFee.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Legal / Agreement (10%):</span>
                  <strong style={{ color: '#ef4444' }}>+₦{legalFee.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Inspection Scams (Avg):</span>
                  <strong style={{ color: '#ef4444' }}>+₦{inspectionFees.toLocaleString()}</strong>
                </div>
                <div style={{ borderTop: '1px solid rgba(239, 68, 68, 0.3)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Total Middleman Waste:</span>
                  <span style={{ color: '#ef4444' }}>₦{totalExtortion.toLocaleString()} (+{percentageExtra}%)</span>
                </div>
              </div>
            </div>

            {/* LockHouse Direct Breakdown */}
            <div className="retro-card" style={{ padding: '18px', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'var(--emerald-primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--emerald-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                LockHouse Direct-to-Owner
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Agency Fee:</span>
                  <strong style={{ color: 'var(--emerald-light)' }}>₦0 (0%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Legal / Agreement:</span>
                  <strong style={{ color: 'var(--emerald-light)' }}>₦0 (Free Standard Draft)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Inspection Fee:</span>
                  <strong style={{ color: 'var(--emerald-light)' }}>₦0 (Always Free)</strong>
                </div>
                <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.3)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Total Extortion Paid:</span>
                  <span style={{ color: 'var(--emerald-light)' }}>₦0 (100% Free)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Highlight Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(6, 182, 212, 0.15))',
            border: '2px solid var(--amber-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--amber-light)', fontWeight: 700 }}>
              YOUR TOTAL DIRECT SAVINGS WITH LOCKHOUSE:
            </span>
            <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', textShadow: '2px 2px 0px #000' }}>
              ₦{totalExtortion.toLocaleString()}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto' }}>
              That is enough money to buy a 3.5kVA hybrid solar inverter battery or pay 3 months of groceries in Lagos!
            </p>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveView('feed')}
              className="retro-btn retro-btn-amber"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              <span>Explore Verified ₦0 Homes</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setActiveView('landlord_studio')}
              className="retro-btn retro-btn-teal"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              <span>List House via Voice Studio</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
