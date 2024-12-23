'use client';

import { Footer } from './components/Shared/Footer';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import DeploymentAssistant from './components/DeploymentAssistant/DeploymentAssistant';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#040F4B] dark:bg-gray-950 flex flex-col">
        <main className="flex-grow py-4 sm:p-8">
          <DeploymentAssistant />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}