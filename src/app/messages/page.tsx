'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, FileText, Send, ShieldCheck, Calendar, Phone, Sparkles } from 'lucide-react';
import Header from '../../components/Header';
import { useProperty } from '../../context/PropertyContext';
import { PropertyListing } from '../../types';

function MessagesContent() {
  const { properties, chatMessages, sendMessage, setActiveAgreementProperty } = useProperty();
  const searchParams = useSearchParams();
  const propIdFromQuery = searchParams.get('prop');

  // Select active property (from query param or default to first property)
  const initialProp = properties.find((p) => p.id === propIdFromQuery) || properties[0];
  const [selectedPropId, setSelectedPropId] = useState<string>(initialProp ? initialProp.id : '');
  const [text, setText] = useState('');

  const activeProp: PropertyListing | undefined =
    properties.find((p) => p.id === selectedPropId) || properties[0];

  const currentChats = activeProp ? chatMessages[activeProp.id] || [] : [];

  const handleSend = () => {
    if (!text.trim() || !activeProp) return;
    sendMessage(activeProp.id, text.trim());
    setText('');
  };

  const handleQuickQuestion = (q: string) => {
    if (!activeProp) return;
    sendMessage(activeProp.id, q);
  };

  const handleBookInspection = () => {
    if (!activeProp) return;
    sendMessage(
      activeProp.id,
      'Hello, I would like to schedule a free inspection for this coming Saturday at 11:00 AM. Please confirm if this time works for you.',
      true,
      'Saturday at 11:00 AM'
    );
  };

  const quickQuestions = [
    'Can I inspect this Saturday morning?',
    'How long does the backup power run?',
    'Is there a dedicated prepaid meter?',
    'Is borehole water running 24/7?'
  ];

  return (
    <div className="shell">
      <Header />

      <main className="page container">
        <Link href="/" className="back">
          <ArrowLeft size={14} style={{ verticalAlign: '-2px' }} /> Back to homes
        </Link>

        <div style={{ margin: '24px 0' }}>
          <div className="kicker">Direct room · no middleman</div>
          <h1 style={{ fontSize: 44, letterSpacing: '-.06em', margin: '10px 0', lineHeight: 1.1 }}>
            A clearer way to talk it out.
          </h1>
          <p className="hero-copy">
            Ask the real questions. Book free inspections directly with verified landlords. Zero middleman fees.
          </p>
        </div>

        <div className="chat-layout">
          {/* Left Column: Conversations & Actions */}
          <div>
            <div className="panel">
              <div className="panel-label">Open Conversations</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {properties.slice(0, 4).map((p) => {
                  const isSelected = p.id === activeProp?.id;
                  const initials = p.landlord.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('');

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPropId(p.id)}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: isSelected ? 'var(--paper)' : '#ffffff',
                        border: isSelected ? '2px solid var(--ink)' : '1px solid var(--line)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div className="avatar" style={{ background: isSelected ? 'var(--ink)' : '#f1f5f9', color: isSelected ? '#fff' : 'var(--ink)' }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.landlord.name}
                        </strong>
                        <div className="card-meta" style={{ fontSize: '0.78rem' }}>
                          {p.bedrooms} Bed · {p.area}
                        </div>
                      </div>
                      <span className="live-dot" style={{ marginLeft: 'auto' }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-label">Ask quickly</div>
              <div className="quick">
                {quickQuestions.map((q) => (
                  <button key={q} onClick={() => handleQuickQuestion(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-label">Zero-Fee Inspection</div>
              <p style={{ fontSize: '0.85rem', color: '#697386', margin: '8px 0 12px' }}>
                LockHouse inspections are 100% free. You meet the verified landlord directly at the gate.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleBookInspection}
              >
                <Calendar size={15} /> Book Saturday 11am inspection
              </button>
            </div>

            {activeProp && (
              <div className="agreement" style={{ marginTop: 16 }}>
                <FileText size={22} color="#f59e0b" />
                <h2>Zero-agent agreement</h2>
                <p>
                  When you’re both ready, generate an official Oyo State tenancy agreement with rent (₦
                  {activeProp.annualRent.toLocaleString()}/yr), utility covenants, and zero agent fees.
                </p>
                <button
                  className="btn btn-accent"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveAgreementProperty(activeProp)}
                >
                  <FileText size={15} /> Generate agreement
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Chat Thread */}
          {activeProp ? (
            <div className="thread">
              <div className="thread-head">
                <div className="avatar">
                  {activeProp.landlord.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '1.05rem' }}>{activeProp.landlord.name}</strong>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f0fdf4',
                        color: '#15803d',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      <ShieldCheck size={12} /> Verified Owner
                    </span>
                  </div>
                  <div className="card-meta">
                    {activeProp.title} · {activeProp.area}, {activeProp.city}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`tel:${activeProp.landlord.phoneMasked}`}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    title="Direct Landlord Phone"
                  >
                    <Phone size={13} /> {activeProp.landlord.phoneMasked}
                  </a>
                </div>
              </div>

              <div className="messages" style={{ minHeight: '380px', maxHeight: '520px', overflowY: 'auto' }}>
                {/* Default greeting bubble */}
                <div className="bubble">
                  Good day! I am the direct owner of {activeProp.title} in {activeProp.area}. 
                  There is 0% agency fee and 0% legal markup. Feel free to ask about our {activeProp.utility.backupPowerType === 'solar_inverter' ? `${activeProp.utility.inverterCapacityKva}kVA solar inverter` : 'backup power'}, water supply, or to book a free gate inspection.
                </div>

                {/* Chat history */}
                {currentChats.map((m) => (
                  <div
                    key={m.id}
                    className={`bubble ${m.senderRole === 'tenant' ? 'you' : ''}`}
                  >
                    {m.isInspectionRequest && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, color: 'var(--teal)' }}>
                        <Calendar size={14} /> FREE INSPECTION REQUEST:
                      </div>
                    )}
                    <div>{m.text}</div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: m.senderRole === 'tenant' ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                        marginTop: '4px',
                        textAlign: 'right'
                      }}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend();
                  }}
                  placeholder="Write a respectful message directly to the owner…"
                  aria-label="Message"
                />
                <button className="btn btn-primary" onClick={handleSend} aria-label="Send message">
                  <Send size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="thread" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Select a conversation from the left to start messaging.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>Loading direct conversations...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
