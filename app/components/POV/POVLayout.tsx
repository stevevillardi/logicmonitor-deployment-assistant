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
import { usePOV } from '@/app/contexts/POVContext';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import POVForm from './POVForm';

interface POVLayoutProps {
  children?: React.ReactNode;
}

export default function POVLayout({ children }: POVLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const povId = params.id as string;
  const { dispatch } = usePOV();
  const isNewPOV = pathname === '/pov/new';

  useEffect(() => {
    const fetchPOVData = async () => {
      if (isNewPOV) return;

      try {
        const { data: pov, error } = await supabaseBrowser
          .from('pov')
          .select(`
            *,
            key_business_services:pov_key_business_services(*),
            challenges:pov_challenges(*),
            team_members:pov_team_members(*)
          `)
          .eq('id', povId)
          .single();

        if (error) throw error;

        if (pov) {
          dispatch({ type: 'SET_POV', payload: pov });
          dispatch({ type: 'SET_BUSINESS_SERVICES', payload: pov.key_business_services || [] });
          dispatch({ type: 'SET_CHALLENGES', payload: pov.challenges || [] });
          dispatch({ type: 'SET_TEAM_MEMBERS', payload: pov.team_members || [] });
        }
      } catch (error) {
        console.error('Error fetching POV:', error);
      }
    };

    if (povId) {
      fetchPOVData();
    }
  }, [povId, dispatch, isNewPOV]);

  const renderContent = () => {
    if (children) return children;
    if (isNewPOV) return <POVForm />;

    const path = pathname.split('/').pop();
    
    switch (path) {
      case povId:
        return <POVOverview />;
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