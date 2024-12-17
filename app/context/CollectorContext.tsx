// app/context/CollectorContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Config, Site } from '../components/DeploymentAssistant/types/types';
import { defaultMethodWeights, defaultDeviceTypes, collectorCapacities } from '../components/DeploymentAssistant/utils/constants';

interface CollectorContextType {
    config: Config;
    sites: Site[];
    expandedSites: Set<number>;
    setConfig: (config: Config) => void;
    setSites: (sites: Site[]) => void;
    setExpandedSites: (sites: Set<number>) => void;
    handleConfigUpdate: (newConfig: Config) => void;
    handleSitesUpdate: (newSites: Site[]) => void;
}

const CollectorContext = createContext<CollectorContextType | undefined>(undefined);

export function CollectorProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<Config>({
        deploymentName: 'New Deployment',
        methodWeights: { ...defaultMethodWeights },
        maxLoad: 85,
        enablePollingFailover: true,
        enableLogsFailover: false,
        deviceDefaults: { ...defaultDeviceTypes },
        collectorCapacities: { ...collectorCapacities },
        showAdvancedSettings: false,
        showDetails: false,
    });

    const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set());

    const [sites, setSites] = useState<Site[]>([
        {
            name: "Site 1",
            devices: Object.fromEntries(
                Object.entries(config.deviceDefaults).map(([type, data]) => [
                    type,
                    { ...data, count: 0 },
                ])
            ),
            logs: {
                netflow: 0,
                syslog: 0,
                traps: 0,
            },
        },
    ]);

    const handleConfigUpdate = useCallback((newConfig: Config) => {
        setConfig(newConfig);
        setSites(prevSites => prevSites.map(site => ({
            ...site,
            devices: Object.fromEntries(
                Object.entries(newConfig.deviceDefaults).map(([type, data]) => [
                    type,
                    {
                        ...data,
                        count: site.devices[type]?.count || 0
                    }
                ])
            )
        })));
    }, []);

    const handleSitesUpdate = useCallback((newSites: Site[]) => {
        setSites(newSites);
    }, []);

    return (
        <CollectorContext.Provider value={{
            config,
            sites,
            expandedSites,
            setConfig,
            setSites,
            setExpandedSites,
            handleConfigUpdate,
            handleSitesUpdate,
        }}>
            {children}
        </CollectorContext.Provider>
    );
}

export function useCollector() {
    const context = useContext(CollectorContext);
    if (context === undefined) {
        throw new Error('useCollector must be used within a CollectorProvider');
    }
    return context;
}