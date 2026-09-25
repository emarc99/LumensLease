'use client';

import React from 'react';
import { PropertyProvider } from '../context/PropertyContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PropertyProvider>{children}</PropertyProvider>;
}
