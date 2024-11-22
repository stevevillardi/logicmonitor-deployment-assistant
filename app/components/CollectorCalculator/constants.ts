// Constants
export const defaultDeviceTypes = {
    "Linux Servers": {
        count: 0,
        instances: 75,
        methods: { snmpv3: 0.5, script: 0.5 },
    },
    "SQL Servers (Linux)": {
        count: 0,
        instances: 5,
        methods: { jdbc: 0.75, script: 0.25 },
    },
    "Windows Servers": {
        count: 0,
        instances: 75,
        methods: { wmi: 0.5, script: 0.5 },
    },
    "SQL Servers (Windows)": {
        count: 0,
        instances: 5,
        methods: { script: 0.25, jdbc: 0.25, wmi: 0.5 },
    },
    Routers: { count: 0, instances: 120, methods: { snmpv2: 0.5, snmpv3: 0.5 } },
    Switches: { count: 0, instances: 120, methods: { snmpv2: 0.5, snmpv3: 0.5 } },
    Firewalls: {
        count: 0,
        instances: 120,
        methods: { script: 0.5, snmpv2: 0.25, snmpv3: 0.25 },
    },
    "SD-WAN Edges": { count: 0, instances: 15, methods: { script: 1 } },
    "Access Points": { count: 0, instances: 10, methods: { script: 1 } },
    "Storage Arrays": {
        count: 0,
        instances: 150,
        methods: { snmpv2: 0.5, script: 0.5 },
    },
    "vCenter VMs": { count: 0, instances: 18, methods: { script: 1 } },
    "ESXi Hosts": {
        count: 0,
        instances: 18,
        methods: { script: 1 },
    },
};

export const defaultMethodWeights = {
    snmpv2: 0.8,
    snmpv3: 1,
    wmi: 2,
    winrm: 2,
    jdbc: 1.5,
    script: 5,
};

export const collectorCapacities = {
    XXL: { weight: 100000, eps: 52817 },
    XL: { weight: 35000, eps: 37418 },
    LARGE: { weight: 25000, eps: 23166 },
    MEDIUM: { weight: 12500, eps: 13797 },
    SMALL: { weight: 10000, eps: 7800 },
};
