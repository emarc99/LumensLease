'use client';

import React from 'react';
import Link from 'next/link';
import { BedDouble, Droplets, Heart, Lightbulb, LockKeyhole, ShieldCheck, ArrowRight } from 'lucide-react';
import { PropertyListing } from '../types';

export default function CleanPropertyCard({ property }: { property: PropertyListing }) {
  const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

  const powerSummary = property.utility.backupPowerType === 'solar_inverter'
    ? `${property.utility.gridHoursPerDay}h grid + ${property.utility.inverterCapacityKva || 5}kVA solar`
    : `${property.utility.gridHoursPerDay}h daily grid`;

  const waterSummary = property.utility.waterSource === 'treated_borehole'
    ? 'Treated borehole'
    : 'Water board';

  const meterSummary = property.utility.meterType === 'dedicated_prepaid'
    ? 'Dedicated prepaid'
    : 'Shared prepaid';

  const securitySummary = property.utility.compoundSecurity === 'gated_night_guard'
    ? 'Gated + night guard'
    : 'Gated compound';

  return (
    <article className="property-card">
      <div 
        className="property-photo" 
        style={{ backgroundImage: `url(${property.photos[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'})` }}
      >
        <span className="photo-tag">VERIFIED PHOTO</span>
        <button className="save" aria-label={`Save ${property.title}`}>
          <Heart size={15} color="#ef4444" />
        </button>
      </div>

      <div className="card-body">
        <div className="card-location">
          {property.area} · {property.city.split(',')[0]}
        </div>

        <h3 className="card-title">
          {property.title}
        </h3>

        <div className="card-meta">
          <BedDouble size={13} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
          {property.bedrooms} bed · {property.bathrooms} bath · direct owner
        </div>

        <div className="price">
          {formatNaira(property.annualRent)}{' '}
          <span>/ year · {formatNaira(property.monthlyEquivalent)} / month</span>
        </div>

        <div className="scorecard">
          <div className="score">
            <Lightbulb size={14} color="#f59e0b" />
            <span>
              Power<br />
              <strong>{powerSummary}</strong>
            </span>
          </div>

          <div className="score">
            <Droplets size={14} color="#14b8a6" />
            <span>
              Water<br />
              <strong>{waterSummary}</strong>
            </span>
          </div>

          <div className="score">
            <LockKeyhole size={14} color="#2563eb" />
            <span>
              Meter<br />
              <strong>{meterSummary}</strong>
            </span>
          </div>

          <div className="score">
            <ShieldCheck size={14} color="#15803d" />
            <span>
              Security<br />
              <strong>{securitySummary}</strong>
            </span>
          </div>
        </div>

        <div className="card-footer">
          <span className="match">96% MATCH</span>
          <Link href={`/properties/${property.id}`} className="card-link">
            Inspect details <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
