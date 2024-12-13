'use client';

import dynamic from 'next/dynamic';
import { Footer } from './components/CollectorCalculator/components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CollectorCalculator from './components/CollectorCalculator/CollectorCalculator';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#040F4B] flex flex-col">
        <main className="flex-grow py-4 sm:p-8">
          <CollectorCalculator />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}