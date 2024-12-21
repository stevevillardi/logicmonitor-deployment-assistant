import { Config, Site } from '../types/types';
import { defaultMethodWeights, defaultDeviceTypes, collectorCapacities } from './constants';

export const getInitialConfig = (): Config => {
    const savedConfig = typeof window !== 'undefined' ? localStorage.getItem('collectorConfig') : null;
    const defaultConfig = {
        deploymentName: '',
        methodWeights: { ...defaultMethodWeights },
        maxLoad: 85,
        enablePollingFailover: true,
        enableLogsFailover: false,
        deviceDefaults: { ...defaultDeviceTypes },
        collectorCapacities: { ...collectorCapacities },
        showAdvancedSettings: false,
        showDetails: false,
        collectorCalcMethod: 'auto' as 'auto' | 'XXL' | 'XL' | 'LARGE' | 'MEDIUM' | 'SMALL'
    };

    if (!savedConfig) return defaultConfig;

    const parsedConfig = JSON.parse(savedConfig);
    return {
        ...defaultConfig,
        ...parsedConfig
    };
};

export const getInitialSites = (): Site[] => {
    const savedSites = typeof window !== 'undefined' ? localStorage.getItem('collectorSites') : null;
    return savedSites ? JSON.parse(savedSites) : [{
        name: "",
        devices: Object.fromEntries(
            Object.entries(defaultDeviceTypes).map(([type, data]) => [
                type,
                { ...data, count: 0 },
            ])
        ),
        logs: {
            netflow: 0,
            syslog: 0,
            traps: 0,
        },
    }];
}; 