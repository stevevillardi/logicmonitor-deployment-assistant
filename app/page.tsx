'use client';

import DeploymentAssistant from './components/DeploymentAssistant/DeploymentAssistant';
import { Footer } from './components/Shared/Footer';
import ProtectedRoute from './components/Shared/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#040F4B] flex flex-col">
        <main className="flex-grow py-4 sm:p-8">
          <DeploymentAssistant />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}