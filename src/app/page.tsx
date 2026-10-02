'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Mic } from 'lucide-react';
import Header from '../components/Header';
import CleanPropertyCard from '../components/CleanPropertyCard';
import SavingsCalculator from '../components/SavingsCalculator';
import { useProperty } from '../context/PropertyContext';

export default function HomePage() {
  const { properties, totalSavingsNgn } = useProperty();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All homes');

  const filters = [
    'All homes',
    '24/7 backup power',
    'Dedicated meter',
    'Treated borehole',
    'Bodija',
    'Akobo',
    'Oluyole',
    'Samonda'
  ];

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = query.toLowerCase();
      const text = `${p.title} ${p.area} ${p.city} ${p.description} ${p.utility.backupPowerType}`.toLowerCase();
      const matchesQuery = !q || text.includes(q);

      let matchesFilter = true;
      if (activeFilter === '24/7 backup power') {
        matchesFilter = p.utility.backupPowerType === 'solar_inverter' || p.utility.gridHoursPerDay >= 20;
      } else if (activeFilter === 'Dedicated meter') {
        matchesFilter = p.utility.meterType === 'dedicated_prepaid';
      } else if (activeFilter === 'Treated borehole') {
        matchesFilter = p.utility.waterSource === 'treated_borehole';
      } else if (activeFilter !== 'All homes') {
        matchesFilter = p.area.toLowerCase().includes(activeFilter.toLowerCase());
      }

      return matchesQuery && matchesFilter;
    });
  }, [properties, query, activeFilter]);

  const displaySavings = `₦${Math.max(14250000, totalSavingsNgn).toLocaleString('en-NG')}`;

  return (
    <div className="shell">
      <Header />

      <main>
        {/* Hero Section */}
        <div className="container hero">
          <div>
            <div className="kicker">Direct rental intelligence · Nigeria</div>
            <h1>
              Find a home.<br />
              <em>Skip the drama.</em>
            </h1>
            <p className="hero-copy">
              LockHouse helps you rent directly from verified owners, with the power, water, and security facts middleman agents usually hide.
            </p>
            <div className="hero-actions">
              <a href="#homes" className="btn btn-primary">
                Explore verified homes <ArrowRight size={15} />
              </a>
              <Link href="/studio" className="btn btn-secondary">
                I’m a landlord
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-top">
              <span>
                <i className="live-dot" /> live network
              </span>
              <span>ibadan / lagos · ng</span>
            </div>

            <div className="savings">{displaySavings}</div>
            <small>agent & inspection fees saved by LockHouse renters</small>

            <div className="stat-row">
              <div className="stat">
                <strong>0%</strong>
                <span>agent cut</span>
              </div>
              <div className="stat">
                <strong>{properties.length}</strong>
                <span>homes live</span>
              </div>
              <div className="stat">
                <strong>98%</strong>
                <span>owner verified</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <a href="#calculator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                Calculate your exact savings <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Live Inventory Feed */}
        <div id="homes">
          <section className="section container">
            <div className="section-head">
              <div>
                <div className="kicker">Live verified inventory</div>
                <h2>Homes with the truth turned on.</h2>
              </div>
              <span className="card-meta">
                {filteredProperties.length} verified homes · updated just now
              </span>
            </div>

            <div className="searchbox">
              <Search size={18} style={{ color: '#697386', marginLeft: '6px' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try ‘quiet 2-bed in Bodija with 5kVA solar’"
                aria-label="Search verified homes"
              />
              <button onClick={() => setQuery(query ? '' : 'solar')}>
                <Mic size={15} />
                <span>{query ? 'Clear' : 'Voice Query'}</span>
              </button>
            </div>

            <div className="filter-row">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`filter ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid">
              {filteredProperties.map((p) => (
                <CleanPropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>

          {/* Interactive Savings Calculator Section */}
          <section id="calculator" className="section container" style={{ borderTop: '1px solid var(--line)', paddingTop: '64px', marginTop: '32px' }}>
            <SavingsCalculator />
          </section>
        </div>
      </main>
    </div>
  );
}
