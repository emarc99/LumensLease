'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BadgeCheck, CalendarDays, MessageCircle, ShieldCheck, 
  Lightbulb, Droplets, LockKeyhole, FileText, Check, AlertCircle 
} from 'lucide-react';
import Header from './Header';
import TenancyAgreementModal from './TenancyAgreementModal';
import { useProperty } from '../context/PropertyContext';
import { PropertyListing } from '../types';

export default function PropertyDetailView({ propertyId }: { propertyId: string }) {
  const { properties, setActiveAgreementProperty, activeAgreementProperty, sendMessage } = useProperty();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [inspectionSuccess, setInspectionSuccess] = useState(false);

  const prop = properties.find((p) => p.id === propertyId) || properties[0];

  const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

  const powerSummary = prop.utility.backupPowerType === 'solar_inverter'
    ? `${prop.utility.gridHoursPerDay} hrs grid + ${prop.utility.inverterCapacityKva || 5}kVA solar inverter`
    : `${prop.utility.gridHoursPerDay} hrs daily grid supply`;

  const waterSummary = prop.utility.waterSource === 'treated_borehole'
    ? 'Treated industrial borehole'
    : 'Municipal water board';

  const meterSummary = prop.utility.meterType === 'dedicated_prepaid'
    ? 'Dedicated single-phase prepaid meter'
    : 'Shared prepaid meter';

  const securitySummary = prop.utility.compoundSecurity === 'gated_night_guard'
    ? 'Gated compound + uniformed night security'
    : 'Gated residential close';

  const handleQuickInspection = () => {
    sendMessage(prop.id, 'I would like to book a free inspection this Saturday at 11:00 AM. Please confirm.', true, 'Saturday 11:00 AM');
    setInspectionSuccess(true);
    setTimeout(() => setInspectionSuccess(false), 4000);
  };

  const agencySaved = prop.annualRent * 0.10;
  const legalSaved = prop.annualRent * 0.10;
  const totalSaved = agencySaved + legalSaved;

  return (
    <div className="shell">
      <Header />

      <main className="page container">
        <Link href="/" className="back">
          <ArrowLeft size={14} style={{ verticalAlign: '-2px' }} /> Back to homes
        </Link>

        {inspectionSuccess && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#065f46',
            fontSize: '14px',
            fontWeight: 600
          }}>
            <Check size={18} color="#10b981" />
            <span>Inspection request sent directly to {prop.landlord.name}! Check your Messages tab for the landlord confirmation.</span>
          </div>
        )}

        <div className="detail-grid">
          {/* Left Column: Photos */}
          <div>
            <div
              className="gallery-main"
              style={{ backgroundImage: `url(${prop.photos[selectedPhotoIndex] || prop.photos[0]})` }}
            >
              <span className="photo-tag">VERIFIED BY BEDROCK CV</span>
            </div>

            {prop.photos.length > 1 && (
              <div className="gallery-strip">
                {prop.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className={`gallery-thumb ${selectedPhotoIndex === idx ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${photo})` }}
                    onClick={() => setSelectedPhotoIndex(idx)}
                  />
                ))}
              </div>
            )}

            {/* Description */}
            <div className="detail-panel" style={{ marginTop: '20px' }}>
              <div className="kicker">About this home</div>
              <h3 style={{ fontSize: '20px', margin: '8px 0 12px', fontFamily: 'var(--font-display)' }}>Property Overview</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
                {prop.description}
              </p>
            </div>
          </div>

          {/* Right Column: Pricing, Truth, and Actions */}
          <div>
            <div className="detail-panel">
              <span className="pill">
                <BadgeCheck size={13} /> owner verified {prop.landlord.yearsAsOwner} yrs title history
              </span>

              <h1>{prop.title}</h1>
              <p className="card-meta">
                {prop.address}, {prop.area}, {prop.city} · {prop.bedrooms} bedroom · {prop.bathrooms} bathroom
              </p>

              <p className="detail-price">
                {formatNaira(prop.annualRent)} <small>/ year ({formatNaira(prop.monthlyEquivalent)} / mo)</small>
              </p>

              <div className="savings-box">
                <strong>{formatNaira(totalSaved)} saved</strong>
                <span>That’s the 10% agency + 10% legal fee you keep by dealing direct.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href={`/messages?property=${prop.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <MessageCircle size={16} /> Message {prop.landlord.name.split(' ')[0]} directly
                </Link>

                <button
                  onClick={() => setActiveAgreementProperty(prop)}
                  className="btn btn-accent"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <FileText size={16} /> Generate Oyo State Tenancy Agreement (₦0 Fee)
                </button>
              </div>
            </div>

            {/* Infrastructure Truth Inspector */}
            <div className="detail-panel" style={{ marginTop: '18px' }}>
              <div className="kicker">Infrastructure truth inspector</div>
              <h2 style={{ fontSize: '24px', letterSpacing: '-0.05em', margin: '10px 0', fontFamily: 'var(--font-display)' }}>
                The facts, plainly.
              </h2>

              <div className="truth">
                <div className="truth-line">
                  <span>Power reality</span>
                  <strong>{powerSummary}</strong>
                </div>
                <div className="truth-line">
                  <span>Water source</span>
                  <strong>{waterSummary}</strong>
                </div>
                <div className="truth-line">
                  <span>Electricity meter</span>
                  <strong>{meterSummary}</strong>
                </div>
                <div className="truth-line">
                  <span>Compound security</span>
                  <strong>{securitySummary}</strong>
                </div>
                <div className="truth-line">
                  <span>Flood risk status</span>
                  <strong>Zero flood elevation zone</strong>
                </div>
              </div>

              {/* Hardware Audit findings */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)', marginTop: '12px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)', display: 'block', marginBottom: '6px' }}>
                  AWS BEDROCK COMPUTER VISION AUDIT:
                </span>
                {prop.aiAuditNotes.map((note, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--ink)', margin: '3px 0' }}>
                    {note}
                  </div>
                ))}
              </div>

              <p className="card-meta" style={{ marginTop: '14px' }}>
                <ShieldCheck size={14} style={{ verticalAlign: '-3px', color: '#15803d' }} /> Photo evidence and owner identity verified under Oyo State Recovery of Premises Law.
              </p>
            </div>

            {/* Direct Owner Profile */}
            <div className="detail-panel" style={{ marginTop: '18px' }}>
              <div className="kicker">Direct owner</div>
              <h3 style={{ fontSize: '20px', margin: '10px 0 4px', fontFamily: 'var(--font-display)' }}>
                {prop.landlord.name}
              </h3>
              <p className="card-meta">Verified property owner · {prop.landlord.yearsAsOwner} years title</p>
              <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#697386', margin: '8px 0 14px', fontStyle: 'italic' }}>
                "{prop.landlord.bio}"
              </p>

              <button
                onClick={handleQuickInspection}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <CalendarDays size={15} /> Book 100% Free Saturday Inspection
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Tenancy Agreement Generator Modal */}
      {activeAgreementProperty && <TenancyAgreementModal />}
    </div>
  );
}
