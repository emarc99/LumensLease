'use client';

import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { useProperty } from '../context/PropertyContext';
import { Zap, Droplet, Shield, Gauge, MessageSquare, Check, ArrowRight, UserCheck } from 'lucide-react';

export default function PropertyCard({ property }: { property: PropertyListing }) {
  const { setSelectedProperty, setActiveChatProperty } = useProperty();
  const [photoIndex, setPhotoIndex] = useState(0);

  const agencySavings = property.annualRent * 0.20; // 10% Agency + 10% Legal saved



  return (
    <div className="retro-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Property Photo & Overlay */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: '#090d14', overflow: 'hidden' }}>
        <img
          src={property.photos[photoIndex] || property.photos[0]}
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
        />

        {/* Top Vignette Darkening Scrim for Crystal-Clear Badge Readability */}
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

        {/* Bottom Vignette Darkening Scrim for Savings Ribbon */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, rgba(5, 8, 14, 0.85) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2
        }} />

        {/* 90s Scanline Effect Overlay */}
        <div className="scanline" style={{ zIndex: 3 }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 2
        }}>
          <span className="retro-badge badge-zero-cut" style={{ boxShadow: '2px 2px 0px #000' }}>
            <Check size={12} strokeWidth={3} /> DIRECT OWNER • ₦0 AGENT CUT
          </span>
          {property.utility.backupPowerType === 'solar_inverter' && (
            <span className="retro-badge badge-solar" style={{ boxShadow: '2px 2px 0px #000' }}>
              <Zap size={12} /> {property.utility.inverterCapacityKva}kVA SOLAR BACKED
            </span>
          )}
        </div>

        {/* Savings Ribbon */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(4, 29, 19, 0.95)',
          border: '1.5px solid var(--emerald-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 9px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--emerald-light)',
          fontWeight: 800,
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.8), 2px 2px 0px #000',
          zIndex: 10
        }}>
          SAVE ₦{agencySavings.toLocaleString()} FEES
        </div>

        {/* Carousel Dots */}
        {property.photos.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            display: 'flex',
            gap: '6px',
            zIndex: 10
          }}>
            {property.photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: '1px solid #000',
                  background: photoIndex === i ? 'var(--amber-primary)' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  padding: 0
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {/* Title & Location */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {property.title}
            </h3>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--teal-light)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '3px', flexShrink: 0 }}>
              {property.area}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {property.address}, {property.city}
          </span>
        </div>

        {/* Pricing */}
        <div style={{
          background: 'rgba(10, 13, 20, 0.8)',
          border: '1px solid var(--border-bold)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Direct Annual Rent
            </span>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber-light)' }}>
              ₦{property.annualRent.toLocaleString()}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}> /year</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Equivalent
            </span>
            <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ₦{property.monthlyEquivalent.toLocaleString()} /mo
            </div>
          </div>
        </div>

        {/* Utility Truth Scorecard Matrix */}
        <div className="utility-matrix">
          <div className="matrix-item">
            <Zap size={16} color="var(--amber-light)" />
            <div>
              <div className="matrix-label">Power / Light</div>
              <div className="matrix-value">{property.utility.gridHoursPerDay}h Grid + {property.utility.backupPowerType === 'solar_inverter' ? 'Solar' : property.utility.backupPowerType === 'hybrid' ? 'Hybrid' : property.utility.backupPowerType === 'generator' ? 'Gen' : 'Grid only'}</div>
            </div>
          </div>

          <div className="matrix-item">
            <Gauge size={16} color="var(--teal-light)" />
            <div>
              <div className="matrix-label">Meter</div>
              <div className="matrix-value">
                {property.utility.meterType === 'dedicated_prepaid' ? 'Dedicated Prepaid' : 'Shared Meter'}
              </div>
            </div>
          </div>

          <div className="matrix-item">
            <Droplet size={16} color="#93c5fd" />
            <div>
              <div className="matrix-label">Water Source</div>
              <div className="matrix-value">
                {property.utility.waterSource === 'treated_borehole' ? 'Treated Borehole' : property.utility.waterSource === 'water_corporation' ? 'Water Board' : 'Standard Well'}
              </div>
            </div>
          </div>

          <div className="matrix-item">
            <Shield size={16} color="var(--emerald-light)" />
            <div>
              <div className="matrix-label">Security</div>
              <div className="matrix-value">
                {property.utility.compoundSecurity === 'gated_night_guard' ? 'Gated + Guard' : 'Gated Only'}
              </div>
            </div>
          </div>
        </div>

        {/* Landlord Profile Snippet & Compatibility */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={property.landlord.avatar}
              alt={property.landlord.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--amber-primary)', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {property.landlord.name}
                </span>
                <UserCheck size={12} color="var(--emerald-primary)" />
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Direct Owner ({property.landlord.yearsAsOwner} yrs)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <span className="retro-badge" style={{ fontSize: '0.65rem', padding: '2px 5px', background: 'rgba(255,255,255,0.05)' }}>
              {property.preferences.maritalStatusPreference === 'singles_welcome' ? 'Singles Welcome' : 'Families/Married'}
            </span>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
          <button
            onClick={() => setSelectedProperty(property)}
            className="retro-btn retro-btn-dark"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <span>Inspect Truth</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => setActiveChatProperty(property)}
            className="retro-btn retro-btn-amber"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <MessageSquare size={14} />
            <span>Direct Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
