'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useWallet } from '../../context/WalletContext';
import {
  OnChainLeaseRecord,
  getSavedLeases,
  invokeFundLease,
  invokeDisburseRent,
  invokeReleaseDeposit,
  invokeProposeDamageDeduction,
  invokeAcceptDamageDeduction,
  invokeRejectDamageDeduction,
  invokeClaimDepositTimeout,
  invokeCancelUnfundedLease,
  invokeRaiseDispute,
  invokeResolveDispute,
  STELLAR_CONFIG,
} from '../../lib/stellar';
import {
  Shield,
  Cpu,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Unlock,
  Coins,
  FileCheck,
  Scale,
  RefreshCw,
  Zap,
  Clock,
  Wrench,
  Ban,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function EscrowConsolePage() {
  const { walletState, connectDemoWallet, connectFreighter, isConnecting } = useWallet();
  const [leases, setLeases] = useState<OnChainLeaseRecord[]>([]);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedDisputeLease, setSelectedDisputeLease] = useState<number | null>(null);
  const [selectedDamageLease, setSelectedDamageLease] = useState<number | null>(null);
  const [damageAmountInput, setDamageAmountInput] = useState('10');
  const [disputeReason, setDisputeReason] = useState('Damaged inverter batteries and cracked bathroom tiles');

  const reloadLeases = () => {
    setLeases(getSavedLeases());
  };

  useEffect(() => {
    reloadLeases();
  }, []);

  const totalValueLockedXlm = leases.reduce((acc, l) => {
    if (l.status === 'Funded' || l.status === 'Active' || l.status === 'Disputed' || l.status === 'DamageProposed') {
      return acc + l.cautionDepositXlm + (l.rentDisbursed ? 0 : l.rentAmountXlm);
    }
    return acc;
  }, 0);

  const totalCautionProtectedXlm = leases.reduce((acc, l) => {
    if (l.status === 'Funded' || l.status === 'Active' || l.status === 'Disputed' || l.status === 'DamageProposed') {
      return acc + l.cautionDepositXlm;
    }
    return acc;
  }, 0);

  const handleFund = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`fund_${leaseId}`]: true }));
    try {
      await invokeFundLease(leaseId, walletState.publicKey || 'GDV5V...DEMO');
      reloadLeases();
      confetti({ particleCount: 60, spread: 50 });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`fund_${leaseId}`]: false }));
    }
  };

  const handleDisburseRent = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`disburse_${leaseId}`]: true }));
    try {
      await invokeDisburseRent(leaseId, walletState.publicKey || 'GDV5V...DEMO');
      reloadLeases();
      confetti({ particleCount: 70, spread: 60 });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`disburse_${leaseId}`]: false }));
    }
  };

  const handleReleaseDeposit = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`release_${leaseId}`]: true }));
    try {
      await invokeReleaseDeposit(leaseId, walletState.publicKey || 'GDV5V...DEMO');
      reloadLeases();
      confetti({ particleCount: 90, spread: 70 });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`release_${leaseId}`]: false }));
    }
  };

  const handleProposeDamage = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`propose_dmg_${leaseId}`]: true }));
    try {
      const deduction = parseFloat(damageAmountInput) || 10;
      const mockEvidence = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      await invokeProposeDamageDeduction(leaseId, walletState.publicKey || 'GDV5V...DEMO', deduction, mockEvidence);
      setSelectedDamageLease(null);
      reloadLeases();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`propose_dmg_${leaseId}`]: false }));
    }
  };

  const handleAcceptDamage = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`accept_dmg_${leaseId}`]: true }));
    try {
      await invokeAcceptDamageDeduction(leaseId, walletState.publicKey || 'GDV5V...DEMO');
      reloadLeases();
      confetti({ particleCount: 70, spread: 60 });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`accept_dmg_${leaseId}`]: false }));
    }
  };

  const handleRejectDamage = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`reject_dmg_${leaseId}`]: true }));
    try {
      await invokeRejectDamageDeduction(leaseId, walletState.publicKey || 'GDV5V...DEMO');
      reloadLeases();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`reject_dmg_${leaseId}`]: false }));
    }
  };

  const handleClaimTimeout = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`timeout_${leaseId}`]: true }));
    try {
      await invokeClaimDepositTimeout(leaseId, walletState.publicKey || 'GDV5V...DEMO');
      reloadLeases();
      confetti({ particleCount: 80, spread: 65 });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`timeout_${leaseId}`]: false }));
    }
  };

  const handleCancelLease = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`cancel_${leaseId}`]: true }));
    try {
      await invokeCancelUnfundedLease(leaseId, walletState.publicKey || 'GDV5V...DEMO');
      reloadLeases();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`cancel_${leaseId}`]: false }));
    }
  };

  const handleRaiseDispute = async (leaseId: number) => {
    setActionLoading((prev) => ({ ...prev, [`dispute_${leaseId}`]: true }));
    try {
      await invokeRaiseDispute(leaseId, walletState.publicKey || 'GDV5V...DEMO', disputeReason);
      setSelectedDisputeLease(null);
      reloadLeases();
    } finally {
      setActionLoading((prev) => ({ ...prev, [`dispute_${leaseId}`]: false }));
    }
  };

  const handleResolveDispute = async (lease: OnChainLeaseRecord) => {
    setActionLoading((prev) => ({ ...prev, [`resolve_${lease.leaseId}`]: true }));
    try {
      const tenantRefund = Math.round(lease.cautionDepositXlm * 0.7);
      const landlordPayout = lease.cautionDepositXlm - tenantRefund;
      await invokeResolveDispute(lease.leaseId, STELLAR_CONFIG.contracts.adminDeployer, tenantRefund, landlordPayout);
      reloadLeases();
      confetti({ particleCount: 80, spread: 60 });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`resolve_${lease.leaseId}`]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Created':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', label: '01 · CREATED (PENDING FUNDING)' };
      case 'Funded':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: '02 · FUNDED (MOVE-IN PENDING)' };
      case 'Active':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', label: '03 · ACTIVE TENANCY (DEPOSIT ESCROWED)' };
      case 'DamageProposed':
        return { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', label: '⚠️ PARTIAL DAMAGE CLAIM NEGOTIATION' };
      case 'Completed':
        return { bg: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', label: '04 · COMPLETED & REFUNDED' };
      case 'Cancelled':
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'CANCELLED BEFORE FUNDING' };
      case 'Disputed':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', label: '⚠️ DISPUTED (IN ARBITRATION)' };
      default:
        return { bg: '#1e293b', color: '#cbd5e1', label: status };
    }
  };

  return (
    <div className="shell">
      <Header />

      <main className="page container" style={{ paddingBottom: '60px' }}>
        {/* Top Header */}
        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#10b981',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            <Cpu size={16} />
            Soroban Real-World Asset (RWA) Escrow Standard
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#f8fafc' }}>
                Rental Escrow Protocol Console
              </h1>
              <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '1rem', maxWidth: '680px' }}>
                Autonomous caution deposit locking, move-in rent disbursement, photographic damage deductions, and timeout refund guarantees on Stellar Testnet.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={reloadLeases}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={13} /> Sync Ledger
              </button>

              <a
                href={`https://stellar.expert/explorer/testnet/contract/${STELLAR_CONFIG.contracts.rentalEscrow}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
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
                Contract on Explorer <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Protocol Live Telemetry Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div style={{ padding: '20px', borderRadius: '12px', background: '#0c111d', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
              <Coins size={16} /> TOTAL VALUE LOCKED (TVL)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              {totalValueLockedXlm.toLocaleString()} <span style={{ fontSize: '1rem', color: '#64748b' }}>XLM</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
              Locked in Soroban Escrow Contract
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '12px', background: '#0c111d', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
              <Shield size={16} /> CAUTION DEPOSITS ESCROWED
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              {totalCautionProtectedXlm.toLocaleString()} <span style={{ fontSize: '1rem', color: '#64748b' }}>XLM</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
              Guaranteed 0% landlord confiscation risk
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '12px', background: '#0c111d', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
              <Clock size={16} /> TIMEOUT AUTO-REFUND
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              7 Days <span style={{ fontSize: '1rem', color: '#64748b' }}>Grace</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
              Auto-refundable if landlord is inactive
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '12px', background: '#0c111d', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
              <FileCheck size={16} /> VERIFIED LEASES
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              {leases.length} <span style={{ fontSize: '1rem', color: '#64748b' }}>Registered</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
              Bound to SHA-256 Inspection Proofs
            </div>
          </div>
        </div>

        {/* Quick Suite Navigation Banner */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%)',
            border: '1px solid #334155',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Scale size={20} color="#38bdf8" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                Complete 4-Contract Soroban Infrastructure
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Explore Tenant Credit Passport and Decentralized Community Jury rooms.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/passport"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Tenant Credit Passport →
            </Link>

            <Link
              href="/arbitration"
              style={{
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Community Jury Room →
            </Link>
          </div>
        </div>

        {/* Active On-Chain Leases Feed */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            On-Chain Lease Agreements ({leases.length})
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Live Smart Contract States
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {leases.map((lease) => {
            const badge = getStatusBadge(lease.status);
            const isFundLoading = actionLoading[`fund_${lease.leaseId}`];
            const isDisburseLoading = actionLoading[`disburse_${lease.leaseId}`];
            const isReleaseLoading = actionLoading[`release_${lease.leaseId}`];
            const isProposeLoading = actionLoading[`propose_dmg_${lease.leaseId}`];
            const isAcceptLoading = actionLoading[`accept_dmg_${lease.leaseId}`];
            const isRejectLoading = actionLoading[`reject_dmg_${lease.leaseId}`];
            const isTimeoutLoading = actionLoading[`timeout_${lease.leaseId}`];
            const isCancelLoading = actionLoading[`cancel_${lease.leaseId}`];
            const isDisputeLoading = actionLoading[`dispute_${lease.leaseId}`];
            const isResolveLoading = actionLoading[`resolve_${lease.leaseId}`];

            return (
              <div
                key={lease.leaseId}
                style={{
                  backgroundColor: '#0c111d',
                  border: '1px solid #1e293b',
                  borderRadius: '14px',
                  padding: '24px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Lease Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                      }}
                    >
                      Lease #{lease.leaseId}
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {lease.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${lease.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#64748b',
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Ledger Tx <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                {/* Lease Breakdown Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: '#131b2e',
                    border: '1px solid #1e293b',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Rent Settlement</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                      {lease.rentAmountXlm} XLM
                    </div>
                    <div style={{ fontSize: '0.72rem', color: lease.rentDisbursed ? '#10b981' : '#f59e0b', marginTop: '2px', fontWeight: 600 }}>
                      {lease.rentDisbursed ? '✓ Disbursed to Landlord' : '⌛ Locked in Escrow'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Caution Deposit (Locked)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {lease.cautionDepositXlm} XLM
                    </div>
                    <div style={{ fontSize: '0.72rem', color: lease.depositReleased ? '#94a3b8' : '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
                      {lease.depositReleased ? '✓ Refunded / Resolved' : '🔒 Autonomous Smart Lock'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Lease Duration</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                      {lease.durationDays} Days
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      30-Day Storage TTL Auto-Extend
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Physical Audit Digest</div>
                    <code style={{ fontSize: '0.72rem', color: '#34d399', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                      {lease.propertyHash.slice(0, 24)}...
                    </code>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      SHA-256 Move-In Baseline
                    </div>
                  </div>
                </div>

                {/* If Damage Proposed Banner */}
                {lease.status === 'DamageProposed' && lease.proposedDamageAmount && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(234, 179, 8, 0.1)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wrench size={16} /> Landlord Proposes Damage Deduction: {lease.proposedDamageAmount} XLM
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Tenant receives remainder: <strong>{lease.cautionDepositXlm - lease.proposedDamageAmount} XLM</strong>. You can accept this mutual settlement or reject it to escalate to Community Jury Arbitration.
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleAcceptDamage(lease.leaseId)}
                        disabled={isAcceptLoading}
                        style={{
                          background: '#10b981',
                          color: '#000000',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isAcceptLoading ? 'Accepting...' : '✓ Accept Deduction & Refund Balance'}
                      </button>
                      <button
                        onClick={() => handleRejectDamage(lease.leaseId)}
                        disabled={isRejectLoading}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isRejectLoading ? 'Escalating...' : 'Reject & Escalate to Dispute'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Action Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                  {lease.status === 'Created' && (
                    <>
                      <button
                        onClick={() => handleCancelLease(lease.leaseId)}
                        disabled={isCancelLoading}
                        style={{
                          background: 'transparent',
                          color: '#94a3b8',
                          border: '1px solid #334155',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isCancelLoading ? 'Cancelling...' : 'Cancel Lease'}
                      </button>

                      <button
                        onClick={() => handleFund(lease.leaseId)}
                        disabled={isFundLoading}
                        style={{
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px 18px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Lock size={14} /> {isFundLoading ? 'Funding...' : `Fund Escrow (${lease.rentAmountXlm + lease.cautionDepositXlm} XLM)`}
                      </button>
                    </>
                  )}

                  {lease.status === 'Funded' && (
                    <button
                      onClick={() => handleDisburseRent(lease.leaseId)}
                      disabled={isDisburseLoading}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#000000',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={14} /> {isDisburseLoading ? 'Confirming...' : `Confirm Move-In & Disburse Rent (${lease.rentAmountXlm} XLM)`}
                    </button>
                  )}

                  {lease.status === 'Active' && (
                    <>
                      <button
                        onClick={() => handleClaimTimeout(lease.leaseId)}
                        disabled={isTimeoutLoading}
                        style={{
                          background: 'rgba(251, 191, 36, 0.12)',
                          color: '#fbbf24',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Clock size={14} /> {isTimeoutLoading ? 'Claiming...' : 'Claim via Timeout Guarantee'}
                      </button>

                      <button
                        onClick={() => setSelectedDamageLease(selectedDamageLease === lease.leaseId ? null : lease.leaseId)}
                        style={{
                          background: '#1e293b',
                          color: '#e2e8f0',
                          border: '1px solid #334155',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Wrench size={14} /> Propose Damage Deduction
                      </button>

                      <button
                        onClick={() => setSelectedDisputeLease(selectedDisputeLease === lease.leaseId ? null : lease.leaseId)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Raise Dispute
                      </button>

                      <button
                        onClick={() => handleReleaseDeposit(lease.leaseId)}
                        disabled={isReleaseLoading}
                        style={{
                          background: '#10b981',
                          color: '#000000',
                          border: 'none',
                          padding: '9px 18px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Unlock size={14} /> {isReleaseLoading ? 'Refunding...' : `Refund Full Deposit (${lease.cautionDepositXlm} XLM)`}
                      </button>
                    </>
                  )}

                  {lease.status === 'Disputed' && (
                    <button
                      onClick={() => handleResolveDispute(lease)}
                      disabled={isResolveLoading}
                      style={{
                        background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Scale size={14} /> {isResolveLoading ? 'Arbitrating...' : 'Execute Arbitrated Split (70% Tenant / 30% Landlord)'}
                    </button>
                  )}

                  {lease.status === 'Completed' && (
                    <span style={{ fontSize: '0.82rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      ✓ All Funds Disbursed & Settled on Soroban
                    </span>
                  )}
                </div>

                {/* Sub-Modal: Propose Damage Deduction */}
                {selectedDamageLease === lease.leaseId && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#131b2e',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
                      Propose Partial Damage Deduction (Max: {lease.cautionDepositXlm} XLM)
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        min="1"
                        max={lease.cautionDepositXlm}
                        value={damageAmountInput}
                        onChange={(e) => setDamageAmountInput(e.target.value)}
                        style={{
                          width: '120px',
                          background: '#0c111d',
                          border: '1px solid #334155',
                          color: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                        }}
                      />
                      <button
                        onClick={() => handleProposeDamage(lease.leaseId)}
                        disabled={isProposeLoading}
                        style={{
                          background: '#fbbf24',
                          color: '#000000',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isProposeLoading ? 'Submitting...' : 'Submit Damage Claim with Hash'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Modal: Raise Dispute */}
                {selectedDisputeLease === lease.leaseId && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#131b2e',
                      border: '1px solid #ef4444',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', marginBottom: '8px' }}>
                      Lodge Tenancy Dispute with Move-In vs Move-Out Photo Audit
                    </div>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        background: '#0c111d',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        marginBottom: '10px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedDisputeLease(null)}
                        style={{
                          background: 'transparent',
                          color: '#94a3b8',
                          border: '1px solid #334155',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRaiseDispute(lease.leaseId)}
                        disabled={isDisputeLoading}
                        style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 16px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isDisputeLoading ? 'Locking Dispute...' : 'Lock Caution Deposit in Dispute'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
