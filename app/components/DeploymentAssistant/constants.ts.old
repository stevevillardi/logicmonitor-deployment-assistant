// Constants
export const defaultDeviceTypes = {
    "Linux Servers": {
        count: 0,
        instances: 75,
        methods: { SNMPv3: 0.5, Script: 0.5 }
    },
    "SQL Servers (Linux)": {
        count: 0,
        instances: 80,
        methods: { JDBC: 0.75, Script: 0.25 }
    },
    "Windows Servers": {
        count: 0,
        instances: 75,
        methods: { WMI: 0.5, Script: 0.5 }
    },
    "SQL Servers (Windows)": {
        count: 0,
        instances: 80,
        methods: { Script: 0.25, JDBC: 0.25, WMI: 0.5 }
    },
    Routers: { count: 0, instances: 120, methods: { SNMPv2: 0.5, SNMPv3: 0.5 }},
    Switches: { count: 0, instances: 120, methods: { SNMPv2: 0.5, SNMPv3: 0.5  }},
    Firewalls: {
        count: 0,
        instances: 120,
        methods: { Script: 0.5, SNMPv2: 0.25, SNMPv3: 0.25 }
    },
    "SD-WAN Edges": { count: 0, instances: 15, methods: { Script: 1 } },
    "Access Points": { count: 0, instances: 10, methods: { Script: 1 } },
    "Storage Arrays": {
        count: 0,
        instances: 150,
        methods: { SNMPv2: 0.5, Script: 0.5 }
    },
    "Hypervisor Hosts (ESXi, Hyper-V)": {
        count: 0,
        instances: 18,
        methods: { Script: 1 }
    },
};

export const defaultPlatformTypes = {
    "VMware vSphere": {
        "Virtual Machines": {
            count: 0,
            instances: 18,
            methods: { Script: 1 }
        },
        "vCenter Servers": {
            count: 0,
            instances: 0,
            methods: { Script: 0 }
        }
    }
};

export const defaultMethodWeights = {
    SNMPv2: 1,
    HTTP: 1.1,
    JMX: 1.2,
    SNMPv3: 1.3,
    WMI: 2.2,
    WinRM: 2.2,
    JDBC: 1.5,
    Perfmon: 3,
    Script: 5,
};

export const collectorCapacities = {
    XXL: { weight: 100000, eps: 52817 },
    XL: { weight: 35000, eps: 37418 },
    LARGE: { weight: 25000, eps: 23166 },
    MEDIUM: { weight: 12500, eps: 13797 },
    SMALL: { weight: 10000, eps: 7800 },
};
