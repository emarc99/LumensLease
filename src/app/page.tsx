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
      setVoiceNotice("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
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
        setVoiceNotice('Listening to microphone... speak your search requirements');
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
          setVoiceNotice("Microphone permission was denied. Please allow microphone access in your browser.");
        } else if (event.error !== 'no-speech') {
          setVoiceNotice(`Voice search notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setVoiceNotice('Could not start voice search.');
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

// NLP Search Parser for spoken or typed queries like "Below 700,000 naira" or "2-bed with solar in Bodija"
function parseSearchQuery(rawQuery: string) {
  if (!rawQuery || !rawQuery.trim()) return null;

  // 1. Normalize numbers with commas: e.g. '700,000' -> '700000'
  let normalized = rawQuery.replace(/(\d),(\d)/g, '$1$2');
  normalized = normalized.replace(/[.,!?;:()"'`]/g, ' ').toLowerCase().trim();

  let maxBudget: number | null = null;
  let minBudget: number | null = null;
  let bedrooms: number | null = null;
  let requireSolar = false;
  let requirePrepaid = false;
  let requireBorehole = false;

  // Budget parsing: e.g. 'below 700000 naira', 'under 1.5 million', 'less than 800k', 'max 2m', 'under 700,000'
  const belowMatch = normalized.match(/(?:below|under|less than|max|maximum|within|budget of?)\s*([0-9]+(?:\.[0-9]+)?)\s*(million|m|k|thousand|naira)?/i) ||
                     normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*(million|m|k|thousand)?\s*(?:naira)?\s*(?:or less|max|budget)/i);
  
  if (belowMatch) {
    let val = parseFloat(belowMatch[1]);
    const unit = (belowMatch[2] || '').toLowerCase();
    if (unit === 'million' || unit === 'm' || (val <= 10 && val > 0 && !unit.includes('k'))) {
      val = val * 1000000;
    } else if (unit === 'thousand' || unit === 'k' || (val > 10 && val < 10000)) {
      val = val * 1000;
    }
    maxBudget = val;
    normalized = normalized.replace(belowMatch[0], ' ');
  }

  // Minimum budget: 'above 1 million', 'more than 800k'
  const aboveMatch = normalized.match(/(?:above|over|more than|min|minimum)\s*([0-9]+(?:\.[0-9]+)?)\s*(million|m|k|thousand|naira)?/i);
  if (aboveMatch) {
    let val = parseFloat(aboveMatch[1]);
    const unit = (aboveMatch[2] || '').toLowerCase();
    if (unit === 'million' || unit === 'm' || (val <= 10 && val > 0 && !unit.includes('k'))) {
      val = val * 1000000;
    } else if (unit === 'thousand' || unit === 'k') {
      val = val * 1000;
    }
    minBudget = val;
    normalized = normalized.replace(aboveMatch[0], ' ');
  }

  // Bedrooms parsing
  if (normalized.includes('studio') || normalized.includes('self contain')) {
    bedrooms = 1;
    normalized = normalized.replace(/studio|self contain(ed)?/g, ' ');
  } else if (normalized.match(/1\s*-?\s*bed|one\s*-?\s*bed/)) {
    bedrooms = 1;
    normalized = normalized.replace(/1\s*-?\s*bedroom|1\s*-?\s*bed|one\s*-?\s*bedroom|one\s*-?\s*bed/g, ' ');
  } else if (normalized.match(/2\s*-?\s*bed|two\s*-?\s*bed/)) {
    bedrooms = 2;
    normalized = normalized.replace(/2\s*-?\s*bedroom|2\s*-?\s*bed|two\s*-?\s*bedroom|two\s*-?\s*bed/g, ' ');
  } else if (normalized.match(/3\s*-?\s*bed|three\s*-?\s*bed/)) {
    bedrooms = 3;
    normalized = normalized.replace(/3\s*-?\s*bedroom|3\s*-?\s*bed|three\s*-?\s*bedroom|three\s*-?\s*bed/g, ' ');
  }

  // Amenities
  if (normalized.match(/solar|inverter|24\/7|light|power/)) {
    requireSolar = true;
    normalized = normalized.replace(/solar|inverter|24\/7|backup power|light|power/g, ' ');
  }
  if (normalized.match(/prepaid|meter/)) {
    requirePrepaid = true;
    normalized = normalized.replace(/dedicated prepaid|prepaid meter|prepaid|meter/g, ' ');
  }
  if (normalized.match(/borehole|water/)) {
    requireBorehole = true;
    normalized = normalized.replace(/treated borehole|borehole|water/g, ' ');
  }

  // Residual keywords (e.g. 'bodija', 'akobo', 'quiet')
  const stopWords = new Set([
    'below', 'under', 'less', 'than', 'naira', 'ngn', 'in', 'at', 'for', 'with', 'and', 'the',
    'a', 'an', 'house', 'flat', 'apartment', 'home', 'homes', 'room', 'looking', 'find', 'show', 'me'
  ]);
  const keywords = normalized.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

  return { maxBudget, minBudget, bedrooms, requireSolar, requirePrepaid, requireBorehole, keywords };
}

  const filteredProperties = useMemo(() => {
    const parsed = parseSearchQuery(query);

    return properties.filter((p) => {
      // 1. Natural Language / Search Query constraints
      if (parsed) {
        if (parsed.maxBudget !== null && p.annualRent > parsed.maxBudget) return false;
        if (parsed.minBudget !== null && p.annualRent < parsed.minBudget) return false;
        if (parsed.bedrooms !== null && p.bedrooms !== parsed.bedrooms) return false;
        if (parsed.requireSolar && p.utility.backupPowerType !== 'solar_inverter' && p.utility.backupPowerType !== 'hybrid' && p.utility.gridHoursPerDay < 18) return false;
        if (parsed.requirePrepaid && p.utility.meterType !== 'dedicated_prepaid') return false;
        if (parsed.requireBorehole && p.utility.waterSource !== 'treated_borehole') return false;

        if (parsed.keywords.length > 0) {
          const searchableText = `${p.title} ${p.area} ${p.city} ${p.description} ${p.address} ${p.landlord.name}`.toLowerCase();
          const matchesKeyword = parsed.keywords.some(kw => searchableText.includes(kw));
          if (!matchesKeyword) return false;
        }
      }

      // 2. Filter Pills
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

      return matchesFilter;
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

            {filteredProperties.length === 0 ? (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed var(--line)',
                marginTop: '16px'
              }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)' }}>
                  No homes found matching {query ? `"${query}"` : 'selected filters'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 16px' }}>
                  Try adjusting your budget or clearing active filters.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setQuery(''); setActiveFilter('All homes'); }}
                >
                  Clear search & filters
                </button>
              </div>
            ) : (
              <div className="grid">
                {filteredProperties.map((p) => (
                  <CleanPropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
