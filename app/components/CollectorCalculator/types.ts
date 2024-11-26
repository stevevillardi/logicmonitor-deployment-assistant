// Define all interfaces and types
export interface DeviceType {
    count: number;
    instances: number;
    methods: Record<string, number>;
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
    showAdvancedSettings: boolean;
}

export interface CollectorCapacity {
    weight: number;
    eps: number;
}
