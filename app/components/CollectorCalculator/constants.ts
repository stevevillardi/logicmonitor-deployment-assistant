// Constants
export const defaultDeviceTypes = {
    "Linux Servers": {
        count: 0,
        instances: 98,
        methods: { SNMPv3: 0.6, Script: 0.4 }
    },
    "SQL Servers (Linux)": {
        count: 0,
        instances: 108,
        methods: { JDBC: 0.75, Script: 0.25 }
    },
    "Windows Servers": {
        count: 0,
        instances: 120,
        methods: { WMI: 0.2, Script: 0.75, JMX: 0.05 }
    },
    "SQL Servers (Windows)": {
        count: 0,
        instances: 156,
        methods: { Script: 0.8, WMI: 0.2 }
    },
    Routers: { count: 0, instances: 92, methods: { Script: 0.55, SNMPv3: 0.45 }},
    Switches: { count: 0, instances: 120, methods: { SNMPv2: 0.55, SNMPv3: 0.45 }},
    Firewalls: {
        count: 0,
        instances: 272,
        methods: { Script: 0.51, SNMPv3: 0.48, HTTP: 0.01 }
    },
    "Load Balancers": {
        count: 0,
        instances: 125,
        methods: { Script: 0.68, HTTP: 0.01, SNMPv3: 0.31 }
    },
    "Wireless LAN Controllers": {
        count: 0,
        instances: 125,
        methods: { Script: 0.62, SNMPv3: 0.38 }
    },
    "SD-WAN Edges": { count: 0, instances: 119, methods: { Script: 0.96, SNMPv3: 0.02, HTTP: 0.02 } },
    "Access Points": { count: 0, instances: 15, methods: { Script: 0.8, SNMPv3: 0.2 } },
    "Nimble Storage Arrays": {
        count: 0,
        instances: 111,
        methods: { Script: 1 }
    },
    "Netapp Storage Arrays": {
        count: 0,
        instances: 945,
        methods: { Script: 0.95, SNMPv3: 0.05 }
    },
    "Other Storage Arrays": {
        count: 0,
        instances: 150,
        methods: { Script: 0.5, SNMPv3: 0.5 }
    },
    "Hypervisor Hosts (ESXi, Hyper-V)": {
        count: 0,
        instances: 172,
        methods: { Script: 0.98, HTTP: 0.02 }
    },
    "iLO/DRAC Servers": {
        count: 0,
        instances: 98,
        methods: { Script: 0.06, HTTP: 0.03, SNMPv3: 0.91 }
    },
    "Cisco UCS/FI Servers": {
        count: 0,
        instances: 274,
        methods: { Script: 0.99, HTTP: 0.01 }
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
    XXL: { weight: 285500, eps: 52817 },
    XL: { weight: 165950, eps: 37418 },
    LARGE: { weight: 104714, eps: 23166 },
    MEDIUM: { weight: 48557, eps: 13797 },
    SMALL: { weight: 21286, eps: 7800 },
};
