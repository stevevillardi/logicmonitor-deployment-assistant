'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import POVOverview from "./POVOverview";
import Team from "./Team/Team";
import KeyBusinessServices from "./KeyBusinessServices/KeyBusinessServices";
import DeviceScope from "./DeviceScope/DeviceScope";
import WorkingSessions from "./WorkingSessions/WorkingSessions";
import { usePOV } from "@/app/contexts/POVContext";
import { AlertCircle } from 'lucide-react';

export default function POVTabs() {
  const { state } = usePOV();
  
  const getValidationStatus = (tabName: string) => {
    switch (tabName) {
      case 'team':
        return state.teamMembers.length === 0;
      case 'business-services':
        return state.keyBusinessServices.length === 0;
      case 'device-scope':
        return state.deviceScopes.length === 0;
      case 'working-sessions':
        return state.workingSessions.length === 0;
      default:
        return false;
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          Team
          {getValidationStatus('team') && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </TabsTrigger>
        <TabsTrigger value="business-services" className="flex items-center gap-2">
          Business Services
          {getValidationStatus('business-services') && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </TabsTrigger>
        <TabsTrigger value="device-scope" className="flex items-center gap-2">
          Device Scope
          {getValidationStatus('device-scope') && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </TabsTrigger>
        <TabsTrigger value="working-sessions" className="flex items-center gap-2">
          Working Sessions
          {getValidationStatus('working-sessions') && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <POVOverview />
      </TabsContent>

      <TabsContent value="team" className="mt-0">
        <Team />
      </TabsContent>

      <TabsContent value="business-services" className="mt-0">
        <KeyBusinessServices />
      </TabsContent>

      <TabsContent value="device-scope" className="mt-0">
        <DeviceScope />
      </TabsContent>

      <TabsContent value="working-sessions" className="mt-0">
        <WorkingSessions />
      </TabsContent>
    </Tabs>
  );
} 