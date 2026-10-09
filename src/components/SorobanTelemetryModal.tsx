'use client';

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { STELLAR_CONFIG, getSavedLeases, OnChainLeaseRecord } from '../lib/stellar';
import { Shield, ExternalLink, Copy, Check, RefreshCw, Wallet, Cpu, X, Zap, Award, Scale } from 'lucide-react';
import Link from 'next/link';

export default function SorobanTelemetryModal() {
  const {
    walletState,
    isConnecting,
    isFreighterInstalled,
    isTelemetryOpen,
    setIsTelemetryOpen,
    connectFreighter,
    connectDemoWallet,
    disconnect,
    refreshBalance,
  } = useWallet();

  const [copiedContract, setCopiedContract] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [queryLeaseId, setQueryLeaseId] = useState('1');
  const [queryResult, setQueryResult] = useState<OnChainLeaseRecord | { notFound: boolean } | null>(null);

  if (!isTelemetryOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'addr') {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } else {
      setCopiedContract(type);
      setTimeout(() => setCopiedContract(null), 2000);
    }
  };

  const handleQueryLease = () => {
    const leases = getSavedLeases();
    const id = parseInt(queryLeaseId);
    const found = leases.find((l) => l.leaseId === id);
    setQueryResult(found || { notFound: true });
  };

  const contractsList = [
    {
      name: 'Rental Escrow Protocol',
      id: STELLAR_CONFIG.contracts.rentalEscrow,
      key: 'escrow',
      tag: 'Core Escrow & Caution Lock',
      color: '#38bdf8',
    },
    {
      name: 'Landlord Reputation & Audit Registry',
      id: STELLAR_CONFIG.contracts.landlordReputation,
      key: 'rep',
      tag: '0-100 Trust Score & Hardware Audits',
      color: '#34d399',
    },
    {
      name: 'Tenant Credit Passport (Rent-to-Credit)',
      id: STELLAR_CONFIG.contracts.tenantCredit,
      key: 'credit',
      tag: '300-850 FICO & Monthly Rent Gating',
      color: '#fbbf24',
    },
    {
      name: 'Rental Dispute Arbiter (Community Jury)',
      id: STELLAR_CONFIG.contracts.disputeArbiter,
      key: 'dispute',
      tag: '2-of-3 Quorum Caution Arbitration',
      color: '#c084fc',
    },
    {
      name: 'Tenancy Deed Registry (Proof of Address SBT)',
      id: STELLAR_CONFIG.contracts.tenancyDeedRegistry,
      key: 'deed',
      tag: 'Dual-Signed Statutory Deed & KYC Attestation',
      color: '#f43f5e',
    },
    {
      name: 'Monthly Rent Streaming Vault',
      id: STELLAR_CONFIG.contracts.rentStreamVault,
      key: 'stream',
      tag: 'Micro-Rent Streaming & Default Buffer Vault',
      color: '#a855f7',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={() => setIsTelemetryOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#0c111d',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
          color: '#f8fafc',
          fontFamily: 'var(--font-sans, system-ui)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Cpu size={18} color="#0ea5e9" />
              Soroban Protocol Suite & Live Telemetry
            </h3>
          </div>

          <button
            onClick={() => setIsTelemetryOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Wallet Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#131b2e',
              border: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connected Account ({walletState.walletType ? walletState.walletType.toUpperCase() : 'DISCONNECTED'})
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontWeight: 700,
                }}
              >
                Stellar Testnet
              </span>
            </div>

            {walletState.isConnected && walletState.publicKey ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <code style={{ fontSize: '0.85rem', color: '#38bdf8', wordBreak: 'break-all' }}>
                    {walletState.publicKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(walletState.publicKey!, 'addr')}
                    style={{
                      background: '#1e293b',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedAddr ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedAddr ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                      {walletState.balanceXlm}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>XLM</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={refreshBalance}
                      style={{
                        background: '#1e293b',
                        border: 'none',
                        color: '#94a3b8',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <RefreshCw size={12} /> Refresh
                    </button>
                    <button
                      onClick={disconnect}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Connect your Freighter browser wallet or generate an instant testnet account pre-funded with 10,000 XLM.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={connectDemoWallet}
                    disabled={isConnecting}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Zap size={15} /> 1-Click Instant Demo Keypair
                  </button>

                  <button
                    onClick={connectFreighter}
                    disabled={isConnecting}
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#e2e8f0',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Wallet size={15} /> {isFreighterInstalled ? 'Connect Freighter' : 'Freighter (Extension)'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Deployed Smart Contracts Suite */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              All 6 Live Soroban Smart Contracts (Stellar Testnet)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {contractsList.map((c) => (
                <div
                  key={c.key}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: c.color }}>
                        {c.name}
                      </span>
                      <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                        ({c.tag})
                      </span>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${c.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Explorer <ExternalLink size={11} />
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.id}</code>
                    <button
                      onClick={() => copyToClipboard(c.id, c.key)}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                    >
                      {copiedContract === c.key ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick On-Chain Lease Query */}
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Query On-Chain Lease Agreement
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="number"
                min="1"
                value={queryLeaseId}
                onChange={(e) => setQueryLeaseId(e.target.value)}
                placeholder="Enter Lease ID (e.g. 1)"
                style={{
                  flex: 1,
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}
              />
              <button
                onClick={handleQueryLease}
                style={{
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Fetch State
              </button>
            </div>

            {queryResult && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#131b2e', borderRadius: '6px', fontSize: '0.8rem' }}>
                {'notFound' in queryResult ? (
                  <span style={{ color: '#f87171' }}>Lease ID not found in local or on-chain state.</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <strong>Lease ID:</strong> #{queryResult.leaseId}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span style={{ color: '#34d399', fontWeight: 700 }}>{queryResult.status}</span>
                    </div>
                    <div>
                      <strong>Rent:</strong> {queryResult.rentAmountXlm} XLM
                    </div>
                    <div>
                      <strong>Caution Deposit:</strong> {queryResult.cautionDepositXlm} XLM
                    </div>
                    <div>
                      <strong>Visual SHA-256 Digest:</strong>{' '}
                      <code style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                        {queryResult.propertyHash.slice(0, 18)}...
                      </code>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Navigation Links to Protocol Portals */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              borderTop: '1px solid #1e293b',
              paddingTop: '16px',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/escrow"
              onClick={() => setIsTelemetryOpen(false)}
              style={{
                backgroundColor: '#0ea5e9',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Shield size={15} /> Escrow Console
            </Link>

            <Link
              href="/passport"
              onClick={() => setIsTelemetryOpen(false)}
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Award size={15} /> Tenant Credit Passport
            </Link>

            <Link
              href="/arbitration"
              onClick={() => setIsTelemetryOpen(false)}
              style={{
                backgroundColor: '#9333ea',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Scale size={15} /> Dispute Jury Room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
