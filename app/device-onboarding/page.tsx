import { memo } from 'react';
import CollectorCalculator from '../components/CollectorCalculator/CollectorCalculator';
import { Footer } from '../components/CollectorCalculator/components/Footer';

const DeviceOnboardingPage = memo(function DeviceOnboardingPage() {
  return (
    <div className="min-h-screen bg-[#040F4B] flex flex-col">
      <main className="flex-grow py-4 sm:p-8">
        <CollectorCalculator />
      </main>
      <Footer />
    </div>
  );
});

export default DeviceOnboardingPage;