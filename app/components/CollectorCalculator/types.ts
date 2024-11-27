// Define all interfaces and types
export interface DeviceType {
    count: number;
    instances: number;
    methods: Record<string, number>;
    icon?: React.ElementType;
}

export interface Site {
    name: string;
    devices: Record<string, DeviceType>;
    logs: {
        netflow: number;
        syslog: number;
        traps: number;
    };
}

export interface Config {
    deploymentName: string;
    methodWeights: Record<string, number>;
    maxLoad: number;
    enablePollingFailover: boolean;
    enableLogsFailover: boolean;
    deviceDefaults: Record<string, DeviceType>;
    collectorCapacities: Record<string, CollectorCapacity>;
    showDetails: boolean;
    showAdvancedSettings: boolean;
}

export interface CollectorCapacity {
    weight: number;
    eps: number;
}

export interface VideoGuideData {
    title: string;
    description: string;
    videoId?: string;
    videoUrl?: string;
    duration?: string;
}

export interface DeviceProperty {
    name: string;
    description: string;
    required: boolean;
    prop_name?: string;
}

export interface Permission {
    name: string;
    description: string;
    type: 'windows' | 'linux' | 'network' | 'api' | 'cloud' | 'container' | 'database';
}

export type OnboardingMethod = 'wizard' | 'csv' | 'netscan' | 'api';

export interface Technology {
    id: string;
    name: string;
    description: string;
    category: 'Network' | 'Container' | 'Server' | 'Storage' | 'Cloud' | 'Database' | 'Virtualization' | 'Security' | 'Application';
    icon?: React.ElementType;
    properties: DeviceProperty[];
    permissions: Permission[];
    recommendedOnboarding: OnboardingMethod[];
    documentationUrl: string;
    tags?: string[];
}