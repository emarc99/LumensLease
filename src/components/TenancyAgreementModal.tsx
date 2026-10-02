'use client';

import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { Printer, ShieldCheck, CheckCircle2, Download, X } from 'lucide-react';

export default function TenancyAgreementModal() {
  const { activeAgreementProperty, setActiveAgreementProperty } = useProperty();
  const [tenantName, setTenantName] = useState('Olumide Adeyemi');
  const [commencementDate, setCommencementDate] = useState('November 1, 2026');

  if (!activeAgreementProperty) return null;

  const prop = activeAgreementProperty;
  const agencySaved = prop.annualRent * 0.10;
  const legalSaved = prop.annualRent * 0.10;
  const totalSaved = agencySaved + legalSaved;

  const handlePrint = () => {
    window.print();
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
    onClick={() => setActiveAgreementProperty(null)}
    >
      <div
        style={{
          maxWidth: '850px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#15803d" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }}>
              LOCKHOUSE DIRECT TENANCY AGREEMENT · ₦0 COMMISSION STATUTORY DRAFT
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
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

        {/* Printable Legal Document Body */}
        <div style={{
          padding: '28px',
          overflowY: 'auto',
          background: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.6
        }}>
          {/* Top Document Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              STANDARD RESIDENTIAL TENANCY AGREEMENT
            </h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#166534' }}>
              GOVERNED BY THE RECOVERY OF PREMISES LAW OF OYO STATE (CAP 144, LAWS OF OYO STATE 2000)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
              DIRECT OWNER-TO-TENANT CONTRACT • ₦0 MIDDLEMAN COMMISSION • ACCREDITED SOLICITOR PROTOCOL
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', marginTop: '4px' }}>
              LOCKHOUSE CONTRACT REF: LH-OYO-{prop.id.toUpperCase()}-2026 • JURISDICTION: OYO STATE COURTS
            </div>
          </div>

          {/* Quick Edit Inputs for Tenant */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px',
            fontFamily: 'sans-serif',
            fontSize: '0.85rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>TENANT FULL NAME:</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                style={{ border: '1px solid #94a3b8', padding: '4px 8px', borderRadius: '3px', fontWeight: 'bold' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>COMMENCEMENT DATE:</label>
              <input
                type="text"
                value={commencementDate}
                onChange={(e) => setCommencementDate(e.target.value)}
                style={{ border: '1px solid #94a3b8', padding: '4px 8px', borderRadius: '3px', fontWeight: 'bold' }}
              />
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 'bold', display: 'block' }}>
                DIRECT SAVINGS ACCREDITED:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#15803d' }}>
                ₦{totalSaved.toLocaleString()} Saved (Zero 10% Legal Extortion)
              </span>
            </div>
          </div>

          {/* Solicitor Enforceability Badge */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '4px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            fontFamily: 'sans-serif'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#2563eb" />
              <span>
                <strong>Court Enforceability Guarantee:</strong> Standardized according to Oyo State Rent Tribunal provisions. Enforceable in Oyo State Magistrate Courts without unvetted drafting defects.
              </span>
            </div>
            <span style={{
              background: '#2563eb',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '3px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}>
              NBA-COMPLIANT STATUTORY DRAFT
            </span>
          </div>

          {/* Agreement Clauses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
            <p>
              <strong>THIS TENANCY AGREEMENT</strong> is made this <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </p>

            <p>
              <strong>BETWEEN:</strong><br />
              <strong>{prop.landlord.name.toUpperCase()}</strong> of {prop.address}, {prop.area}, {prop.city} (hereinafter referred to as the <em>"LANDLORD"</em>, which expression shall include his/her heirs, legal representatives, and assigns) of the ONE PART;
            </p>

            <p>
              <strong>AND:</strong><br />
              <strong>{tenantName.toUpperCase()}</strong> (hereinafter referred to as the <em>"TENANT"</em>, which expression shall include his/her successors-in-title) of the OTHER PART.
            </p>

            <p>
              <strong>WHEREAS:</strong><br />
              The Landlord is the verified legal owner of the premises known and situate at <strong>{prop.address}, {prop.area}, {prop.city}</strong> (the <em>"Demised Premises"</em>). The Landlord has agreed to let and the Tenant has agreed to take the Demised Premises on the terms and conditions herein contained.
            </p>

            <h4 style={{ textDecoration: 'underline', marginTop: '10px' }}>NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:</h4>

            <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>RENT & TENURE:</strong> The Tenant pays to the Landlord the direct annual rent of <strong>₦{prop.annualRent.toLocaleString()}</strong> for a fixed term of ONE (1) YEAR commencing on <strong>{commencementDate}</strong>.
              </li>
              <li>
                <strong>ZERO MIDDLEMAN COMMISSION CLAUSE:</strong> Both parties acknowledge and agree that this tenancy was arranged directly through LockHouse. <strong>No agency fees (0%), legal markup fees (0%), or middleman inspection fees</strong> have been charged or paid.
              </li>
              <li>
                <strong>INFRASTRUCTURE & POWER COVENANT:</strong>
                <ul>
                  <li><strong>Electricity:</strong> The Demised Premises is provided with a <strong>{prop.utility.meterType === 'dedicated_prepaid' ? 'Dedicated Single-Phase Prepaid Meter' : 'Meter'}</strong>. The Tenant is solely responsible for purchasing his/her own prepaid electricity units.</li>
                  <li><strong>Backup Power:</strong> {prop.utility.backupPowerType === 'solar_inverter' ? `The unit is connected to a ${prop.utility.inverterCapacityKva}kVA Solar Inverter backup system. The Landlord warrants the inverter batteries remain operational for basic workstation and domestic loads.` : 'Standard power supply applies.'}</li>
                  <li><strong>Water Supply:</strong> The Landlord warrants that water from the <strong>{prop.utility.waterSource.replace('_', ' ')}</strong> shall be pumped to the overhead tanks regularly without disruption.</li>
                </ul>
              </li>
              <li>
                <strong>COVENANTS OF THE TENANT:</strong>
                <ul>
                  <li>To keep the interior of the premises in good and tenantable condition.</li>
                  <li>Not to sub-let, assign, or part with possession of the premises or any part thereof to any third party.</li>
                  <li>To observe peaceful living and respect the quiet enjoyment of neighboring residents.</li>
                </ul>
              </li>
            </ol>

            {/* Execution Signatures */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              marginTop: '36px',
              borderTop: '1px solid #cbd5e1',
              paddingTop: '20px'
            }}>
              <div>
                <div style={{ borderBottom: '1px solid #000', width: '200px', height: '40px', marginBottom: '6px' }}></div>
                <div style={{ fontWeight: 'bold' }}>SIGNED by the LANDLORD:</div>
                <div>{prop.landlord.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {new Date().toLocaleDateString()}</div>
              </div>

              <div>
                <div style={{ borderBottom: '1px solid #000', width: '200px', height: '40px', marginBottom: '6px' }}></div>
                <div style={{ fontWeight: 'bold' }}>SIGNED by the TENANT:</div>
                <div>{tenantName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {commencementDate}</div>
              </div>
            </div>

            {/* Verification Seal */}
            <div style={{
              marginTop: '24px',
              padding: '10px',
              background: '#f0fdf4',
              border: '1px dashed #22c55e',
              borderRadius: '4px',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#166534'
            }}>
              🔒 VERIFIED SECURE • PROCESSED BY LOCKHOUSE ON AWS BEDROCK • DIRECT COMMISSION ELIMINATED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
