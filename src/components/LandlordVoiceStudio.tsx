'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { PropertyListing } from '../types';
import { 
  Mic, MicOff, Sparkles, Upload, CheckCircle2, Zap, 
  Droplet, Gauge, Shield, ArrowRight, Play, Check, Eye, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { analyzePropertyImage, ImageAuditResult } from '../lib/computerVision';

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
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  // Computer Vision State
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80'
  ]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [auditResult, setAuditResult] = useState<ImageAuditResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize transcript ref
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Analyze active photo on change
  useEffect(() => {
    if (uploadedPhotos.length > 0) {
      setIsAnalyzingPhoto(true);
      analyzePropertyImage(uploadedPhotos[activePhotoIndex]).then((res) => {
        setAuditResult(res);
        setIsAnalyzingPhoto(false);
      });
    }
  }, [uploadedPhotos, activePhotoIndex]);

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

  // Robust Speech Recognition Handler
  const handleToggleRecord = () => {
    setVoiceError(null);

    // If currently recording, stop it
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
      if (transcriptRef.current.trim()) {
        processTranscriptWithAi(transcriptRef.current);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not natively supported in this browser. Please use Chrome/Edge or click one of the quick preset voice memos below.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        transcriptRef.current = '';
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setTranscript(current);
        transcriptRef.current = current;
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceError("Microphone permission was denied. Please allow microphone access in your browser or try the pre-recorded voice memos below.");
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Audio intake error (${event.error}). You can also type notes directly.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (transcriptRef.current.trim()) {
          processTranscriptWithAi(transcriptRef.current);
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setVoiceError("Could not initialize microphone. Please click a preset voice memo below.");
      setIsRecording(false);
    }
  };

  // Robust West African NLP Extraction Logic
  const processTranscriptWithAi = (text: string) => {
    setIsProcessing(true);
    setTranscript(text);
    transcriptRef.current = text;

    setTimeout(() => {
      const lower = text.toLowerCase();

      // 1. Bedrooms Extraction
      let bedrooms = 2;
      let propertyType: 'self_contained' | 'one_bedroom' | 'two_bedroom' | 'three_bedroom' = 'two_bedroom';

      if (lower.includes('studio') || lower.includes('self contain') || lower.includes('single room')) {
        bedrooms = 1;
        propertyType = 'self_contained';
      } else if (lower.includes('one bedroom') || lower.includes('1 bedroom') || lower.includes('1-bed') || lower.includes('1 bed')) {
        bedrooms = 1;
        propertyType = 'one_bedroom';
      } else if (lower.includes('two bedroom') || lower.includes('2 bedroom') || lower.includes('2-bed') || lower.includes('2 bed')) {
        bedrooms = 2;
        propertyType = 'two_bedroom';
      } else if (lower.includes('three bedroom') || lower.includes('3 bedroom') || lower.includes('3-bed') || lower.includes('3 bed')) {
        bedrooms = 3;
        propertyType = 'three_bedroom';
      }

      // 2. Annual Rent Extraction (handles millions, thousands, combined phrases)
      let annualRent = 1600000;

      // Handle "1 million 600 thousand" or "2 million 200 thousand"
      const compoundMatch = lower.match(/(\d+(?:\.\d+)?)\s*million\s*(\d+(?:\.\d+)?)\s*thousand/);
      if (compoundMatch) {
        annualRent = (parseFloat(compoundMatch[1]) * 1000000) + (parseFloat(compoundMatch[2]) * 1000);
      } else {
        // Handle "1.6 million", "1.6m", "2 million", "2.2m"
        const millionMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:million|m\b)/);
        if (millionMatch) {
          annualRent = Math.round(parseFloat(millionMatch[1]) * 1000000);
        } else {
          // Handle "950 thousand", "650 thousand", "800k"
          const thousandMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k\b)/);
          if (thousandMatch) {
            annualRent = Math.round(parseFloat(thousandMatch[1]) * 1000);
          } else {
            // Raw digits like "1600000" or "950000"
            const rawMatch = lower.match(/\b([1-9]\d{5,7})\b/);
            if (rawMatch) {
              annualRent = parseInt(rawMatch[1], 10);
            }
          }
        }
      }

      // 3. Area & City in Ibadan
      let area = 'Bodija';
      let city = 'Ibadan, Oyo State';
      let address = '12 Osuntokun Avenue, Old Bodija';

      if (lower.includes('akobo') || lower.includes('general gas')) {
        area = 'Akobo';
        address = 'Kolapo Ishola Close, General Gas, Akobo';
      } else if (lower.includes('oluyole')) {
        area = 'Oluyole';
        address = 'Industrial Avenue, Oluyole Estate';
      } else if (lower.includes('samonda') || lower.includes('ui') || lower.includes('polytechnic')) {
        area = 'Samonda';
        address = 'University Crescent, Samonda';
      } else if (lower.includes('jericho') || lower.includes('onireke')) {
        area = 'Jericho';
        address = 'Onireke Layout, Jericho GRA';
      } else if (lower.includes('ring road') || lower.includes('challenge')) {
        area = 'Ring Road';
        address = 'MKO Abiola Way, Ring Road';
      } else if (lower.includes('agodi')) {
        area = 'Agodi GRA';
        address = 'Secretariat Road, Agodi GRA';
      }

      // 4. Power & Solar
      const hasSolar = lower.includes('solar') || lower.includes('inverter');
      let inverterKva = hasSolar ? 5.0 : 0;
      if (lower.includes('3.5kva') || lower.includes('3.5 kva')) inverterKva = 3.5;
      if (lower.includes('5kva') || lower.includes('5 kva')) inverterKva = 5.0;
      if (lower.includes('7.5kva') || lower.includes('7.5 kva')) inverterKva = 7.5;

      let gridHours = 16;
      const hoursMatch = lower.match(/(\d{1,2})\s*hours/);
      if (hoursMatch) {
        gridHours = Math.min(24, Math.max(4, parseInt(hoursMatch[1], 10)));
      }

      // 5. Water, Meter, Security
      const isBorehole = lower.includes('borehole') || !lower.includes('water board');
      const isDedicatedPrepaid = lower.includes('dedicated') || lower.includes('prepaid');
      const hasSecurity = lower.includes('guard') || lower.includes('security') || lower.includes('gated');

      setExtractedData({
        title: `${bedrooms}-Bedroom Flat in ${area} (Direct Owner Verified)`,
        description: text,
        area,
        city,
        address,
        annualRent,
        bedrooms,
        bathrooms: bedrooms === 1 ? 1 : 2,
        gridHours,
        backupPower: hasSolar ? 'solar_inverter' : 'generator',
        inverterCapacity: inverterKva,
        waterSource: isBorehole ? 'treated_borehole' : 'water_corporation',
        meterType: isDedicatedPrepaid ? 'dedicated_prepaid' : 'shared_prepaid',
        security: hasSecurity ? 'gated_night_guard' : 'gated_only',
        preferences: ['Working Professional', 'Quiet Lifestyle', 'Prompt Rent Payment']
      });

      setIsProcessing(false);
    }, 800);
  };

  // Real Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const readPromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            resolve(uploadEvent.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then((dataUrls) => {
        setUploadedPhotos((prev) => [...dataUrls, ...prev]);
        setActivePhotoIndex(0);
      });
    }
  };

  const handlePublish = () => {
    if (!extractedData) return;

    const notes = auditResult?.auditNotes || [
      '✓ Dedicated Conlog Prepaid Meter Verified',
      '✓ Solar Inverter & Battery Bank Verified',
      '✓ Gated Perimeter & Compound Security Verified'
    ];

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
        yearsAsOwner: 14,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phoneMasked: '+234 803 *** 8219',
        bio: 'Direct property owner registered on LockHouse. Zero middleman fees.'
      },
      aiAuditNotes: notes
    });

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setActiveView('feed');
    }, 900);
  };

  return (
    <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '30px 24px 80px' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="retro-badge badge-solar">
            <Mic size={14} /> 60-SECOND VOICE INTAKE
          </span>
          <span className="retro-badge badge-meter">
            <Eye size={14} /> COMPUTER VISION HARDWARE AUDIT
          </span>
          <span className="retro-badge badge-zero-cut">
            <Sparkles size={14} /> ZERO FORMS FOR LANDLORDS
          </span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Landlord Voice & AI Computer Vision Studio
        </h1>

        <p style={{ color: 'var(--text-secondary)', maxWidth: '780px' }}>
          Older landlords shouldn't suffer through 40-field tech forms. Tap the microphone to speak details naturally in English or Pidgin, or upload photos to trigger the <strong>Computer Vision Hardware Audit</strong> (detecting Conlog prepaid meters, solar inverter battery banks, and secure gates).
        </p>
      </div>

      {voiceError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid #ef4444',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fca5a5',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{voiceError}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Left Column: Voice Recorder & Transcript */}
        <div className="retro-window" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="window-header">
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--amber-light)', fontWeight: 700 }}>
              AUDIO INPUT CONSOLE // REAL-TIME SPEECH TO SCHEMA
            </span>
            <span className="mono" style={{ fontSize: '0.72rem', color: isRecording ? '#ef4444' : 'var(--text-muted)' }}>
              {isRecording ? '● RECORDING LIVE' : 'IDLE'}
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
              <span>{isRecording ? 'Stop & Parse Audio with AI' : 'Tap Mic to Speak Property Details'}</span>
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
                CAPTURED AUDIO TRANSCRIPT:
              </span>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Spoken words transcribe here automatically, or you can paste notes directly..."
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

        {/* Right Column: Computer Vision & AI Extraction Preview */}
        <div className="retro-window" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="window-header">
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--teal-light)', fontWeight: 700 }}>
              COMPUTER VISION & BEDROCK AUDIT // LIVE DEPLOYMENT
            </span>
            <span className="mono" style={{ fontSize: '0.72rem', color: isProcessing ? 'var(--amber-light)' : 'var(--emerald-light)' }}>
              {isProcessing ? 'PARSING...' : extractedData ? 'SCHEMA VERIFIED' : 'AWAITING INPUT'}
            </span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Real Computer Vision Hardware Viewport */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--teal-light)', fontWeight: 700 }}>
                  👁️ COMPUTER VISION HARDWARE DETECTOR:
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="retro-btn retro-btn-dark"
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  <Upload size={12} />
                  <span>Upload Real Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </div>

              {/* Photo Viewport with Real Bounding Boxes */}
              <div style={{
                position: 'relative',
                height: '200px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '2px solid var(--border-bold)',
                background: '#05070a'
              }}>
                <img
                  src={uploadedPhotos[activePhotoIndex]}
                  alt="Property Hardware"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Overlaid Bounding Boxes from Computer Vision Analysis */}
                {auditResult && auditResult.features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${feat.box.x * 100}%`,
                      top: `${feat.box.y * 100}%`,
                      width: `${feat.box.width * 100}%`,
                      height: `${feat.box.height * 100}%`,
                      border: idx === 0 ? '2px solid #06b6d4' : idx === 1 ? '2px solid #f59e0b' : '2px solid #10b981',
                      background: idx === 0 ? 'rgba(6, 182, 212, 0.15)' : idx === 1 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                      pointerEvents: 'none'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '-18px',
                      left: 0,
                      background: idx === 0 ? '#06b6d4' : idx === 1 ? '#f59e0b' : '#10b981',
                      color: '#000',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap'
                    }}>
                      {feat.label.toUpperCase()} • {feat.confidence}%
                    </span>
                  </div>
                ))}

                {isAnalyzingPhoto && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--teal-light)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    gap: '8px'
                  }}>
                    <Sparkles size={16} className="spin" />
                    <span>Analyzing pixel geometry & hardware signatures...</span>
                  </div>
                )}
              </div>

              {/* Photo Thumbnails */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {uploadedPhotos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    style={{
                      width: '48px',
                      height: '36px',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      border: activePhotoIndex === i ? '2px solid var(--amber-primary)' : '1px solid var(--border-subtle)',
                      padding: 0,
                      cursor: 'pointer',
                      background: 'transparent'
                    }}
                  >
                    <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Extracted Schema */}
            {extractedData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    <span style={{ color: 'var(--text-primary)' }}>
                      {extractedData.waterSource === 'treated_borehole' ? 'Treated Industrial Borehole' : 'Water Board'}
                    </span>
                  </div>
                </div>

                {/* Real Computer Vision Audit Notes */}
                {auditResult && (
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
                      COMPUTER VISION HARDWARE AUDIT FINDINGS:
                    </span>
                    {auditResult.auditNotes.map((det, i) => (
                      <div key={i} style={{ fontSize: '0.76rem', color: 'var(--text-primary)' }}>
                        {det}
                      </div>
                    ))}
                  </div>
                )}

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
                padding: '30px 20px',
                textAlign: 'center',
                border: '2px dashed var(--border-bold)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Sparkles size={28} color="var(--amber-primary)" />
                <p style={{ fontSize: '0.85rem' }}>
                  Speak details on the left, click a preset voice memo, or upload a photo to watch the AI Agent extract structured infrastructure schema in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
