import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseBrowser } from '../lib/supabase';
import { Config, Site } from '../components/DeploymentAssistant/types/types';
import { useAuth } from './useAuth';
import { defaultDeviceTypes } from '../components/DeploymentAssistant/utils/constants';

export interface Deployment {
  id: string;
  name: string;
  config: Config;
  sites: Site[];
  created_at: string;
  updated_at: string;
}

// Add type for device defaults
type DeviceDefaults = typeof defaultDeviceTypes;
type DeviceType = keyof DeviceDefaults;

export function useDeployments(autoFetch: boolean = false) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start as false since we're not auto-fetching
  const isMounted = useRef(false);
  const fetchingRef = useRef(false);
  const dataFetchedRef = useRef(false);
  const { user } = useAuth();
  const supabase = supabaseBrowser;

  const fetchDeployments = useCallback(async () => {
    if (fetchingRef.current || dataFetchedRef.current) return;
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDeployments(data || []);
      dataFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Only fetch on mount if autoFetch is true
    if (autoFetch && !isMounted.current) {
      isMounted.current = true;
      fetchDeployments();
    }
    
    return () => {
      isMounted.current = false;
      fetchingRef.current = false;
    };
  }, [fetchDeployments, autoFetch]);

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

  const saveDeployment = async (name: string, config: Config, sites: Site[]) => {
    try {
      const orderedSites = reorderDevices(sites, config.deviceDefaults);

      const { data, error } = await supabase
        .from('deployments')
        .insert({
          name,
          config,
          sites: orderedSites,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setDeployments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving deployment:', error);
      throw error;
    }
  };

  const updateDeployment = async (id: string, name: string, config: Config, sites: Site[]) => {
    try {
      const { error } = await supabase
        .from('deployments')
        .update({
          name,
          config,
          sites,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setDeployments(prev => 
        prev.map(d => d.id === id 
          ? { ...d, name, config, sites, updated_at: new Date().toISOString() }
          : d
        )
      );
    } catch (error) {
      console.error('Error updating deployment:', error);
      throw error;
    }
  };

  const deleteDeployment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deployments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDeployments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting deployment:', error);
      throw error;
    }
  };

  return {
    deployments,
    isLoading,
    saveDeployment,
    updateDeployment,
    deleteDeployment,
    fetchDeployments // Expose this so components can trigger fetch when needed
  };
} 