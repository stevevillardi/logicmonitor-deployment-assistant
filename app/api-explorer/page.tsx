'use client';
import { memo } from 'react';
import CollectorCalculator from '../components/CollectorCalculator/CollectorCalculator';
import { Footer } from '../components/CollectorCalculator/components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';

const ApiExplorerPage = memo(function ApiExplorerPage() {
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
});

export default ApiExplorerPage;