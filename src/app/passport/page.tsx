'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useWallet } from '../../context/WalletContext';
import {
  STELLAR_CONFIG,
  TenantCreditState,
  getTenantCreditProfile,
  invokeRecordOnTimePayment,
  invokeRecordLeaseCompletion,
} from '../../lib/stellar';
import {
  Award,
  Shield,
  CheckCircle2,
  Calendar,
  CreditCard,
  Zap,
  TrendingUp,
  ExternalLink,
  Lock,
  ArrowRight,
  Flame,
  BadgeCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function TenantPassportPage() {
  const { walletState, connectDemoWallet, connectFreighter, isConnecting } = useWallet();
  const [profile, setProfile] = useState<TenantCreditState | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentTx, setRecentTx] = useState<string | null>(null);

  const activeAddress = walletState.publicKey || 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G';

  const reloadProfile = () => {
    setProfile(getTenantCreditProfile(activeAddress));
  };

  useEffect(() => {
    reloadProfile();
  }, [activeAddress]);

  const handleRecordPayment = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const res = await invokeRecordOnTimePayment(
        activeAddress,
        activeAddress,
        profile.totalLeasesCompleted + 1,
        150
      );
      setRecentTx(res.txHash);
      reloadProfile();
      confetti({ particleCount: 60, spread: 50 });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordCompletion = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const res = await invokeRecordLeaseCompletion(
        activeAddress,
        activeAddress,
        profile.totalLeasesCompleted + 1,
        true
      );
      setRecentTx(res.txHash);
      reloadProfile();
      confetti({ particleCount: 90, spread: 70 });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  // Percentage for score meter (300 to 850 range = 550 spread)
  const scorePct = Math.min(100, Math.max(0, ((profile.creditScore - 300) / 550) * 100));

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return '#e0e7ff';
      case 'Gold':
        return '#fbbf24';
      case 'Silver':
        return '#94a3b8';
      default:
        return '#cd7f32';
    }
  };

  return (
    <div className="shell">
      <Header />

      <main className="page container" style={{ paddingBottom: '70px' }}>
        {/* Page Title */}
        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fbbf24',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            <Award size={16} />
            Soroban Sovereign Rent-to-Credit Protocol
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#f8fafc' }}>
                Tenant Rental Credit Passport
              </h1>
              <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '1rem', maxWidth: '680px' }}>
                Turn on-time rent payments and clean caution deposit refunds into an immutable on-chain credit score on Stellar. Unlock monthly flexible leases and abolish the 1-to-2 year upfront cash extortion.
              </p>
            </div>

            <a
              href={`https://stellar.expert/explorer/testnet/contract/${STELLAR_CONFIG.contracts.tenantCredit}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Passport Contract on Explorer <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Credit Gauge & Identity Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {/* Main FICO Meter Card */}
          <div
            style={{
              backgroundColor: '#0c111d',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stellar Credit Score
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    color: getTierColor(profile.tier),
                    border: `1px solid ${getTierColor(profile.tier)}`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  {profile.tier.toUpperCase()} TIER
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                  {profile.creditScore}
                </div>
                <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>
                  / 850
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#1e293b',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: `${scorePct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)',
                    borderRadius: '5px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>300 (Subprime)</span>
                <span>580 (Fair)</span>
                <span>680 (Monthly Eligible)</span>
                <span>850 (Exceptional)</span>
              </div>
            </div>

            {/* Monthly Rent Qualification Box */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: profile.qualifiesForMonthlyRent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: profile.qualifiesForMonthlyRent ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {profile.qualifiesForMonthlyRent ? (
                <BadgeCheck size={28} color="#10b981" />
              ) : (
                <Lock size={28} color="#ef4444" />
              )}
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: profile.qualifiesForMonthlyRent ? '#34d399' : '#f87171',
                  }}
                >
                  {profile.qualifiesForMonthlyRent
                    ? 'Qualified for Monthly Flexible Rent!'
                    : 'Requires 1-Year Upfront Guarantee (Score < 680)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  {profile.qualifiesForMonthlyRent
                    ? 'Landlords can safely accept monthly micro-disbursements without requiring 1-2 years upfront cash.'
                    : `Score is currently ${profile.creditScore}. Complete ${Math.ceil((680 - profile.creditScore) / 10)} more on-time payments to unlock monthly rent terms.`}
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Identity Ledger Card */}
          <div
            style={{
              backgroundColor: '#0c111d',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                On-Chain Verification Passport
              </span>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={15} color="#f59e0b" /> On-Time Payment Streak
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {profile.onTimePaymentsStreak} Consecutive Months
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} color="#10b981" /> Clean Caution Deposit Refunds
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>
                    {profile.cleanDepositRefunds} of {profile.totalLeasesCompleted} Completed
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#38bdf8" /> Tenancy History Tenure
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {profile.totalLeasesCompleted * 12 + 6} Months Active
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={15} color="#c084fc" /> Registered Identity Hash
                  </span>
                  <code style={{ fontSize: '0.75rem', color: '#c084fc' }}>
                    {profile.identityHash.slice(0, 16)}...
                  </code>
                </div>
              </div>
            </div>

            {/* Live Interactive Simulator Actions */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
                Simulate Real-Time On-Chain Attestations:
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleRecordPayment}
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <TrendingUp size={14} color="#10b981" />
                  {loading ? 'Submitting...' : '+10 Pts: Pay Monthly Rent'}
                </button>

                <button
                  onClick={handleRecordCompletion}
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#000000',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <BadgeCheck size={15} />
                  {loading ? 'Submitting...' : '+25 Pts: Refund Clean Deposit'}
                </button>
              </div>

              {recentTx && (
                <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#38bdf8' }}>
                  ✓ Attestation recorded on Soroban! Tx: <code>{recentTx.slice(0, 16)}...</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it solves the rental problem explainer */}
        <div
          style={{
            padding: '24px',
            borderRadius: '14px',
            backgroundColor: '#0c111d',
            border: '1px solid #1e293b',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 10px 0' }}>
            Why On-Chain Rent-to-Credit Transforms African Tenancy
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
            In traditional emerging markets, tenants pay millions in rent for years with zero financial record. Landlords continue demanding 1 to 2 years upfront in cash because there is no trusted credit registry. <strong>LumensLease Tenant Credit Passport</strong> immutably anchors payment discipline and deposit return history on the Stellar ledger, converting timely payments into cryptographic creditworthiness recognized by institutional and private landlords.
          </p>
        </div>
      </main>
    </div>
  );
}
