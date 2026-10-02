'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, CheckCircle2, XCircle, PiggyBank, Sparkles, Fuel, Wifi, ShieldCheck } from 'lucide-react';

export default function SavingsCalculator() {
  const [rent, setRent] = useState(2500000);

  const agencyFee = rent * 0.10;
  const legalFee = rent * 0.10;
  const inspectionFees = 25000;
  const totalExtortion = agencyFee + legalFee + inspectionFees;
  const percentageExtra = ((totalExtortion / rent) * 100).toFixed(1);

  // Purchasing power calculations for Nigeria
  const petrolLiters = Math.floor(totalExtortion / 1200);
  const starlinkMonths = (totalExtortion / 38000).toFixed(1);
  const foodStuffsWeeks = Math.floor(totalExtortion / 45000);

  return (
    <div className="savings-calc-container" style={{ maxWidth: '980px', margin: '0 auto', padding: '10px 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <PiggyBank size={14} color="var(--orange)" /> Zero Commission Economics
        </div>
        <h2 style={{ fontSize: '38px', letterSpacing: '-0.06em', margin: '10px 0 12px', lineHeight: 1.15 }}>
          The True Cost of Street Agents
        </h2>
        <p className="hero-copy" style={{ maxWidth: '640px', margin: '0 auto' }}>
          In Lagos and Ibadan, middleman agents tack on up to <strong>20%–30%</strong> in mandatory agency, legal drafting, and inspection fees. See exactly what LockHouse saves you.
        </p>
      </div>

      <div className="panel" style={{ padding: '32px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
        {/* Slider Input Box */}
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Annual Rent:
            </span>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--ink)' }}>
              ₦{rent.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--muted)' }}>/ year</span>
            </span>
          </div>

          <input
            type="range"
            min="500000"
            max="10000000"
            step="100000"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            style={{
              width: '100%',
              margin: '16px 0 12px',
              accentColor: 'var(--ink)',
              height: '8px',
              cursor: 'pointer'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', flexWrap: 'wrap', gap: '8px' }}>
            <span>₦500k (Self-Contained)</span>
            <span>₦2.5M (2-Bed Flat)</span>
            <span>₦5M (3-Bed Duplex)</span>
            <span>₦10M (Executive House)</span>
          </div>
        </div>

        {/* Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {/* Traditional Middleman Cost */}
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={18} color="#e11d48" />
              <strong style={{ fontSize: '0.95rem', color: '#9f1239' }}>Traditional Street Agent</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#4c0519' }}>Agency Fee (10%):</span>
              <strong style={{ color: '#e11d48' }}>+₦{agencyFee.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#4c0519' }}>Legal Drafting (10%):</span>
              <strong style={{ color: '#e11d48' }}>+₦{legalFee.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#4c0519' }}>Inspection Bribes/Tips:</span>
              <strong style={{ color: '#e11d48' }}>+₦{inspectionFees.toLocaleString()}</strong>
            </div>

            <div style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px dashed #fecdd3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#9f1239', display: 'block', fontWeight: 600 }}>Total Sunk Markup:</span>
                <span style={{ fontSize: '0.75rem', color: '#be123c' }}>+{percentageExtra}% on top of rent</span>
              </div>
              <strong style={{ fontSize: '1.4rem', color: '#e11d48', fontWeight: 800 }}>
                ₦{totalExtortion.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* LockHouse Direct Model */}
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #bbf7d0',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <strong style={{ fontSize: '0.95rem', color: '#166534' }}>LockHouse Direct Model</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#14532d' }}>Agency Fee (0%):</span>
              <strong style={{ color: '#16a34a' }}>₦0 FREE</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#14532d' }}>Statutory Agreement (0%):</span>
              <strong style={{ color: '#16a34a' }}>₦0 INCLUDED</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#14532d' }}>Gate Inspection:</span>
              <strong style={{ color: '#16a34a' }}>₦0 ZERO DRAMA</strong>
            </div>

            <div style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px dashed #bbf7d0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#166534', display: 'block', fontWeight: 600 }}>Direct Middleman Cost:</span>
                <span style={{ fontSize: '0.75rem', color: '#15803d' }}>100% direct to verified landlord</span>
              </div>
              <strong style={{ fontSize: '1.4rem', color: '#16a34a', fontWeight: 800 }}>
                ₦0
              </strong>
            </div>
          </div>
        </div>

        {/* Big Savings Callout & Real World Equivalents */}
        <div style={{
          background: 'var(--ink)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Instant Net Savings
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                ₦{totalExtortion.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/" className="btn btn-primary" style={{ background: '#ffffff', color: 'var(--ink)' }}>
                Explore ₦0-Fee Homes <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Fuel size={20} color="#f59e0b" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>~{petrolLiters.toLocaleString()} Liters</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Generator / vehicle petrol</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wifi size={20} color="#38bdf8" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>~{starlinkMonths} Months</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unlimited Starlink internet</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#a78bfa" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>~{foodStuffsWeeks} Weeks</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Family grocery provisioning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
