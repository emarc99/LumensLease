'use client';

import React from 'react';
import { useProperty } from '../context/PropertyContext';
import Navbar from '../components/Navbar';
import HeroSearch from '../components/HeroSearch';
import PropertyGrid from '../components/PropertyGrid';
import PropertyDetailModal from '../components/PropertyDetailModal';
import LandlordVoiceStudio from '../components/LandlordVoiceStudio';
import DirectChatModal from '../components/DirectChatModal';
import TenancyAgreementModal from '../components/TenancyAgreementModal';
import SavingsCalculator from '../components/SavingsCalculator';
import { ShieldCheck, Heart, Zap, Globe } from 'lucide-react';

export default function Home() {
  const { activeView, awsConnection } = useProperty();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1 }}>
        {activeView === 'feed' && (
          <>
            <HeroSearch />
            <PropertyGrid />
          </>
        )}

        {activeView === 'landlord_studio' && (
          <LandlordVoiceStudio />
        )}

        {activeView === 'savings_calculator' && (
          <SavingsCalculator />
        )}
      </div>

      {/* Global Interactive Modals */}
      <PropertyDetailModal />
      <DirectChatModal />
      <TenancyAgreementModal />

      {/* Footer */}
      <footer style={{
        background: '#090d14',
        borderTop: '2px solid var(--border-bold)',
        padding: '36px 24px 48px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--amber-primary)' }}>
                LOCKHOUSE
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                // Autonomous Direct-to-Landlord Rental Intelligence
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="retro-badge badge-solar">
                #STARTUPS LANE
              </span>
              <span className="retro-badge badge-meter">
                #COMMERCIAL-POTENTIAL
              </span>
              <span className="retro-badge badge-zero-cut">
                #DAILY-LIFE-ENHANCEMENT
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            <div>
              Built for <strong style={{ color: 'var(--amber-light)' }}>AWS Zero to Shipped Hackathon 2026</strong>. Powered by AWS Bedrock & CloudFront.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>AWS Console Connected • Region: <strong>{awsConnection.region}</strong> • Account: <strong>{awsConnection.accountId}</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
