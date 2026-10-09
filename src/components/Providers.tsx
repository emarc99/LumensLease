'use client';

import React from 'react';
import { PropertyProvider } from '../context/PropertyContext';
import { WalletProvider } from '../context/WalletContext';
import TenancyAgreementModal from './TenancyAgreementModal';
import SorobanTelemetryModal from './SorobanTelemetryModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <PropertyProvider>
        {children}
        <TenancyAgreementModal />
        <SorobanTelemetryModal />
      </PropertyProvider>
    </WalletProvider>
  );
}
