'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { PropertyListing } from '../types';
import { 
  Mic, MicOff, Sparkles, Upload, CheckCircle2, Zap, 
  Droplet, Gauge, Shield, ArrowRight, Play, Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExtractedData {
  title: string;
  description: string;
  area: string;
  city: string;
  address: string;
  annualRent: number;
  bedrooms: number;
  bathrooms: number;
  gridHours: number;
  backupPower: 'solar_inverter' | 'generator' | 'hybrid' | 'none';
  inverterCapacity: number;
  waterSource: 'treated_borehole' | 'untreated_borehole' | 'water_corporation' | 'well';
  meterType: 'dedicated_prepaid' | 'shared_prepaid' | 'estimated_analog';
  security: 'gated_night_guard' | 'gated_only' | 'open_street';
  preferences: string[];
}

export default function LandlordVoiceStudio() {
  const { addNewProperty, setActiveView } = useProperty();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80'
  ]);
  const [cvDetections, setCvDetections] = useState<string[]>([
    '✓ Conlog Single-Phase Prepaid Meter Detected on Wall',
    '✓ 5kVA Solar Inverter Battery Bank Detected',
    '✓ Clean Interlock Compound & Secure Perimeter Gate'
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 32;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        let height = 6;
        if (isRecording) {
          height = Math.sin(step + i * 0.4) * 22 + 28;
        } else if (isProcessing) {
          height = Math.sin(step * 2 + i * 0.6) * 14 + 18;
        }

        ctx.fillStyle = isRecording ? '#f59e0b' : isProcessing ? '#06b6d4' : '#334155';
        ctx.fillRect(i * barWidth + 2, canvas.height / 2 - height / 2, barWidth - 4, height);
      }
      step += 0.1;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, isProcessing]);

  // Voice Presets
  const sampleVoiceMemos = [
    {
      label: "Preset 1: Chief Adeleke (Old Bodija 2-Bed with Solar)",
      text: "I have a clean two bedroom flat at 12 Osuntokun Avenue, Old Bodija Ibadan. Rent is 1 million 600 thousand Naira per year. We have 5kVA solar inverter with 16 hours of IBEDC grid light, dedicated prepaid meter, treated borehole water, and night security guard. Looking for a quiet working professional, no smoking."
    },
    {
      label: "Preset 2: Mrs. Alabi (Akobo General Gas 1-Bed)",
      text: "Newly built one bedroom flat off General Gas road in Akobo Ibadan for 950 thousand Naira per year. Dedicated prepaid meter inside the flat, 18 hours light backed with hybrid solar, compound is gated and paved. Ideal for a remote software engineer, singles welcome."
    },
    {
      label: "Preset 3: Pa Makinde (Samonda near UI Studio)",
      text: "Modern self contained studio apartment along Polytechnic road in Samonda Ibadan. Annual rent is 650 thousand Naira. 15 hours IBEDC light backed with solar inverter for router and laptop, water board connection, gated compound."
    }
  ];

  const handleToggleRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use the preset voice memos below or type your description.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript + ' ';
      }
      setTranscript(current);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      setIsRecording(false);
      if (transcript.trim()) {
        processTranscriptWithAi(transcript);
      }
    };

    recognition.start();
  };

  const processTranscriptWithAi = (text: string) => {
    setIsProcessing(true);
    setTranscript(text);

    // Simulate AWS Bedrock Agent Extraction
    setTimeout(() => {
      const lower = text.toLowerCase();

      let bedrooms = 1;
      if (lower.includes('two bedroom') || lower.includes('2 bedroom') || lower.includes('2-bed')) bedrooms = 2;
      if (lower.includes('three bedroom') || lower.includes('3 bedroom')) bedrooms = 3;

      let annualRent = 1800000;
      if (lower.includes('2 million 200') || lower.includes('2.2 million') || lower.includes('2,200,000')) annualRent = 2200000;
      if (lower.includes('3 million') || lower.includes('3,000,000')) annualRent = 3000000;
      if (lower.includes('1.5 million') || lower.includes('1,500,000')) annualRent = 1500000;

      let area = 'Bodija';
      let city = 'Ibadan, Oyo State';
      let address = 'Osuntokun Avenue, Old Bodija';
      if (lower.includes('akobo')) { area = 'Akobo'; address = 'Kolapo Ishola Extension, Akobo'; }
      if (lower.includes('oluyole')) { area = 'Oluyole'; address = 'Industrial Road, Oluyole Estate'; }
      if (lower.includes('samonda') || lower.includes('ui')) { area = 'Samonda'; address = 'Polytechnic Road, Samonda'; }
      if (lower.includes('jericho')) { area = 'Jericho'; address = 'Onireke Layout, Jericho'; }

      let hasSolar = lower.includes('solar') || lower.includes('inverter');
      let gridHours = lower.includes('20 hours') ? 20 : lower.includes('16 hours') ? 16 : 14;

      setExtractedData({
        title: `Spacious ${bedrooms}-Bedroom Flat (${area}) with Direct Owner Trust`,
        description: text,
        area,
        city,
        address,
        annualRent,
        bedrooms,
        bathrooms: bedrooms === 1 ? 1 : 2,
        gridHours,
        backupPower: hasSolar ? 'solar_inverter' : 'generator',
        inverterCapacity: hasSolar ? 5.0 : 0,
        waterSource: 'treated_borehole',
        meterType: 'dedicated_prepaid',
        security: 'gated_night_guard',
        preferences: ['Working Professional', 'Quiet Lifestyle', 'No Smoking']
      });

      setIsProcessing(false);
    }, 1000);
  };

  const handlePublish = () => {
    if (!extractedData) return;

    addNewProperty({
      title: extractedData.title,
      description: extractedData.description,
      area: extractedData.area,
      city: extractedData.city,
      address: extractedData.address,
      annualRent: extractedData.annualRent,
      bedrooms: extractedData.bedrooms,
      bathrooms: extractedData.bathrooms,
      propertyType: extractedData.bedrooms === 1 ? 'one_bedroom' : 'two_bedroom',
      photos: uploadedPhotos,
      utility: {
        gridHoursPerDay: extractedData.gridHours,
        backupPowerType: extractedData.backupPower,
        inverterCapacityKva: extractedData.inverterCapacity,
        waterSource: extractedData.waterSource,
        meterType: extractedData.meterType,
        compoundSecurity: extractedData.security,
        floodRiskLevel: 'zero_flood_zone',
        verifiedByAi: true,
        communityRating: 5.0
      },
      preferences: {
        employmentStatus: 'working_professional',
        maritalStatusPreference: 'singles_welcome',
        religiousPreference: 'any',
        smokingAllowed: false,
        maxOccupants: 3
      },
      landlord: {
        name: 'Pa Johnson Adeleke',
        verifiedOwner: true,
        yearsAsOwner: 12,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phoneMasked: '+234 803 *** 8219',
        bio: 'Direct owner listed via LockHouse Voice Studio. No middleman agent cuts.'
      },
      aiAuditNotes: cvDetections
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setActiveView('feed');
    }, 1000);
  };

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 24px 80px' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="retro-badge badge-solar">
            <Mic size={14} /> 60-SECOND VOICE INTAKE
          </span>
          <span className="retro-badge badge-zero-cut">
            <Sparkles size={14} /> ZERO FORMS FOR LANDLORDS
          </span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Landlord Voice & AI Studio
        </h1>

        <p style={{ color: 'var(--text-secondary)', maxWidth: '720px' }}>
          Older landlords shouldn't suffer through 40-field tech forms. Tap the microphone and speak your house details naturally in English or Pidgin. Our <strong>AWS Bedrock AI Agent</strong> extracts the rent, utility truth, and house rules automatically.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Left Column: Voice Recorder & Transcript */}
        <div className="retro-window" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="window-header">
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--amber-light)', fontWeight: 700 }}>
              AUDIO INPUT CONSOLE // REAL-TIME SPEECH TO SCHEMA
            </span>
            <span className="mono" style={{ fontSize: '0.72rem', color: isRecording ? '#ef4444' : 'var(--text-muted)' }}>
              {isRecording ? '● RECORDING' : 'IDLE'}
            </span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Waveform Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={70}
              style={{
                width: '100%',
                background: '#090d14',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-bold)'
              }}
            />

            {/* Record Action Button */}
            <button
              onClick={handleToggleRecord}
              className={`retro-btn ${isRecording ? 'retro-btn-amber' : 'retro-btn-dark'}`}
              style={{ padding: '16px', fontSize: '1.05rem', justifyContent: 'center' }}
            >
              {isRecording ? <MicOff size={22} color="#000" /> : <Mic size={22} color="var(--amber-light)" />}
              <span>{isRecording ? 'Stop & Parse Audio' : 'Tap to Speak House Details'}</span>
            </button>

            {/* Quick Preset Voice Memos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                OR RUN A PRE-RECORDED LANDLORD VOICE MEMO:
              </span>
              {sampleVoiceMemos.map((memo, idx) => (
                <button
                  key={idx}
                  onClick={() => processTranscriptWithAi(memo.text)}
                  className="retro-btn retro-btn-dark"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    background: 'rgba(255,255,255,0.03)'
                  }}
                >
                  <Play size={12} color="var(--amber-light)" />
                  <span>{memo.label}</span>
                </button>
              ))}
            </div>

            {/* Live Audio Transcript Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                CAPTURED LANDLORD AUDIO TRANSCRIPT:
              </span>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Spoken words will transcribe here, or you can paste raw notes from WhatsApp..."
                style={{
                  width: '100%',
                  height: '110px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-bold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              {transcript && (
                <button
                  onClick={() => processTranscriptWithAi(transcript)}
                  className="retro-btn retro-btn-teal"
                  style={{ padding: '8px', fontSize: '0.8rem', alignSelf: 'flex-end' }}
                >
                  <Sparkles size={14} />
                  <span>Re-parse with AWS Bedrock</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Live Card Preview */}
        <div className="retro-window" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="window-header">
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--teal-light)', fontWeight: 700 }}>
              AWS BEDROCK INTELLIGENCE // EXTRACTED SCHEMA
            </span>
            <span className="mono" style={{ fontSize: '0.72rem', color: isProcessing ? 'var(--amber-light)' : 'var(--emerald-light)' }}>
              {isProcessing ? 'PARSING...' : extractedData ? 'SCHEMA READY' : 'WAITING FOR VOICE'}
            </span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {extractedData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Extracted Fields */}
                <div style={{
                  background: 'rgba(10, 13, 20, 0.85)',
                  border: '1px solid var(--border-bold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Location / Area:</span>
                    <span style={{ color: 'var(--teal-light)', fontWeight: 700 }}>{extractedData.area}, {extractedData.city}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Direct Annual Rent:</span>
                    <span style={{ color: 'var(--amber-light)', fontWeight: 800 }}>₦{extractedData.annualRent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Daily Grid Light:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{extractedData.gridHours} Hours / Day</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Backup Power:</span>
                    <span style={{ color: 'var(--emerald-light)' }}>
                      {extractedData.backupPower === 'solar_inverter' ? `${extractedData.inverterCapacity}kVA Solar Inverter` : extractedData.backupPower}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Meter Type:</span>
                    <span style={{ color: 'var(--teal-light)' }}>Dedicated Prepaid Meter</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Water System:</span>
                    <span style={{ color: 'var(--text-primary)' }}>Treated Industrial Borehole</span>
                  </div>
                </div>

                {/* Computer Vision Detections */}
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid var(--teal-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-light)', fontWeight: 700 }}>
                    COMPUTER VISION IMAGE AUDIT:
                  </span>
                  {cvDetections.map((det, i) => (
                    <div key={i} style={{ fontSize: '0.76rem', color: 'var(--text-primary)' }}>
                      {det}
                    </div>
                  ))}
                </div>

                {/* Publish Action */}
                <button
                  onClick={handlePublish}
                  className="retro-btn retro-btn-amber"
                  style={{ padding: '16px', fontSize: '1.05rem', justifyContent: 'center' }}
                >
                  <CheckCircle2 size={20} color="#000" />
                  <span>Publish to LockHouse Feed (0% Commission)</span>
                </button>
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                border: '2px dashed var(--border-bold)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Sparkles size={32} color="var(--amber-primary)" />
                <p style={{ fontSize: '0.9rem' }}>
                  Awaiting audio input. Speak details on the left or select a preset to watch the AI Agent extract structured infrastructure schema in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
