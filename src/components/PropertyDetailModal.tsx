'use client';

import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { useWallet } from '../context/WalletContext';
import { 
  Zap, Droplet, Shield, Gauge, MessageSquare, Check, X, 
  UserCheck, FileCheck, ShieldCheck, 
  Star, Award, CheckCircle2, Cpu, Loader2,
  Wrench, Fuel, Users
} from 'lucide-react';
import { invokeSubmitTenantReview, STELLAR_CONFIG } from '../lib/stellar';
import Link from 'next/link';

export default function PropertyDetailModal() {
  const { selectedProperty, setSelectedProperty, setActiveChatProperty, setActiveAgreementProperty } = useProperty();
  const { walletState, connectDemoWallet } = useWallet();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewNote, setReviewNote] = useState('Excellent landlord, prompt solar maintenance and zero caution deposit hassle.');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [currentTrustScore, setCurrentTrustScore] = useState(94);

  if (!selectedProperty) return null;

  const prop = selectedProperty;
  const agencyFeeTraditional = prop.annualRent * 0.10;
  const agreementFeeTraditional = prop.annualRent * 0.10;
  const inspectionFeeTraditional = 15000;
  const totalMiddlemanExtortion = agencyFeeTraditional + agreementFeeTraditional + inspectionFeeTraditional;

  const cautionAmountXlm = Math.round((prop.annualRent * 0.10) / 1000);
  const monthlyRentXlm = Math.round(prop.monthlyEquivalent / 1000);

  const handleSubmitReview = async () => {
    setIsSubmittingReview(true);
    try {
      let tenantAddr = walletState.publicKey;
      if (!tenantAddr) {
        await connectDemoWallet();
        tenantAddr = 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G';
      }

      const res = await invokeSubmitTenantReview(
        tenantAddr || 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46',
        selectedRating,
        reviewNote
      );

      setCurrentTrustScore(res.newTrustScore);
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setShowReviewModal(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}
    onClick={() => setSelectedProperty(null)}
    >
      <div
        className="retro-window"
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Top Bar */}
        <div className="window-header">
          <div className="window-controls">
            <div className="window-dot dot-red" onClick={() => setSelectedProperty(null)} style={{ cursor: 'pointer' }} />
            <div className="window-dot dot-yellow" />
            <div className="window-dot dot-green" />
          </div>
          <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: 700 }}>
            PROPERTY DOSSIER // {prop.id.toUpperCase()} // DIRECT OWNER VERIFIED
          </span>
          <button
            onClick={() => setSelectedProperty(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            [CLOSE ✕]
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Photos & Header Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Main Photo Gallery */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                position: 'relative',
                height: '260px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '2px solid var(--border-bold)',
                background: '#090d14'
              }}>
                <img
                  src={prop.photos[0]}
                  alt={prop.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '90px',
                  background: 'linear-gradient(to bottom, rgba(5, 8, 14, 0.88) 0%, rgba(5, 8, 14, 0.4) 65%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 2
                }} />

                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '6px',
                  zIndex: 10
                }}>
                  <span
                    className="retro-badge badge-zero-cut badge-overlay"
                    style={{
                      background: '#041d13',
                      backgroundColor: 'rgba(4, 29, 19, 0.95)',
                      border: '1.5px solid #10b981',
                      color: '#34d399',
                      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.8), 2px 2px 0px #000',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      letterSpacing: '0.04em',
                      padding: '4px 9px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Check size={13} strokeWidth={3} color="#34d399" />
                    <span>DIRECT OWNER • ₦0 AGENT CUT</span>
                  </span>

                  <span
                    className="retro-badge badge-solar badge-overlay"
                    style={{
                      background: '#241503',
                      backgroundColor: 'rgba(36, 21, 3, 0.95)',
                      border: '1.5px solid #f59e0b',
                      color: '#fbbf24',
                      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.8), 2px 2px 0px #000',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      letterSpacing: '0.04em',
                      padding: '4px 9px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Zap size={13} fill="#fbbf24" color="#fbbf24" />
                    <span>
                      {prop.utility.inverterCapacityKva && prop.utility.inverterCapacityKva > 0
                        ? `${prop.utility.inverterCapacityKva}kVA SOLAR BACKED`
                        : prop.utility.backupPowerType === 'solar_inverter' || prop.utility.backupPowerType === 'hybrid'
                        ? 'SOLAR INVERTER BACKED'
                        : `${prop.utility.gridHoursPerDay}H DAILY IBEDC GRID`}
                    </span>
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {prop.photos.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${prop.photos.length}, 1fr)`, gap: '8px' }}>
                  {prop.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: '70px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-bold)'
                      }}
                    >
                      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Details & Rent */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="retro-badge badge-zero-cut">
                  <Check size={12} strokeWidth={3} /> 0% AGENT FEES
                </span>
                <span className="retro-badge badge-solar">
                  <Zap size={12} /> {prop.utility.backupPowerType.toUpperCase()}
                </span>
                <span className="retro-badge badge-meter">
                  <Gauge size={12} /> {prop.utility.meterType.toUpperCase()}
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.25 }}>
                {prop.title}
              </h2>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                📍 {prop.address}, {prop.area}, {prop.city}
              </div>

              {/* Pricing Box */}
              <div style={{
                background: 'rgba(10, 13, 20, 0.9)',
                border: '2px solid var(--border-bold)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ANNUAL DIRECT RENT
                  </span>
                  <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber-light)' }}>
                    ₦{prop.annualRent.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                    Caution Deposit: {cautionAmountXlm} XLM (Soroban Escrow)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    MONTHLY STREAMING
                  </span>
                  <div className="mono" style={{ fontSize: '1rem', color: '#10b981', fontWeight: 700 }}>
                    ~{monthlyRentXlm} XLM /mo
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    ₦{prop.monthlyEquivalent.toLocaleString()} equivalent
                  </div>
                </div>
              </div>

              {/* Landlord Trust Box with On-Chain Reputation */}
              <div style={{
                background: 'rgba(18, 23, 34, 0.6)',
                border: '1px solid var(--border-bold)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img
                  src={prop.landlord.avatar}
                  alt={prop.landlord.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--amber-primary)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{prop.landlord.name}</span>
                      <UserCheck size={16} color="var(--emerald-primary)" />
                    </div>

                    {/* On-Chain Trust Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      <Award size={13} color="#34d399" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399' }}>
                        {currentTrustScore}/100 Trust Score
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Direct Property Owner • {prop.landlord.yearsAsOwner} years title history • Soroban Rep Verified
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600
                      }}
                    >
                      <Star size={11} color="#f59e0b" /> Submit On-Chain Review
                    </button>

                    <Link
                      href="/passport"
                      onClick={() => setSelectedProperty(null)}
                      style={{
                        fontSize: '0.72rem',
                        color: '#38bdf8',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600
                      }}
                    >
                      Qualify for Monthly Rent →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EXTORTION COMPARISON: STREET AGENT VS LUMENSLEASE */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '2px solid var(--emerald-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--emerald-primary)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--emerald-light)' }}>
                  MIDDLEMAN EXTORTION AUDIT: HOW MUCH YOU SAVE
                </h4>
              </div>
              <span className="mono" style={{
                background: 'var(--emerald-primary)',
                color: '#000',
                padding: '3px 8px',
                borderRadius: '3px',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}>
                YOU KEEP: ₦{totalMiddlemanExtortion.toLocaleString()}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem'
            }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>AGENCY FEE (10%)</div>
                <div style={{ textDecoration: 'line-through', color: 'var(--coral-accent)' }}>
                  ₦{agencyFeeTraditional.toLocaleString()}
                </div>
                <div style={{ color: 'var(--emerald-light)', fontWeight: 800 }}>₦0 ON LUMENSLEASE</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LEGAL/AGREEMENT (10%)</div>
                <div style={{ textDecoration: 'line-through', color: 'var(--coral-accent)' }}>
                  ₦{agreementFeeTraditional.toLocaleString()}
                </div>
                <div style={{ color: 'var(--emerald-light)', fontWeight: 800 }}>₦0 (FREE AUTO-AGREEMENT)</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>INSPECTION FEES</div>
                <div style={{ textDecoration: 'line-through', color: 'var(--coral-accent)' }}>
                  ₦{inspectionFeeTraditional.toLocaleString()}
                </div>
                <div style={{ color: 'var(--emerald-light)', fontWeight: 800 }}>₦0 ALWAYS FREE</div>
              </div>
            </div>
          </div>

          {/* THE UTILITY TRUTH SCORECARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--amber-light)' }}>
              ⚡ THE UTILITY TRUTH SCORECARD
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              <div className="retro-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Zap size={18} color="var(--amber-light)" />
                  <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700 }}>ELECTRICITY / LIGHT</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {prop.utility.gridHoursPerDay} Hours Grid Daily
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Backup: {prop.utility.backupPowerType === 'solar_inverter' ? `${prop.utility.inverterCapacityKva}kVA Dedicated Solar Inverter` : prop.utility.backupPowerType}
                </div>
              </div>

              <div className="retro-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Gauge size={18} color="var(--teal-light)" />
                  <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700 }}>PREPAID METERING</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {prop.utility.meterType === 'dedicated_prepaid' ? 'Dedicated Unit Meter' : 'Shared Meter'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  No estimated billing arguments with co-tenants.
                </div>
              </div>

              <div className="retro-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Droplet size={18} color="#93c5fd" />
                  <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700 }}>WATER SYSTEM</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {prop.utility.waterSource === 'treated_borehole' ? 'Treated Industrial Borehole' : 'Water Board'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Automated pumping system with overhead tanks.
                </div>
              </div>

              <div className="retro-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Shield size={18} color="var(--emerald-light)" />
                  <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700 }}>FLOOD & SECURITY</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {prop.utility.floodRiskLevel === 'zero_flood_zone' ? 'Zero Flood Zone' : 'Moderate'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Compound: {prop.utility.compoundSecurity === 'gated_night_guard' ? 'Gated with Night Guard' : 'Gated Compound'}
                </div>
              </div>
            </div>
          </div>

          {/* HARDWARE COMPUTER VISION & COMMUNITY SCOUT PHYSICAL AUDIT */}
          <div style={{
            background: 'rgba(10, 13, 20, 0.8)',
            border: '1px solid var(--border-bold)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--teal-light)', fontWeight: 700 }}>
                🔍 HARDWARE & COMMUNITY SCOUT AUDIT (CONTRACT: {STELLAR_CONFIG.contracts.communityScoutVerifier.slice(0, 8)}...):
              </span>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                ✓ GPS & Meter Cryptographically Bound
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CONLOG METER SERIAL</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>CONLOG-041928471-LAGOS</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SOLAR INVERTER AUDIT</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>5kVA Pure Sine Wave Verified</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ON-SITE SCOUT BOUNTY</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>20 XLM Paid via Soroban</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {prop.aiAuditNotes.map((note, idx) => (
                <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Habitability SLA & Guarantor Protection Strip */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(249, 115, 22, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                <Wrench size={13} color="#f97316" />
                <span style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: 700 }}>48h Emergency SLA Repair Vault Backed</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <Users size={13} color="#06b6d4" />
                <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700 }}>Co-Signer Surety Stake Accepted</span>
              </div>
            </div>
          </div>

          {/* Description & Rules */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Property Description</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {prop.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderTop: '2px solid var(--border-bold)',
            paddingTop: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                setActiveAgreementProperty(prop);
                setSelectedProperty(null);
              }}
              className="retro-btn retro-btn-dark"
              style={{ padding: '12px 18px' }}
            >
              <FileCheck size={16} />
              <span>Draft Tenancy Agreement & SBT Deed</span>
            </button>

            <button
              onClick={() => {
                setActiveChatProperty(prop);
                setSelectedProperty(null);
              }}
              className="retro-btn retro-btn-amber"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              <MessageSquare size={18} />
              <span>Message Owner Directly (Free)</span>
            </button>
          </div>
        </div>

        {/* On-Chain Landlord Review Modal */}
        {showReviewModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '20px'
            }}
            onClick={() => setShowReviewModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#0c111d',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '20px',
                color: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} color="#f59e0b" />
                  Rate {prop.landlord.name} on Soroban
                </h4>
                <button
                  onClick={() => setShowReviewModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Your review is recorded on the <code>LandlordReputationContract</code> and dynamically updates the landlord's trust score on Stellar Testnet.
              </p>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Star Rating (1 - 5)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      style={{
                        background: star <= selectedRating ? '#f59e0b' : '#1e293b',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        color: star <= selectedRating ? '#000' : '#cbd5e1',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Review Notes
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: '#131b2e',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    padding: '8px',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              {reviewSuccess ? (
                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Review recorded on-chain! New score: {currentTrustScore}
                </div>
              ) : (
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  style={{
                    backgroundColor: '#0284c7',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Submitting to Soroban...
                    </>
                  ) : (
                    <>
                      <Cpu size={15} /> Sign & Record On-Chain Review
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

