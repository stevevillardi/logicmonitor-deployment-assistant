'use client'

import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
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

interface POVLayoutProps {
  children?: React.ReactNode;
}

export default function POVLayout({ children }: POVLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const povId = params.id as string;
  const { fetchPOV } = usePOVOperations();
  const isNewPOV = pathname === '/pov/new';

  useEffect(() => {
    if (!isNewPOV && povId) {
      fetchPOV(povId);
    }
  }, [povId, isNewPOV]);

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