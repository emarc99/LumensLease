'use client';

import React from 'react';
import { PropertyProvider } from '../context/PropertyContext';
import TenancyAgreementModal from './TenancyAgreementModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PropertyProvider>
      {children}
      <TenancyAgreementModal />
    </PropertyProvider>
  );
}
