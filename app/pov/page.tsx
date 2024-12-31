'use client';
import { memo } from 'react';
import DeploymentAssistant from '../components/DeploymentAssistant/DeploymentAssistant';
import { Footer } from '../components/Shared/Footer';
import ProtectedRoute from '../components/Shared/ProtectedRoute';
import { useAuth } from '@/app/hooks/useAuth';

const POVPage = memo(function POVPage() {
  const { isAuthorized } = useAuth();
  return (
  <ProtectedRoute requireAuth={true} requireDomain={true}>
      <div className="min-h-screen bg-[#040F4B] flex flex-col">
        <main className="flex-grow py-4 sm:p-8">
        <DeploymentAssistant />
      </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
});


export default POVPage;