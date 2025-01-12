'use client';

import ProtectedRoute from '@/app/components/Shared/ProtectedRoute';
import DeploymentAssistant from '../components/DeploymentAssistant/DeploymentAssistant';
import { Footer } from '../components/Shared/Footer';
export default function POVPage() {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredPermission={{ action: 'view', resource: 'pov' }}
    >
      <div className="min-h-screen bg-[#040F4B] flex flex-col">
        <main className="flex-grow py-4 sm:p-8">
          <DeploymentAssistant />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}