'use client';

import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { Search, Zap, Droplet, Shield, Gauge, Sparkles, Mic, MicOff } from 'lucide-react';

export default function HeroSearch() {
  const { filters, setFilters, properties } = useProperty();
  const [isListening, setIsListening] = useState(false);

  const areas = ['all', 'Bodija', 'Akobo', 'Oluyole', 'Samonda', 'Jericho'];

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type in the search box.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFilters(prev => ({ ...prev, searchQuery: transcript }));
      // Automatically toggle solar if mentioned
      if (transcript.toLowerCase().includes('solar') || transcript.toLowerCase().includes('inverter') || transcript.toLowerCase().includes('light')) {
        setFilters(prev => ({ ...prev, solarInverterOnly: true }));
      }
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <section style={{
      padding: '40px 24px 24px',
      maxWidth: '1360px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Hero Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="retro-badge badge-solar">
            <Zap size={14} /> 100% DIRECT TO OWNER
          </span>
          <span className="retro-badge badge-zero-cut">
            <Sparkles size={14} /> ZERO AGENT CUT
          </span>
          <span className="retro-badge badge-meter">
            ⚡ LIGHT & UTILITY TRANSPARENCY
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          color: 'var(--text-primary)'
        }}>
          Lock in your verified home. <br />
          <span style={{ color: 'var(--amber-light)', textShadow: '2px 2px 0px #000' }}>
            Lock out the 50% middleman agent fees.
          </span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '780px' }}>
          No street agent scams. No fake inspection fees. Direct conversations with verified Nigerian landlords, with guaranteed transparency on <strong>daily grid light hours</strong>, <strong>solar/inverter backup</strong>, and <strong>treated borehole water</strong>.
        </p>
      </div>

      {/* Retro Search Console */}
      <div className="retro-window" style={{ background: 'var(--bg-surface)' }}>
        <div className="window-header">
          <div className="window-controls">
            <div className="window-dot dot-red" />
            <div className="window-dot dot-yellow" />
            <div className="window-dot dot-green" />
          </div>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            LUMENSLEASE TERMINAL // STELLAR PROPERTY & ESCROW MATCHER
          </span>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-light)' }}>
            STATUS: ACTIVE
          </span>
        </div>

        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Search Bar */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-bold)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Search size={20} color="var(--text-muted)" style={{ marginLeft: '14px' }} />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Try: '2-bed flat in Bodija with 24/7 solar light under 1.5M' or 'prepaid meter in Akobo'"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '14px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none'
                }}
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    marginRight: '12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  [CLEAR]
                </button>
              )}
            </div>

            <button
              onClick={handleVoiceSearch}
              className={`retro-btn ${isListening ? 'retro-btn-amber' : 'retro-btn-dark'}`}
              style={{ padding: '0 18px', flexShrink: 0 }}
              title="Voice Search"
            >
              {isListening ? <MicOff size={18} color="#000" /> : <Mic size={18} />}
              <span className="mono">{isListening ? 'Listening...' : 'Voice Search'}</span>
            </button>
          </div>

          {/* Quick Area Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>
              AREA:
            </span>
            {areas.map(area => {
              const isSelected = filters.selectedArea === area;
              return (
                <button
                  key={area}
                  onClick={() => setFilters(prev => ({ ...prev, selectedArea: area }))}
                  className="retro-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    background: isSelected ? 'var(--amber-primary)' : 'var(--bg-dark)',
                    color: isSelected ? '#000' : 'var(--text-secondary)',
                    borderColor: isSelected ? '#000' : 'var(--border-bold)',
                    boxShadow: isSelected ? 'var(--shadow-retro)' : 'none'
                  }}
                >
                  {area === 'all' ? 'All Areas' : area}
                </button>
              );
            })}
          </div>

          {/* 90s Retro Utility Filter Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>
              UTILITY GUARANTEES:
            </span>

            {/* Solar Inverter Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, solarInverterOnly: !prev.solarInverterOnly }))}
              className="retro-btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                background: filters.solarInverterOnly ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                borderColor: filters.solarInverterOnly ? 'var(--amber-primary)' : 'var(--border-bold)',
                color: filters.solarInverterOnly ? 'var(--amber-light)' : 'var(--text-secondary)'
              }}
            >
              <Zap size={14} color={filters.solarInverterOnly ? 'var(--amber-light)' : 'var(--text-muted)'} />
              <span>24/7 Solar / Inverter Only</span>
            </button>

            {/* Dedicated Prepaid Meter Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, dedicatedPrepaidOnly: !prev.dedicatedPrepaidOnly }))}
              className="retro-btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                background: filters.dedicatedPrepaidOnly ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                borderColor: filters.dedicatedPrepaidOnly ? 'var(--teal-primary)' : 'var(--border-bold)',
                color: filters.dedicatedPrepaidOnly ? 'var(--teal-light)' : 'var(--text-secondary)'
              }}
            >
              <Gauge size={14} color={filters.dedicatedPrepaidOnly ? 'var(--teal-light)' : 'var(--text-muted)'} />
              <span>Dedicated Prepaid Meter</span>
            </button>

            {/* Treated Borehole Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, treatedBoreholeOnly: !prev.treatedBoreholeOnly }))}
              className="retro-btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                background: filters.treatedBoreholeOnly ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderColor: filters.treatedBoreholeOnly ? '#3b82f6' : 'var(--border-bold)',
                color: filters.treatedBoreholeOnly ? '#93c5fd' : 'var(--text-secondary)'
              }}
            >
              <Droplet size={14} color={filters.treatedBoreholeOnly ? '#93c5fd' : 'var(--text-muted)'} />
              <span>Treated Borehole Water</span>
            </button>

            {/* Gated Security Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, gatedSecurityOnly: !prev.gatedSecurityOnly }))}
              className="retro-btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                background: filters.gatedSecurityOnly ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                borderColor: filters.gatedSecurityOnly ? 'var(--emerald-primary)' : 'var(--border-bold)',
                color: filters.gatedSecurityOnly ? 'var(--emerald-light)' : 'var(--text-secondary)'
              }}
            >
              <Shield size={14} color={filters.gatedSecurityOnly ? 'var(--emerald-light)' : 'var(--text-muted)'} />
              <span>Gated & Night Security</span>
            </button>

            {/* Max Rent Filter */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                MAX RENT:
              </span>
              <span className="mono" style={{ color: 'var(--amber-light)', fontWeight: 700, fontSize: '0.85rem' }}>
                ₦{(filters.maxRent / 1000000).toFixed(1)}M
              </span>
              <input
                type="range"
                min="1000000"
                max="6000000"
                step="250000"
                value={filters.maxRent}
                onChange={(e) => setFilters(prev => ({ ...prev, maxRent: Number(e.target.value) }))}
                style={{ accentColor: 'var(--amber-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
