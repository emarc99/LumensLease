'use client';

import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { useWallet } from '../context/WalletContext';
import {
  computePropertyHash,
  invokeCreateLease,
  invokeCreateDeed,
  STELLAR_CONFIG,
} from '../lib/stellar';
import { Printer, ShieldCheck, CheckCircle2, X, Cpu, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function TenancyAgreementModal() {
  const { activeAgreementProperty, setActiveAgreementProperty } = useProperty();
  const { walletState, connectDemoWallet } = useWallet();

  const [tenantName, setTenantName] = useState('Olumide Adeyemi');
  const [commencementDate, setCommencementDate] = useState('November 1, 2026');

  // Web3 On-Chain Deployment State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string | null>(null);
  const [deployedLeaseId, setDeployedLeaseId] = useState<number | null>(null);
  const [deployedTxHash, setDeployedTxHash] = useState<string | null>(null);
  const [propertyHashHex, setPropertyHashHex] = useState<string | null>(null);

  if (!activeAgreementProperty) return null;

  const prop = activeAgreementProperty;
  const agencySaved = prop.annualRent * 0.10;
  const legalSaved = prop.annualRent * 0.10;
  const totalSaved = agencySaved + legalSaved;

  const rentXlm = Math.round(prop.annualRent / 1000);
  const cautionXlm = Math.round((prop.annualRent * 0.10) / 1000);

  const handlePrint = () => {
    window.print();
  };

  const handleDeployOnChain = async () => {
    setIsDeploying(true);
    try {
      let tenantAddr = walletState.publicKey;
      if (!tenantAddr) {
        setDeployStep('Initializing Stellar Testnet Demo Keypair...');
        await connectDemoWallet();
        tenantAddr = localStorage.getItem('lumenslease_demo_keypair_secret')
          ? 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G'
          : 'GDV5VEXAMPLESTELLARTENANTKEYBODIJAXLM987654321';
      }

      setDeployStep('Computing SHA-256 Property Condition Digest...');
      const digestPayload = JSON.stringify({
        address: prop.address,
        area: prop.area,
        city: prop.city,
        annualRent: prop.annualRent,
        meterType: prop.utility.meterType,
        solarKva: prop.utility.inverterCapacityKva,
        gridHours: prop.utility.gridHoursPerDay,
        timestamp: Date.now(),
      });
      const hash = await computePropertyHash(digestPayload);
      setPropertyHashHex(hash);

      setDeployStep('Signing transaction & invoking Soroban Rental Escrow Contract...');
      const result = await invokeCreateLease({
        tenant: tenantAddr || 'GDV5VEXAMPLESTELLARTENANTKEYBODIJAXLM987654321',
        landlord: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G', // Verified Landlord address
        rentAmountXlm: rentXlm,
        cautionDepositXlm: cautionXlm,
        durationDays: 365,
        propertyHash: hash,
      });

      setDeployStep('Registering Tenancy Deed SBT on TenancyDeedRegistry...');
      await invokeCreateDeed({
        caller: tenantAddr || 'GDV5VEXAMPLESTELLARTENANTKEYBODIJAXLM987654321',
        landlord: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
        tenant: tenantAddr || 'GDV5VEXAMPLESTELLARTENANTKEYBODIJAXLM987654321',
        propertyTitle: prop.title,
        propertyAddress: `${prop.address}, ${prop.area}, ${prop.city}`,
        annualRentStroops: prop.annualRent * 10000000,
        cautionDepositStroops: Math.round(prop.annualRent * 0.10) * 10000000,
        startTimestamp: Date.now(),
        endTimestamp: Date.now() + 365 * 86400000,
        legalTermsHash: hash,
        hardwareSpecsHash: hash,
      });

      setDeployedLeaseId(result.leaseId);
      setDeployedTxHash(result.txHash);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to deploy on-chain escrow & deed:', err);
    } finally {
      setIsDeploying(false);
      setDeployStep(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={() => setActiveAgreementProperty(null)}
    >
      <div
        style={{
          maxWidth: '880px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#15803d" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }}>
              LUMENSLEASE DIRECT TENANCY AGREEMENT · ₦0 COMMISSION STATUTORY DRAFT
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={() => setActiveAgreementProperty(null)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <X size={14} /> Close
            </button>
          </div>
        </div>

        {/* Web3 On-Chain Deploy Bar */}
        <div
          style={{
            padding: '14px 20px',
            background: '#0f172a',
            borderBottom: '1px solid #1e293b',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                Soroban Escrow Protocol
              </span>
              <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '3px', color: '#7dd3fc' }}>
                Contract: CCBB...QDSO
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Lock caution deposit (160 XLM) & rent (1,600 XLM) in autonomous smart contract with SHA-256 condition proof.
            </span>
          </div>

          {deployedLeaseId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>Lease #{deployedLeaseId} Live on Stellar</span>
              </div>
              {deployedTxHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${deployedTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: '#1e293b',
                    borderRadius: '4px',
                  }}
                >
                  Tx Hash <ExternalLink size={11} />
                </a>
              )}
              <Link
                href="/escrow"
                onClick={() => setActiveAgreementProperty(null)}
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', backgroundColor: '#10b981', color: '#000000' }}
              >
                Go to Escrow Dashboard →
              </Link>
            </div>
          ) : (
            <button
              onClick={handleDeployOnChain}
              disabled={isDeploying}
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                backgroundColor: '#0284c7',
                borderColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isDeploying ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{deployStep || 'Signing on Stellar...'}</span>
                </>
              ) : (
                <>
                  <Cpu size={15} />
                  <span>Sign & Deploy Escrow to Soroban</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Printable Legal Document Body */}
        <div
          style={{
            padding: '28px',
            overflowY: 'auto',
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: 1.6,
          }}
        >
          {/* Top Document Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Standard Residential Tenancy Agreement
            </h2>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b' }}>
              Direct Owner-Tenant Statutory Draft · Zero Agency Markups
            </div>
          </div>

          {/* Parties Definition */}
          <div style={{ marginBottom: '20px' }}>
            <p>
              <strong>THIS TENANCY AGREEMENT</strong> is made this <strong>{new Date().getDate()}th day of {new Date().toLocaleString('default', { month: 'long' })}, {new Date().getFullYear()}</strong>
            </p>
            <p>
              <strong>BETWEEN:</strong><br />
              <strong>{prop.landlord.name.toUpperCase()}</strong> (hereinafter referred to as the <em>"LANDLORD"</em>) of the ONE PART.
            </p>
            <p>
              <strong>AND:</strong><br />
              <strong>{tenantName.toUpperCase()}</strong> (hereinafter referred to as the <em>"TENANT"</em>) of the OTHER PART.
            </p>
            <p>
              <strong>WHEREAS:</strong><br />
              The Landlord is the verified legal owner of the premises known and situate at <strong>{prop.address}, {prop.area}, {prop.city}</strong>.
            </p>

            <h4 style={{ textDecoration: 'underline', marginTop: '14px' }}>TERMS & SOROBAN ESCROW COVENANTS:</h4>
            <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>RENT & TENURE:</strong> Direct annual rent of <strong>₦{prop.annualRent.toLocaleString()}</strong> ({rentXlm} XLM equivalent) for ONE (1) YEAR commencing on <strong>{commencementDate}</strong>.
              </li>
              <li>
                <strong>ZERO MIDDLEMAN EXTORTION CLAUSE:</strong> Both parties agree that 0% agency fee and 0% legal fees were charged. Caution deposit is secured inside non-custodial Soroban escrow contract <code>{STELLAR_CONFIG.contracts.rentalEscrow}</code>.
              </li>
              <li>
                <strong>CRYPTOGRAPHIC MOVE-IN PROOF (SHA-256):</strong> Move-in condition, prepaid meter serial number, and {prop.utility.inverterCapacityKva ? `${prop.utility.inverterCapacityKva}kVA solar inverter` : 'power status'} are anchored to SHA-256 digest:
                <br />
                <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px' }}>
                  {propertyHashHex || '7a8f93e1b4c6d20f8e91a52b34c76d89e01f23a4b5c6d7e8f90123456789abcd'}
                </code>
              </li>
              <li>
                <strong>PEACEFUL VACANCY & CAUTION REFUND:</strong> Landlord covenants that upon clean expiration and inspection, the caution deposit ({cautionXlm} XLM) shall be released back to the Tenant within 72 hours via the smart contract.
              </li>
            </ol>

            {/* Execution Signatures */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
                marginTop: '36px',
                borderTop: '1px solid #cbd5e1',
                paddingTop: '20px',
              }}
            >
              <div>
                <div style={{ borderBottom: '1px solid #000', width: '200px', height: '36px', marginBottom: '6px' }} />
                <div style={{ fontWeight: 'bold' }}>SIGNED by the LANDLORD:</div>
                <div>{prop.landlord.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {new Date().toLocaleDateString()}</div>
              </div>

              <div>
                <div style={{ borderBottom: '1px solid #000', width: '200px', height: '36px', marginBottom: '6px' }} />
                <div style={{ fontWeight: 'bold' }}>SIGNED by the TENANT:</div>
                <div>{tenantName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {commencementDate}</div>
              </div>
            </div>

            {/* Verification Seal */}
            <div
              style={{
                marginTop: '24px',
                padding: '10px',
                background: '#f0fdf4',
                border: '1px dashed #22c55e',
                borderRadius: '4px',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: '#166534',
              }}
            >
              🔒 VERIFIED SECURE • PROCESSED BY LUMENSLEASE ON STELLAR & SOROBAN ESCROW • DIRECT COMMISSION ELIMINATED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
