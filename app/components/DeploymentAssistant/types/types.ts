// Define all interfaces and types
export interface DeviceType {
    count: number;
    instances: number;
    methods: Record<string, number>;
    icon?: string;
    additional_count?: number;
}

export interface Site {
    name: string;
    devices: Record<string, DeviceType>;
    logs: {
        netflow: {
            fps: number;
            collectors: Array<{
                size: string;
                type: string;
                load: number;
            }>;
        };
        events: {  // Combined syslog and traps
            eps: number;
            collectors: Array<{
                size: string;
                type: string;
                load: number;
            }>;
        };
        devices: {
            firewalls: number;
            network: number;
            linux: number;
            storage: number;
            windows: number;
            loadbalancers: number;
            vcenter: number;
            iis: number;
            accesspoints: number;
            snmptraps: number;
            netflowdevices: number;
        };
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
    collectorCalcMethod: 'auto' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'XL' | 'XXL';
}

export interface CollectorCapacity {
    weight: number;
    eps: number;
    fps: number;  // Add FPS capacity
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

export interface LogsLoad {
    events: number;
    netflow: number;
}

export interface ComputeRequirementsProps {
    collectorsBySize: {
        polling: Record<string, number>;
        logs: Record<string, number>;
        netflow: Record<string, number>;
    };
    totalLogsLoad: LogsLoad;
    className?: string;
    enablePollingFailover?: boolean;
    enableLogsFailover?: boolean;
    forceLightMode?: boolean;
}