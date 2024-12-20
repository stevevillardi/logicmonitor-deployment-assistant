// Constants
export const defaultDeviceTypes = {
    "Linux Servers": {
        count: 0,
        instances: 100,
        methods: { SNMPv3: 0.8, Script: 0.2 },
        icon: "Server"
    },
    "Windows Servers": {
        count: 0,
        instances: 120,
        methods: { WMI: 0.2, Script: 0.75, JMX: 0.05 },
        icon: "Server"
    },
    "SQL Servers": {
        count: 0,
        instances: 156,
        methods: { Script: 0.8, WMI: 0.2 },
        icon: "Database"
    },
    "Database Servers (Non-SQL)": {
        count: 0,
        instances: 156,
        methods: { SNMPv3: 0.5, Script: 0.36, WMI: 0.14 },
        icon: "Database"
    },
    Routers: { count: 0, instances: 92, methods: { Script: 0.55, SNMPv3: 0.45 }, icon: "Router" },
    "Ethernet Switches": { count: 0, instances: 120, methods: { Script: 0.55, SNMPv3: 0.45 }, icon: "Network" },
    "Fibre Channel Switches": { count: 0, instances: 185, methods: { SNMPv3: 0.93, Script: 0.07 }, icon: "Network" },
    Firewalls: {
        count: 0,
        instances: 272,
        methods: { Script: 0.51, SNMPv3: 0.48, HTTP: 0.01 },
        icon: "Shield"
    },
    "Load Balancers": {
        count: 0,
        instances: 125,
        methods: { Script: 0.68, HTTP: 0.01, SNMPv3: 0.31 },
        icon: "Scale"
    },
    "Wireless LAN Controllers": {
        count: 0,
        instances: 125,
        methods: { Script: 0.62, SNMPv3: 0.38 },
        icon: "Router"
    },
    "SD-WAN Edges": { count: 0, instances: 119, methods: { Script: 0.96, SNMPv3: 0.02, HTTP: 0.02 }, icon: "Activity" },
    "Access Points": { count: 0, instances: 15, methods: { Script: 0.8, SNMPv3: 0.2 }, icon: "Wifi" },
    "Nimble Storage Arrays": {
        count: 0,
        instances: 111,
        methods: { Script: 1 },
        icon: "HardDrive"
    },
    "Netapp Storage Arrays": {
        count: 0,
        instances: 945,
        methods: { Script: 0.95, SNMPv3: 0.05 },
        icon: "HardDrive"
    },
    "Pure Storage Arrays": {
        count: 0,
        instances: 247,
        methods: { Script: 1 },
        icon: "HardDrive"
    },
    "Other Storage Arrays": {
        count: 0,
        instances: 150,
        methods: { Script: 0.5, SNMPv3: 0.5 },
        icon: "HardDrive"
    },
    "Virtual Machines (VMs)": {
        count: 0,
        instances: 8,
        methods: { Script: 1 },
        icon: "Monitor",
        additional_count: 0
    },
    "Hypervisor Hosts (ESXi, Hyper-V)": {
        count: 0,
        instances: 172,
        methods: { Script: 0.98, HTTP: 0.02 },
        icon: "Server"
    },
    "iLO/DRAC/BMC Servers": {
        count: 0,
        instances: 98,
        methods: { Script: 0.06, HTTP: 0.03, SNMPv3: 0.91 },
        icon: "Server"
    },
    "Cisco UCS/FI Servers": {
        count: 0,
        instances: 274,
        methods: { Script: 0.99, HTTP: 0.01 },
        icon: "Server"
    },
};

export const cloudVmSizes = {
    SMALL: {
        aws: 't3.small',      // 2 vCPU, 2 GiB RAM, Up to 12.5 Gbps network
        azure: 'Standard_D1_v2',  // 1 vCPU, 3.5 GiB RAM, Up to 2 Gbps network
        gcp: 'e2-small'        // 2 vCPU, 2 GiB RAM, Up to 4 Gbps network
    },
    MEDIUM: {
        aws: 'c7i.large',      // 2 vCPU, 4 GiB RAM, Up to 12.5 Gbps network
        azure: 'Standard_D2ls_v5', // 2 vCPU, 4 GiB RAM, Up to 3 Gbps network
        gcp: 'e2-standard-2'       // 2 vCPU, 8 GiB RAM, Up to 4 Gbps network
    },
    LARGE: {
        aws: 'c7i.xlarge',     // 4 vCPU, 8 GiB RAM, Up to 12.5 Gbps network
        azure: 'Standard_D4ls_v5', // 4 vCPU, 8 GiB RAM, Up to 4 Gbps network
        gcp: 'c2-standard-4'   // 4 vCPU, 16 GiB RAM, Up to 8 Gbps network
    },
    XL: {
        aws: 'c7i.2xlarge',    // 8 vCPU, 16 GiB RAM, Up to 12.5 Gbps network
        azure: 'Standard_D8ls_v5', // 8 vCPU, 16 GiB RAM, Up to 8 Gbps network
        gcp: 'c2-standard-8'   // 8 vCPU, 32 GiB RAM, Up to 16 Gbps network
    },
    XXL: {
        aws: 'c7i.4xlarge',    // 16 vCPU, 32 GiB RAM, Up to 25 Gbps network
        azure: 'Standard_D16ls_v5', // 16 vCPU, 32 GiB RAM, Up to 12 Gbps network
        gcp: 'c2-standard-16'  // 16 vCPU, 64 GiB RAM, Up to 32 Gbps network
    }
};

export const collectorRequirements = {
    SMALL: {
        cpu: '1',
        memory: '2',
        disk: '35',
    },
    MEDIUM: {
        cpu: '2',
        memory: '4',
        disk: '35',
    },
    LARGE: {
        cpu: '4',
        memory: '8',
        disk: '35',
    },
    XL: {
        cpu: '8',
        memory: '16',
        disk: '35',
    },
    XXL: {
        cpu: '16',
        memory: '32',
        disk: '35',
    }
};

export const defaultMethodWeights = {
    SNMPv2: 1,
    HTTP: 1.1,
    JMX: 1.2,
    SNMPv3: 1.3,
    WMI: 2.2,
    WinRM: 4,
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

export interface DeviceType {
    count: number;
    instances: number;
    methods: Record<string, number>;
    icon: string;
}
