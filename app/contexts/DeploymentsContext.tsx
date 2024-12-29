import { createContext, useContext, ReactNode } from 'react';
import { Deployment, useDeployments } from '../hooks/useDeployments';
import { Config, Site } from '../components/DeploymentAssistant/types/types';
import { defaultDeviceTypes } from '../components/DeploymentAssistant/utils/constants';

export type { Deployment };

type DeviceDefaults = typeof defaultDeviceTypes;
type DeviceType = keyof DeviceDefaults;

interface DeploymentsContextType {
  deployments: Deployment[];
  isLoading: boolean;
  saveDeployment: (name: string, config: Config, sites: Site[]) => Promise<any>;
  updateDeployment: (id: string, name: string, config: Config, sites: Site[]) => Promise<void>;
  deleteDeployment: (id: string) => Promise<void>;
  fetchDeployments: () => Promise<void>;
  reorderDevices: (sites: Site[], deviceDefaults: Record<string, any>) => Site[];
}

const DeploymentsContext = createContext<DeploymentsContextType | undefined>(undefined);

export function DeploymentsProvider({ children }: { children: ReactNode }) {
  const deploymentsData = useDeployments();

  const reorderDevices = (sites: Site[], deviceDefaults: Record<string, any>) => {
    const orderedDeviceTypes = Object.keys(defaultDeviceTypes) as DeviceType[];

    return sites.map(site => {
      const orderedDevices: Record<DeviceType, any> = {} as Record<DeviceType, any>;
      
      orderedDeviceTypes.forEach(deviceType => {
        orderedDevices[deviceType] = {
          ...defaultDeviceTypes[deviceType],
          ...deviceDefaults[deviceType],
          ...site.devices[deviceType],
          count: site.devices[deviceType]?.count || 0,
          additional_count: site.devices[deviceType]?.additional_count || 0,
          methods: site.devices[deviceType]?.methods || 
                  deviceDefaults[deviceType]?.methods || 
                  defaultDeviceTypes[deviceType].methods || {}
        };
      });

      return { ...site, devices: orderedDevices };
    });
  };

  return (
    <DeploymentsContext.Provider value={{ ...deploymentsData, reorderDevices }}>
      {children}
    </DeploymentsContext.Provider>
  );
}

export function useDeploymentsContext() {
  const context = useContext(DeploymentsContext);
  if (context === undefined) {
    throw new Error('useDeploymentsContext must be used within a DeploymentsProvider');
  }
  return context;
} 