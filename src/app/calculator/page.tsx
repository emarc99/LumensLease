'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import SavingsCalculator from '../../components/SavingsCalculator';

export default function CalculatorPage() {
  return (
    <div className="shell">
      <Header />

      <main className="page container">
        <Link href="/" className="back">
          <ArrowLeft size={14} style={{ verticalAlign: '-2px' }} /> Back to homes
        </Link>

        <div style={{ marginTop: '20px' }}>
          <SavingsCalculator />
        </div>
      </main>
    </div>
  );
}
