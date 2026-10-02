'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Check, Mic, MicOff, Upload, WandSparkles, Sparkles, 
  CheckCircle2, Play, Eye, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Header from '../../components/Header';
import { useProperty } from '../../context/PropertyContext';
import { analyzePropertyImage, ImageAuditResult } from '../../lib/computerVision';

export default function StudioPage() {
  const { addNewProperty } = useProperty();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('Executive 2-Bedroom Flat with 5kVA Solar Inverter');
  const [location, setLocation] = useState('Osuntokun Avenue, Old Bodija, Ibadan');
  const [annualRent, setAnnualRent] = useState(1600000);
  const [bedrooms, setBedrooms] = useState(2);
  const [gridHours, setGridHours] = useState(16);
  const [hasSolar, setHasSolar] = useState(true);

  // Computer Vision State
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80'
  ]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [auditResult, setAuditResult] = useState<ImageAuditResult | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Run CV analysis on photo change
  useEffect(() => {
    if (uploadedPhotos.length > 0) {
      setIsAnalyzingPhoto(true);
      analyzePropertyImage(uploadedPhotos[activePhotoIdx]).then((res) => {
        setAuditResult(res);
        setIsAnalyzingPhoto(false);
      });
    }
  }, [uploadedPhotos, activePhotoIdx]);

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

  // Speech Recognition
  const handleToggleRecord = () => {
    setVoiceError(null);

    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { console.error(e); }
      }
      setIsRecording(false);
      if (transcriptRef.current.trim()) {
        parseAudioText(transcriptRef.current);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Microphone speech-to-text is not supported in this browser. Please use Chrome/Edge or click a sample preset memo below.");
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
        if (event.error === 'not-allowed') {
          setVoiceError("Microphone permission was denied. You can click a preset voice memo below.");
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Audio intake error (${event.error}). You can also type notes directly.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (transcriptRef.current.trim()) {
          parseAudioText(transcriptRef.current);
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setVoiceError("Could not initialize microphone. Please click a preset voice memo below.");
      setIsRecording(false);
    }
  };

  // Robust NLP Parser
  const parseAudioText = (text: string) => {
    setIsProcessing(true);
    setTranscript(text);
    transcriptRef.current = text;

    setTimeout(() => {
      const lower = text.toLowerCase();

      // 1. Bedrooms
      let beds = 2;
      if (lower.includes('studio') || lower.includes('self contain') || lower.includes('single room') || lower.includes('1 bedroom') || lower.includes('one bedroom')) {
        beds = 1;
      } else if (lower.includes('three bedroom') || lower.includes('3 bedroom')) {
        beds = 3;
      }
      setBedrooms(beds);

      // 2. Rent
      let rent = 1600000;
      const compoundMatch = lower.match(/(\d+(?:\.\d+)?)\s*million\s*(\d+(?:\.\d+)?)\s*thousand/);
      if (compoundMatch) {
        rent = (parseFloat(compoundMatch[1]) * 1000000) + (parseFloat(compoundMatch[2]) * 1000);
      } else {
        const millionMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:million|m\b)/);
        if (millionMatch) {
          rent = Math.round(parseFloat(millionMatch[1]) * 1000000);
        } else {
          const thousandMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k\b)/);
          if (thousandMatch) {
            rent = Math.round(parseFloat(thousandMatch[1]) * 1000);
          }
        }
      }
      setAnnualRent(rent);

      // 3. Location
      let loc = 'Osuntokun Avenue, Old Bodija, Ibadan';
      if (lower.includes('akobo') || lower.includes('general gas')) loc = 'General Gas Road, Akobo, Ibadan';
      else if (lower.includes('oluyole')) loc = 'Industrial Avenue, Oluyole Estate, Ibadan';
      else if (lower.includes('samonda') || lower.includes('ui')) loc = 'Polytechnic Road, Samonda, Ibadan';
      else if (lower.includes('jericho')) loc = 'Onireke Layout, Jericho, Ibadan';
      setLocation(loc);

      // 4. Power & Solar
      const solar = lower.includes('solar') || lower.includes('inverter');
      setHasSolar(solar);

      const hoursMatch = lower.match(/(\d{1,2})\s*hours/);
      if (hoursMatch) setGridHours(parseInt(hoursMatch[1], 10));

      setTitle(`Clean ${beds}-Bedroom Flat in ${loc.split(',')[1]?.trim() || 'Ibadan'}`);
      setIsProcessing(false);
    }, 600);
  };

  // Real Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const readPromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then((dataUrls) => {
        setUploadedPhotos((prev) => [...dataUrls, ...prev]);
        setActivePhotoIdx(0);
      });
    }
  };

  const handlePublish = () => {
    const area = location.includes('Akobo') ? 'Akobo'
      : location.includes('Oluyole') ? 'Oluyole'
      : location.includes('Samonda') ? 'Samonda'
      : location.includes('Jericho') ? 'Jericho'
      : 'Bodija';

    addNewProperty({
      title,
      description: transcript || `Direct landlord listing located at ${location}. Features dedicated prepaid meter, clean borehole water, and 0% agent fee.`,
      area,
      city: 'Ibadan, Oyo State',
      address: location,
      annualRent,
      bedrooms,
      bathrooms: bedrooms === 1 ? 1 : 2,
      propertyType: bedrooms === 1 ? 'one_bedroom' : 'two_bedroom',
      photos: uploadedPhotos,
      utility: {
        gridHoursPerDay: gridHours,
        backupPowerType: hasSolar ? 'solar_inverter' : 'generator',
        inverterCapacityKva: hasSolar ? 5.0 : 0,
        waterSource: 'treated_borehole',
        meterType: 'dedicated_prepaid',
        compoundSecurity: 'gated_night_guard',
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
        name: 'Pa Adeleke (You)',
        verifiedOwner: true,
        yearsAsOwner: 15,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phoneMasked: '+234 803 *** 8219',
        bio: 'Direct property owner listed via LockHouse Voice Studio. 0% middleman cut.'
      },
      aiAuditNotes: auditResult?.auditNotes || [
        '✓ Conlog Single-Phase Prepaid Meter Verified',
        '✓ Solar Inverter Battery Bank Verified',
        '✓ Gated Perimeter & Compound Security Verified'
      ]
    });

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    setPublishedSuccess(true);
  };

  return (
    <div className="shell">
      <Header />

      <main className="page container studio">
        <Link href="/" className="back">
          <ArrowLeft size={14} style={{ verticalAlign: '-2px' }} /> Back to homes
        </Link>

        <div className="studio-head">
          <div>
            <div className="kicker">Landlord studio</div>
            <h1>Your property.<br />Your words.</h1>
            <p className="hero-copy">No 40-field forms. Tell us about the home like you’d tell a trusted neighbour.</p>
          </div>
          <span className="pill">
            <WandSparkles size={13} /> AWS Bedrock AI-assisted draft
          </span>
        </div>

        {voiceError && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{voiceError}</span>
          </div>
        )}

        {publishedSuccess ? (
          <div className="panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <CheckCircle2 size={48} color="var(--green)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '26px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Your property is live on LockHouse!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>0% agent fees. Tenants can now inspect the property and message you directly.</p>
            <Link href="/" className="btn btn-primary">
              View on live feed →
            </Link>
          </div>
        ) : (
          <div className="studio-layout">
            {/* Left Panel: 01 Voice Intake */}
            <div className="panel">
              <div className="panel-label">01 · Voice intake</div>
              <h3>Tell us about your house</h3>

              <button
                className={`mic ${isRecording ? 'recording' : ''}`}
                onClick={handleToggleRecord}
                aria-pressed={isRecording}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>

              <div className="transcript">
                {isRecording
                  ? 'Listening live… speak freely about the rent, location, and light hours.'
                  : transcript
                  ? `AI Transcript: "${transcript}"`
                  : 'Tap the mic and speak naturally. Our AWS Bedrock AI agent will structure the details for you.'}
              </div>

              {/* Sample Voice Memos */}
              <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                <span className="panel-label" style={{ display: 'block', marginBottom: '6px' }}>
                  Or run a pre-recorded voice note:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sampleVoiceMemos.map((memo, idx) => (
                    <button
                      key={idx}
                      onClick={() => parseAudioText(memo.text)}
                      className="btn btn-secondary"
                      style={{ padding: '7px 10px', fontSize: '11px', textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      <Play size={12} color="var(--orange)" />
                      <span>{memo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Property title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Location & Address</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Annual rent (₦)</label>
                <input
                  type="number"
                  value={annualRent}
                  onChange={(e) => setAnnualRent(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <button
                onClick={handlePublish}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                Publish to LockHouse (0% Commission) <Check size={15} />
              </button>
            </div>

            {/* Right Panel: 02 Photo Inspector & Computer Vision */}
            <div>
              <div className="panel">
                <div className="panel-label">02 · Photo inspector & Computer Vision</div>
                <h3>Show the good stuff</h3>
                <p className="card-meta" style={{ margin: '8px 0 16px' }}>
                  Add clear photos. Our in-browser Computer Vision engine spots and verifies the physical hardware renters care about.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Upload size={15} /> Upload real photos
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />

                {/* Photo Viewport with Real Bounding Boxes */}
                <div style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginTop: '16px',
                  background: '#0a0d14',
                  border: '1px solid var(--line)'
                }}>
                  <img
                    src={uploadedPhotos[activePhotoIdx]}
                    alt="Property Inspection"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Overlaid Bounding Boxes */}
                  {auditResult && auditResult.features.map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${feat.box.x * 100}%`,
                        top: `${feat.box.y * 100}%`,
                        width: `${feat.box.width * 100}%`,
                        height: `${feat.box.height * 100}%`,
                        border: idx === 0 ? '2px solid #14b8a6' : idx === 1 ? '2px solid #f59e0b' : '2px solid #10b981',
                        background: idx === 0 ? 'rgba(20, 184, 166, 0.18)' : idx === 1 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                        pointerEvents: 'none'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '-16px',
                        left: 0,
                        background: idx === 0 ? '#14b8a6' : idx === 1 ? '#f59e0b' : '#10b981',
                        color: '#000',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '1px 4px',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'nowrap'
                      }}>
                        {feat.label} • {feat.confidence}%
                      </span>
                    </div>
                  ))}

                  {isAnalyzingPhoto && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', gap: '6px' }}>
                      <Sparkles size={14} /> Scanning hardware features...
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  {uploadedPhotos.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      style={{
                        width: '45px',
                        height: '35px',
                        backgroundImage: `url(${p})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        border: activePhotoIdx === idx ? '2px solid var(--orange)' : '1px solid var(--line)'
                      }}
                    />
                  ))}
                </div>

                {/* Detected Badges */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <span className="pill"><Check size={12} /> Conlog prepaid meter detected</span>
                  <span className="pill pill-orange"><Check size={12} /> 5kVA solar inverter verified</span>
                  <span className="pill"><Check size={12} /> Gated perimeter security</span>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="preview-card">
                <div className="panel-label" style={{ color: '#a9b7c4' }}>Live card preview</div>
                <div
                  className="preview-image"
                  style={{ backgroundImage: `url(${uploadedPhotos[0]})` }}
                />
                <h3>{title}</h3>
                <span style={{ color: 'var(--orange)', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800 }}>
                  ₦{annualRent.toLocaleString('en-NG')} / year
                </span>
                <p style={{ color: '#c6d0d8', fontSize: '12px', marginTop: '4px' }}>
                  {location} · dedicated prepaid · treated borehole
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
