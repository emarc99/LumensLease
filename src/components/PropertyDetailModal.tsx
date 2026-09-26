'use client';

import React from 'react';
import { useProperty } from '../context/PropertyContext';
import { 
  Zap, Droplet, Shield, Gauge, MessageSquare, Check, X, 
  UserCheck, AlertTriangle, FileCheck, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function PropertyDetailModal() {
  const { selectedProperty, setSelectedProperty, setActiveChatProperty, setActiveAgreementProperty } = useProperty();

  if (!selectedProperty) return null;

  const prop = selectedProperty;
  const agencyFeeTraditional = prop.annualRent * 0.10;
  const agreementFeeTraditional = prop.annualRent * 0.10;
  const inspectionFeeTraditional = 15000;
  const totalMiddlemanExtortion = agencyFeeTraditional + agreementFeeTraditional + inspectionFeeTraditional;

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

                {/* Top Vignette Darkening Scrim for Badge Contrast */}
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
                  top: '10px',
                  left: '10px',
                  background: 'rgba(0,0,0,0.85)',
                  border: '1px solid var(--emerald-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--emerald-light)',
                  fontWeight: 700
                }}>
                  ✓ AI VERIFIED INFRASTRUCTURE
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
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    MONTHLY BREAKDOWN
                  </span>
                  <div className="mono" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    ₦{prop.monthlyEquivalent.toLocaleString()} /mo
                  </div>
                </div>
              </div>

              {/* Landlord Trust Box */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{prop.landlord.name}</span>
                    <UserCheck size={16} color="var(--emerald-primary)" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Direct Property Owner • {prop.landlord.yearsAsOwner} years title history
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{prop.landlord.bio}"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EXTORTION COMPARISON: STREET AGENT VS LOCKHOUSE */}
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
                <div style={{ color: 'var(--emerald-light)', fontWeight: 800 }}>₦0 ON LOCKHOUSE</div>
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

          {/* AI AUDIT NOTES */}
          <div style={{
            background: 'rgba(10, 13, 20, 0.8)',
            border: '1px solid var(--border-bold)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--teal-light)', fontWeight: 700 }}>
              🤖 AWS BEDROCK COMPUTER VISION AUDIT FINDINGS:
            </span>
            {prop.aiAuditNotes.map((note, idx) => (
              <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{note}</span>
              </div>
            ))}
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
              <span>Draft Tenancy Agreement (₦0 Commission)</span>
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
      </div>
    </div>
  );
}
