'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Mic, MicOff, X, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import CleanPropertyCard from '../components/CleanPropertyCard';
import { useProperty } from '../context/PropertyContext';

export default function HomePage() {
  const { properties, totalSavingsNgn } = useProperty();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All homes');
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const voicePresetIdx = useRef(0);

  const sampleVoiceQueries = [
    "quiet 2-bed in Bodija with 5kVA solar",
    "dedicated prepaid meter in Akobo",
    "treated borehole in Oluyole with backup light",
    "self contained studio near UI in Samonda"
  ];

  // Initialize Speech Recognition
  const handleToggleVoice = () => {
    setVoiceNotice(null);

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { console.error(e); }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback for browsers without Web Speech API: simulate cycling realistic voice queries
      const nextQuery = sampleVoiceQueries[voicePresetIdx.current % sampleVoiceQueries.length];
      voicePresetIdx.current += 1;
      setQuery(nextQuery);
      setVoiceNotice(`Speech API not supported in this browser — applied voice preset: "${nextQuery}"`);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening to microphone... speak your requirements (e.g. "quiet flat in Bodija with solar")');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setQuery(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          // Microphone permission denied: gracefully fall back to cycling voice query preset
          const nextQuery = sampleVoiceQueries[voicePresetIdx.current % sampleVoiceQueries.length];
          voicePresetIdx.current += 1;
          setQuery(nextQuery);
          setVoiceNotice(`Microphone access denied. Loaded spoken preset: "${nextQuery}"`);
        } else if (event.error !== 'no-speech') {
          setVoiceNotice(`Voice intake notice (${event.error}). Try again or click a sample query below.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      const nextQuery = sampleVoiceQueries[voicePresetIdx.current % sampleVoiceQueries.length];
      voicePresetIdx.current += 1;
      setQuery(nextQuery);
      setVoiceNotice(`Loaded spoken preset: "${nextQuery}"`);
      setIsListening(false);
    }
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

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
              <Link href="/calculator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                Calculate your exact savings <ArrowRight size={13} />
              </Link>
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

            <div className="searchbox" style={{ borderColor: isListening ? '#ef4444' : undefined, boxShadow: isListening ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : undefined }}>
              <Search size={18} style={{ color: '#697386', marginLeft: '6px' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? "Listening... speak now (e.g. '2-bed with solar in Bodija')" : "Try ‘quiet 2-bed in Bodija with 5kVA solar’"}
                aria-label="Search verified homes"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleVoice}
                style={{
                  background: isListening ? '#fee2e2' : undefined,
                  color: isListening ? '#b91c1c' : undefined,
                  borderColor: isListening ? '#fca5a5' : undefined
                }}
                title={isListening ? "Click to stop listening" : "Click to speak voice search"}
              >
                {isListening ? <MicOff size={15} color="#ef4444" /> : <Mic size={15} />}
                <span>{isListening ? 'Listening...' : 'Voice Query'}</span>
              </button>
            </div>

            {/* Voice notice / status feedback */}
            {voiceNotice && (
              <div style={{
                marginTop: '8px',
                fontSize: '0.8rem',
                color: '#697386',
                background: '#f8fafc',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={13} color="var(--orange)" />
                <span>{voiceNotice}</span>
              </div>
            )}

            {/* Spoken voice suggestion chips */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              fontSize: '0.78rem',
              color: '#64748b',
              flexWrap: 'wrap'
            }}>
              <span>Spoken prompts:</span>
              {sampleVoiceQueries.map((sq) => (
                <button
                  key={sq}
                  type="button"
                  onClick={() => setQuery(sq)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  "{sq}"
                </button>
              ))}
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
        </div>
      </main>
    </div>
  );
}
