'use client';

import React from 'react';
import { useProperty } from '../context/PropertyContext';
import PropertyCard from './PropertyCard';
import { Home, AlertCircle, RefreshCw } from 'lucide-react';

export default function PropertyGrid() {
  const { properties, filters, setFilters, setActiveView } = useProperty();

  const filteredProperties = properties.filter(prop => {
    // Area filter
    if (filters.selectedArea !== 'all' && prop.area.toLowerCase() !== filters.selectedArea.toLowerCase()) {
      return false;
    }

    // Max rent filter
    if (prop.annualRent > filters.maxRent) {
      return false;
    }

    // Solar inverter filter
    if (filters.solarInverterOnly && prop.utility.backupPowerType !== 'solar_inverter' && prop.utility.backupPowerType !== 'hybrid') {
      return false;
    }

    // Dedicated prepaid meter filter
    if (filters.dedicatedPrepaidOnly && prop.utility.meterType !== 'dedicated_prepaid') {
      return false;
    }

    // Treated borehole water filter
    if (filters.treatedBoreholeOnly && prop.utility.waterSource !== 'treated_borehole') {
      return false;
    }

    // Gated security filter
    if (filters.gatedSecurityOnly && prop.utility.compoundSecurity !== 'gated_night_guard' && prop.utility.compoundSecurity !== 'gated_only') {
      return false;
    }

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = prop.title.toLowerCase().includes(q);
      const matchDesc = prop.description.toLowerCase().includes(q);
      const matchArea = prop.area.toLowerCase().includes(q);
      const matchAddress = prop.address.toLowerCase().includes(q);
      const matchLandlord = prop.landlord.name.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchArea || matchAddress || matchLandlord;
    }

    return true;
  });

  return (
    <section style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Results Header Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--border-bold)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Home size={18} color="var(--amber-primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            VERIFIED DIRECT LISTINGS ({filteredProperties.length})
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ALL VERIFIED FOR ₦0 AGENT COMMISSIONS
          </span>
          {(filters.searchQuery || filters.solarInverterOnly || filters.selectedArea !== 'all' || filters.dedicatedPrepaidOnly) && (
            <button
              onClick={() => setFilters({
                searchQuery: '',
                selectedCity: 'all',
                selectedArea: 'all',
                maxRent: 6000000,
                solarInverterOnly: false,
                dedicatedPrepaidOnly: false,
                treatedBoreholeOnly: false,
                gatedSecurityOnly: false,
                bedrooms: 'all'
              })}
              className="retro-btn retro-btn-dark"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              <RefreshCw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredProperties.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="retro-window" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--amber-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No properties matched your strict filter criteria</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 20px' }}>
            Try relaxing your utility filters or expanding your budget range. Alternatively, list a property directly through the Landlord Voice Studio!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setFilters({
                searchQuery: '',
                selectedCity: 'all',
                selectedArea: 'all',
                maxRent: 6000000,
                solarInverterOnly: false,
                dedicatedPrepaidOnly: false,
                treatedBoreholeOnly: false,
                gatedSecurityOnly: false,
                bedrooms: 'all'
              })}
              className="retro-btn retro-btn-amber"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setActiveView('landlord_studio')}
              className="retro-btn retro-btn-teal"
            >
              List My House Direct
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
