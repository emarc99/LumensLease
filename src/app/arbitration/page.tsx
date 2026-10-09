'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useWallet } from '../../context/WalletContext';
import {
  STELLAR_CONFIG,
  DisputeCaseState,
  getSavedDisputes,
  invokeLodgeDisputeCase,
  invokeCastArbitratorVote,
} from '../../lib/stellar';
import {
  Scale,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  ExternalLink,
  Users,
  Camera,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function DisputeArbitrationPage() {
  const { walletState } = useWallet();
  const [disputes, setDisputes] = useState<DisputeCaseState[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showLodgeForm, setShowLodgeForm] = useState(false);

  // New dispute form state
  const [leaseIdInput, setLeaseIdInput] = useState('105');
  const [cautionAmountInput, setCautionAmountInput] = useState('35');
  const [tenantInput, setTenantInput] = useState('GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G');
  const [landlordInput, setLandlordInput] = useState('GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46');

  const reloadDisputes = () => {
    setDisputes(getSavedDisputes());
  };

  useEffect(() => {
    reloadDisputes();
  }, []);

  const handleCastVote = async (
    disputeId: number,
    option: 'RefundTenantFull' | 'PayLandlordFull' | 'SplitFiftyFifty'
  ) => {
    const arbiterAddress = walletState.publicKey || 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G';
    setLoadingAction(`vote_${disputeId}_${option}`);
    try {
      const res = await invokeCastArbitratorVote(arbiterAddress, disputeId, option);
      reloadDisputes();
      if (res.isResolved) {
        confetti({ particleCount: 80, spread: 60 });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLodgeDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction('lodge');
    try {
      const moveIn = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const moveOut = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      await invokeLodgeDisputeCase({
        caller: walletState.publicKey || tenantInput,
        leaseId: parseInt(leaseIdInput) || 105,
        tenant: tenantInput,
        landlord: landlordInput,
        cautionAmount: parseFloat(cautionAmountInput) || 35,
        moveInHash: moveIn,
        moveOutHash: moveOut,
      });
      setShowLodgeForm(false);
      reloadDisputes();
      confetti({ particleCount: 50, spread: 45 });
    } finally {
      setLoadingAction(null);
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'RefundTenantFull':
        return { color: '#10b981', label: '100% Refunded to Tenant (Fair Wear & Tear)' };
      case 'PayLandlordFull':
        return { color: '#f87171', label: '100% Paid to Landlord (Proven Damage)' };
      case 'SplitFiftyFifty':
        return { color: '#fbbf24', label: '50/50 Equitable Split Settled' };
      default:
        return { color: '#94a3b8', label: 'Awaiting Jury Consensus (2 Concurring Votes)' };
    }
  };

  return (
    <div className="shell">
      <Header />

      <main className="page container" style={{ paddingBottom: '70px' }}>
        {/* Title Section */}
        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#c084fc',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            <Gavel size={16} />
            Soroban Multi-Party Arbitration & Jury Standard
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#f8fafc' }}>
                Rental Dispute Arbitration Room
              </h1>
              <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '1rem', maxWidth: '680px' }}>
                Replaces corrupt informal racketeers and 3-year civil court backlogs with a decentralized 2-of-3 community juror panel voting on cryptographic Move-In vs. Move-Out inspection proofs.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLodgeForm(!showLodgeForm)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {showLodgeForm ? 'Close Form' : '+ Lodge New Dispute'}
              </button>

              <a
                href={`https://stellar.expert/explorer/testnet/contract/${STELLAR_CONFIG.contracts.disputeArbiter}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
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
                Arbiter Contract on Explorer <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Accredited Arbitrator Panel Banner */}
        <div
          style={{
            backgroundColor: '#0c111d',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '22px',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Users size={18} color="#c084fc" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
              Accredited Community Arbitrators (2-of-3 Consensus Required)
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#131b2e', border: '1px solid #1e293b' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#38bdf8' }}>Seat 01: Lagos Tenants Rights Union</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Advocacy & Statutory Tenant Protection</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#131b2e', border: '1px solid #1e293b' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#34d399' }}>Seat 02: Estate Surveyors Board</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Independent Hardware & Wear-and-Tear Audit</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#131b2e', border: '1px solid #1e293b' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fbbf24' }}>Seat 03: Community Housing Ombudsman</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Neutral Legal Aid & Dispute Conciliation</div>
            </div>
          </div>
        </div>

        {/* Lodge Dispute Form */}
        {showLodgeForm && (
          <form
            onSubmit={handleLodgeDispute}
            style={{
              backgroundColor: '#0c111d',
              border: '1px solid #9333ea',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              Lodge New Caution Deposit Dispute on Soroban
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Lease ID
                </label>
                <input
                  type="text"
                  value={leaseIdInput}
                  onChange={(e) => setLeaseIdInput(e.target.value)}
                  style={{ width: '100%', background: '#131b2e', border: '1px solid #334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Disputed Caution Deposit (XLM)
                </label>
                <input
                  type="number"
                  value={cautionAmountInput}
                  onChange={(e) => setCautionAmountInput(e.target.value)}
                  style={{ width: '100%', background: '#131b2e', border: '1px solid #334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Tenant Public Key
                </label>
                <input
                  type="text"
                  value={tenantInput}
                  onChange={(e) => setTenantInput(e.target.value)}
                  style={{ width: '100%', background: '#131b2e', border: '1px solid #334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Landlord Public Key
                </label>
                <input
                  type="text"
                  value={landlordInput}
                  onChange={(e) => setLandlordInput(e.target.value)}
                  style={{ width: '100%', background: '#131b2e', border: '1px solid #334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLodgeForm(false)}
                style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingAction === 'lodge'}
                style={{ background: '#9333ea', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                {loadingAction === 'lodge' ? 'Submitting...' : 'Register Dispute & Hash Evidence'}
              </button>
            </div>
          </form>
        )}

        {/* Dispute Cases Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {disputes.map((caseItem) => {
            const verdictInfo = getVerdictLabel(caseItem.finalVerdict);
            const totalVotes = caseItem.votesRefundTenant + caseItem.votesPayLandlord + caseItem.votesSplit;

            return (
              <div
                key={caseItem.disputeId}
                style={{
                  backgroundColor: '#0c111d',
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#1e293b', fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>
                      Case #{caseItem.disputeId} · Lease #{caseItem.leaseId}
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: caseItem.isResolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: caseItem.isResolved ? '#34d399' : '#f87171',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                      }}
                    >
                      {caseItem.isResolved ? '✓ SETTLED & BINDING' : '⌛ IN JURY VOTING'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700 }}>
                    Caution Deposit: <span style={{ color: '#38bdf8' }}>{caseItem.cautionAmount} XLM</span>
                  </div>
                </div>

                {/* Evidence Hashes Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: '#131b2e',
                    border: '1px solid #1e293b',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={14} color="#10b981" /> Move-In Baseline Photo Hash
                    </div>
                    <code style={{ fontSize: '0.75rem', color: '#34d399', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                      {caseItem.moveInHash}
                    </code>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      Baseline hardware state (Conlog Prepaid & Inverter)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={14} color="#f87171" /> Move-Out Exit Photo Hash
                    </div>
                    <code style={{ fontSize: '0.75rem', color: '#f87171', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                      {caseItem.moveOutHash}
                    </code>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      Alleged damage delta presented by landlord
                    </div>
                  </div>
                </div>

                {/* Jury Tally & Status */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderTop: '1px solid #1e293b',
                    paddingTop: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                      Current Jury Ruling:
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: verdictInfo.color, marginTop: '2px' }}>
                      {verdictInfo.label}
                    </div>
                    {caseItem.isResolved && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Disbursed: Tenant <strong>{caseItem.tenantPayout} XLM</strong> · Landlord <strong>{caseItem.landlordPayout} XLM</strong>
                      </div>
                    )}
                  </div>

                  {/* Voting Actions if Pending */}
                  {!caseItem.isResolved ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleCastVote(caseItem.disputeId, 'RefundTenantFull')}
                        disabled={!!loadingAction}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34d399',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Vote: Refund Tenant ({caseItem.votesRefundTenant}/2)
                      </button>

                      <button
                        onClick={() => handleCastVote(caseItem.disputeId, 'SplitFiftyFifty')}
                        disabled={!!loadingAction}
                        style={{
                          background: 'rgba(251, 191, 36, 0.15)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          color: '#fbbf24',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Vote: Split 50/50 ({caseItem.votesSplit}/2)
                      </button>

                      <button
                        onClick={() => handleCastVote(caseItem.disputeId, 'PayLandlordFull')}
                        disabled={!!loadingAction}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Vote: Pay Landlord ({caseItem.votesPayLandlord}/2)
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                      ✓ Quorum Verdict Executed on Escrow
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
