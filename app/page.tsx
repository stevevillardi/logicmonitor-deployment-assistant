'use client';

import dynamic from 'next/dynamic';
import { Footer } from './components/CollectorCalculator/components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/next";

const CollectorCalculator = dynamic(() => import('./components/CollectorCalculator/CollectorCalculator'), { 
  ssr: false,
  loading: () => (
    <div className="flex-grow p-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Area */}
        <div className="flex justify-between items-center mb-8">
          <div className="animate-pulse h-8 bg-gray-200 rounded-lg w-64"></div>
          <div className="flex gap-4">
            <div className="animate-pulse h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="animate-pulse h-10 bg-gray-200 rounded-lg w-32"></div>
          </div>
        </div>

        {/* Main Card Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Tab-like buttons */}
          <div className="flex gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-8 bg-gray-200 rounded-lg w-32"></div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mb-8">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse h-10 bg-gray-200 rounded-lg w-40"></div>
            ))}
          </div>

          {/* Content Cards */}
          <div className="grid gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="animate-pulse h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#040F4B] flex flex-col">
      <main className="flex-grow p-8">
        <SpeedInsights />
        <CollectorCalculator />
      </main>
      <Footer />
    </div>
  );
}
