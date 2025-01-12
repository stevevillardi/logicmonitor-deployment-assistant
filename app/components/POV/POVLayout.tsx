'use client'

import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import POVHeader from './POVHeader';
import POVSidebar from './POVSidebar';
import POVOverview from './POVOverview';
import KeyBusinessServices from './KeyBusinessServices/KeyBusinessServices';
import Challenges from './Challenges/Challenges';
import DecisionCriteria from './DecisionCriteria/DecisionCriteria';
import WorkingSessions from './WorkingSessions/WorkingSessions';
import Team from './Team/Team';
import DeviceScope from './DeviceScope/DeviceScope';
import POVForm from './POVForm';
import POVDetailsForm from './POVDetailsForm';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { usePermissions } from '@/app/hooks/usePermissions';

interface POVLayoutProps {
  children?: React.ReactNode;
}

export default function POVLayout({ children }: POVLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const povId = params.id as string;
  const { fetchPOV } = usePOVOperations();
  const isNewPOV = pathname === '/pov/new';
  const { hasPermission, hasAnyPermission } = usePermissions();

  useEffect(() => {
    if (!isNewPOV && povId) {
      fetchPOV(povId);
    }
  }, [povId, isNewPOV]);

  const canAccessAdvancedFeatures = hasAnyPermission([
    { action: 'manage', resource: 'working_sessions' },
    { action: 'manage', resource: 'device_scope' }
  ]);

  const renderContent = () => {
    if (children) return children;
    if (isNewPOV) return <POVForm />;

    const path = pathname.split('/').pop();
    
    switch (path) {
      case povId:
        return <POVOverview />;
      case 'details':
        return <POVDetailsForm />;
      case 'key-business-services':
        return <KeyBusinessServices />;
      case 'challenges':
        return <Challenges />;
      case 'decision-criteria':
        return <DecisionCriteria />;
      case 'working-sessions':
        return <WorkingSessions />;
      case 'team':
        return <Team />;
      case 'device-scope':
        return <DeviceScope />;
      default:
        return <POVOverview />;
    }
  };

  return (
    <div className="flex h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#040F4B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '500px',
            width: '90%',
            padding: '16px',
          },
          success: {
            style: {
              background: '#042f2e',
              border: '1px solid #0f766e',
              maxWidth: '500px',
              width: '90%',
              padding: '16px',
            },
            iconTheme: {
              primary: '#2dd4bf',
              secondary: '#042f2e',
            },
          },
          error: {
            style: {
              background: '#78350f',
              border: '1px solid #92400e',
              maxWidth: '500px',
              width: '90%',
              padding: '16px',
            },
            iconTheme: {
              primary: '#fbbf24',
              secondary: '#78350f',
            },
          },
        }}
      />
      <POVSidebar isNewPOV={isNewPOV} />
      <div className="flex-1 overflow-auto">
        <POVHeader />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 