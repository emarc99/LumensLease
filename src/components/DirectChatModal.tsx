'use client';

import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { 
  Send, Calendar, Check, X, UserCheck, ShieldCheck, 
  Zap, FileCheck, ArrowRight 
} from 'lucide-react';

export default function DirectChatModal() {
  const { 
    activeChatProperty, 
    setActiveChatProperty, 
    chatMessages, 
    sendMessage, 
    setActiveAgreementProperty 
  } = useProperty();

  const [inputMessage, setInputMessage] = useState('');
  const [inspectionDate, setInspectionDate] = useState('Saturday 11:00 AM');
  const [showInspectionPicker, setShowInspectionPicker] = useState(false);

  if (!activeChatProperty) return null;

  const prop = activeChatProperty;
  const messages = chatMessages[prop.id] || [];

  const quickChips = [
    "How many hours does the solar inverter run during power cuts?",
    "Can I come for a free inspection this Saturday?",
    "Is parking space allocated inside the gate?",
    "Is the prepaid meter strictly dedicated to this unit?"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage(prop.id, text);
    setInputMessage('');
  };

  const handleBookInspection = () => {
    sendMessage(prop.id, `I would like to book a free inspection on ${inspectionDate}. Will meet you directly.`, true, inspectionDate);
    setShowInspectionPicker(false);
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
    onClick={() => setActiveChatProperty(null)}
    >
      <div
        className="retro-window"
        style={{
          maxWidth: '680px',
          width: '100%',
          height: '620px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="window-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={prop.landlord.avatar}
              alt=""
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--amber-primary)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  {prop.landlord.name}
                </span>
                <UserCheck size={14} color="var(--emerald-primary)" />
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Direct Property Owner • ₦0 Agent Cut Guaranteed
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveChatProperty(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            [CLOSE ✕]
          </button>
        </div>

        {/* Property Context Strip */}
        <div style={{
          background: 'rgba(10, 13, 20, 0.9)',
          borderBottom: '1px solid var(--border-bold)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <div>
            <strong>{prop.title}</strong> — <span className="mono" style={{ color: 'var(--amber-light)' }}>₦{prop.annualRent.toLocaleString()}/yr</span>
          </div>

          <button
            onClick={() => {
              setActiveAgreementProperty(prop);
              setActiveChatProperty(null);
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--emerald-primary)',
              borderRadius: '3px',
              color: 'var(--emerald-light)',
              padding: '3px 8px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Draft Lease Agreement
          </button>
        </div>

        {/* Message Thread */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'var(--bg-dark)'
        }}>
          {messages.map((msg) => {
            const isMe = msg.senderRole === 'tenant';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {msg.senderName} • {msg.timestamp}
                </div>

                <div style={{
                  background: isMe ? 'var(--amber-primary)' : 'var(--bg-card)',
                  color: isMe ? '#000' : 'var(--text-primary)',
                  border: `2px solid ${isMe ? '#000' : 'var(--border-bold)'}`,
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-retro)',
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          padding: '8px 14px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="retro-btn"
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'var(--border-bold)',
                color: 'var(--text-secondary)'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          borderTop: '2px solid var(--border-bold)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowInspectionPicker(!showInspectionPicker)}
            className="retro-btn retro-btn-dark"
            style={{ padding: '10px', flexShrink: 0 }}
            title="Book Free Inspection"
          >
            <Calendar size={18} color="var(--teal-light)" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputMessage); }}
            placeholder="Type your message directly to the landlord..."
            style={{
              flex: 1,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-bold)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />

          <button
            onClick={() => handleSend(inputMessage)}
            className="retro-btn retro-btn-amber"
            style={{ padding: '10px 18px', flexShrink: 0 }}
          >
            <Send size={16} color="#000" />
            <span style={{ fontWeight: 700 }}>Send</span>
          </button>
        </div>

        {/* Inspection Schedule Popover */}
        {showInspectionPicker && (
          <div style={{
            padding: '12px 16px',
            background: '#090d14',
            borderTop: '1px solid var(--teal-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--teal-light)' }}>
                FREE DIRECT INSPECTION:
              </span>
              <select
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-bold)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <option value="Saturday 11:00 AM">Saturday 11:00 AM</option>
                <option value="Saturday 3:00 PM">Saturday 3:00 PM</option>
                <option value="Sunday 2:00 PM">Sunday 2:00 PM</option>
                <option value="Monday 10:00 AM">Monday 10:00 AM</option>
              </select>
            </div>

            <button
              onClick={handleBookInspection}
              className="retro-btn retro-btn-teal"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Confirm ₦0 Inspection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
