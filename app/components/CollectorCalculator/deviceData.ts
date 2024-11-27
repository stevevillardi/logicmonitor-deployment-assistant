import { Technology } from './types';
import { 
    Server, Database, Network, HardDrive, Cloud,
    Router, Shield, Monitor, Cpu, Box, Radio,
    Waypoints, Globe, Workflow, Container, Phone
} from 'lucide-react';

export const technologies: Technology[] = [
    {
        id: 'cisco-router',
        name: 'Cisco Router',
        description: 'Monitor Cisco routers including interface metrics, CPU, memory, and environmental data.',
        category: 'Network',
        icon: Router,
        properties: [
            {
                name: 'SNMP Community String',
                description: 'Read-only community string for SNMP polling',
                prop_name: 'snmp.community',
                required: true
            },
            {
                name: 'SNMP Version',
                description: 'SNMP version (v2c or v3 recommended)',
                prop_name: 'snmp.version',
                required: true
            },
            {
                name: 'IP Address',
                description: 'IP address of the router',
                prop_name: 'system.hostname',
                required: true
            }
        ],
        permissions: [
            {
                name: 'SNMP Read Access',
                description: 'Device must be configured to allow SNMP reads from collector IP',
                type: 'network'
            },
            {
                name: 'ICMP Access',
                description: 'Collector must be able to ping device',
                type: 'network'
            }
        ],
        recommendedOnboarding: ['netscan', 'csv', 'wizard'],
        documentationUrl: 'https://www.logicmonitor.com/support/cisco-router-monitoring',
        tags: ['cisco', 'networking', 'router', 'snmp', 'ios']
    },
    {
        id: 'netapp-storage',
        name: 'NetApp Storage',
        description: 'Monitor NetApp storage systems including volumes, aggregates, and performance metrics.',
        category: 'Storage',
        icon: HardDrive,
        properties: [
            {
                name: 'API Username',
                description: 'Username for NetApp API access',
                prop_name: 'api.username',
                required: true
            },
            {
                name: 'API Password',
                description: 'Password for NetApp API access',
                prop_name: 'api.password',
                required: true
            },
            {
                name: 'Management IP',
                description: 'IP address of the NetApp management interface',
                prop_name: 'system.hostname',
                required: true
            }
        ],
        permissions: [
            {
                name: 'API Read Access',
                description: 'API user must have read permissions to storage system',
                type: 'api'
            }
        ],
        recommendedOnboarding: ['wizard', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/netapp-monitoring',
        tags: ['storage', 'netapp', 'san', 'nas', 'ontap']
    },
    {
        id: 'windows-server',
        name: 'Windows Server',
        description: 'Monitor Windows servers including performance counters, services, and event logs.',
        category: 'Application',
        icon: Server,
        properties: [
            {
                name: 'Domain\\Username',
                description: 'Windows domain account with monitoring permissions',
                prop_name: 'wmi.username',
                required: true
            },
            {
                name: 'Password',
                description: 'Password for Windows account',
                prop_name: 'wmi.password',
                required: true
            },
            {
                name: 'Hostname/IP',
                description: 'Hostname or IP address of the Windows server',
                prop_name: 'system.hostname',
                required: true
            }
        ],
        permissions: [
            {
                name: 'WMI Access',
                description: 'Account must have WMI query permissions',
                type: 'windows'
            },
            {
                name: 'Performance Monitor Users',
                description: 'Account must be member of Performance Monitor Users group',
                type: 'windows'
            }
        ],
        recommendedOnboarding: ['wizard', 'netscan', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/windows-monitoring',
        tags: ['windows', 'server', 'microsoft', 'wmi']
    },
    {
        id: 'aws-cloud',
        name: 'Amazon Web Services',
        description: 'Monitor AWS services including EC2, RDS, ELB, and CloudWatch metrics.',
        category: 'Cloud',
        icon: Cloud,
        properties: [
            {
                name: 'AWS Access Key',
                description: 'AWS IAM access key for API authentication',
                prop_name: 'aws.accessKey',
                required: true
            },
            {
                name: 'AWS Secret Key',
                description: 'AWS IAM secret key for API authentication',
                prop_name: 'aws.secretKey',
                required: true
            },
            {
                name: 'AWS Region',
                description: 'AWS region to monitor',
                prop_name: 'aws.region',
                required: true
            }
        ],
        permissions: [
            {
                name: 'CloudWatch Read Access',
                description: 'IAM role must have CloudWatch read permissions',
                type: 'cloud'
            },
            {
                name: 'EC2 Describe Access',
                description: 'IAM role must have EC2 describe permissions',
                type: 'cloud'
            }
        ],
        recommendedOnboarding: ['wizard'],
        documentationUrl: 'https://www.logicmonitor.com/support/aws-monitoring',
        tags: ['aws', 'cloud', 'amazon', 'ec2', 'rds']
    },
    {
        id: 'mysql-database',
        name: 'MySQL Database',
        description: 'Monitor MySQL databases including performance metrics, replication, and tablespace usage.',
        category: 'Database',
        icon: Database,
        properties: [
            {
                name: 'Username',
                description: 'MySQL user with monitoring privileges',
                prop_name: 'mysql.username',
                required: true
            },
            {
                name: 'Password',
                description: 'Password for MySQL user',
                prop_name: 'mysql.password',
                required: true
            },
            {
                name: 'Port',
                description: 'MySQL port (default 3306)',
                prop_name: 'mysql.port',
                required: false
            }
        ],
        permissions: [
            {
                name: 'PROCESS Privilege',
                description: 'User must have PROCESS privilege',
                type: 'linux'
            },
            {
                name: 'REPLICATION CLIENT',
                description: 'User must have REPLICATION CLIENT privilege for replication monitoring',
                type: 'linux'
            }
        ],
        recommendedOnboarding: ['wizard', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/mysql-monitoring',
        tags: ['mysql', 'database', 'sql', 'oracle']
    },
    {
        id: 'palo-alto-firewall',
        name: 'Palo Alto Firewall',
        description: 'Monitor Palo Alto firewalls including security metrics, throughput, and system health.',
        category: 'Security',
        icon: Shield,
        properties: [
            {
                name: 'API Key',
                description: 'API key for Palo Alto management interface',
                prop_name: 'paloalto.api.key',
                required: true
            },
            {
                name: 'Management IP',
                description: 'IP address of management interface',
                prop_name: 'system.hostname',
                required: true
            }
        ],
        permissions: [
            {
                name: 'API Access',
                description: 'API key must have operational read access',
                type: 'api'
            },
            {
                name: 'SNMP Access',
                description: 'SNMP read access for performance metrics',
                type: 'network'
            }
        ],
        recommendedOnboarding: ['wizard', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/paloalto-monitoring',
        tags: ['paloalto', 'firewall', 'security', 'network']
    },
    {
        id: 'vmware-vsphere',
        name: 'VMware vSphere',
        description: 'Monitor VMware vSphere environment including ESXi hosts, virtual machines, and datastores.',
        category: 'Virtualization',
        icon: Monitor,
        properties: [
            {
                name: 'vCenter Username',
                description: 'Username for vCenter authentication',
                prop_name: 'vcenter.username',
                required: true
            },
            {
                name: 'vCenter Password',
                description: 'Password for vCenter authentication',
                prop_name: 'vcenter.password',
                required: true
            },
            {
                name: 'vCenter URL',
                description: 'URL of vCenter server',
                prop_name: 'system.hostname',
                required: true
            }
        ],
        permissions: [
            {
                name: 'Read-only Role',
                description: 'Account must have read-only role at vCenter level',
                type: 'api'
            }
        ],
        recommendedOnboarding: ['wizard'],
        documentationUrl: 'https://www.logicmonitor.com/support/vmware-monitoring',
        tags: ['vmware', 'virtualization', 'esxi', 'vcenter']
    },
    {
        id: 'linux-server',
        name: 'Linux Server',
        description: 'Monitor Linux servers including system metrics, processes, and logs.',
        category: 'Application',
        icon: Server,
        properties: [
            {
                name: 'SSH Username',
                description: 'Username for SSH authentication',
                prop_name: 'ssh.username',
                required: true
            },
            {
                name: 'SSH Key/Password',
                description: 'SSH private key or password',
                prop_name: 'ssh.password',
                required: true
            },
            {
                name: 'Hostname/IP',
                description: 'Hostname or IP address of Linux server',
                prop_name: 'system.hostname',   
                required: true
            }
        ],
        permissions: [
            {
                name: 'Sudo Access',
                description: 'Account must have sudo privileges for certain collectors',
                type: 'linux'
            }
        ],
        recommendedOnboarding: ['wizard', 'netscan', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/linux-monitoring',
        tags: ['linux', 'unix', 'server', 'ssh']
    },
    {
        id: 'cisco-switch',
        name: 'Cisco Switch',
        description: 'Monitor Cisco switches including port statistics, VLANs, and system resources.',
        category: 'Network',
        icon: Network,
        properties: [
            {
                name: 'SNMP Community',
                description: 'SNMP community string',
                prop_name: 'snmp.community',
                required: true
            },
            {
                name: 'IP Address',
                description: 'IP address of the switch',
                prop_name: 'system.hostname',
                required: true
            }
        ],
        permissions: [
            {
                name: 'SNMP Access',
                description: 'SNMP read access from collector IP',
                type: 'network'
            }
        ],
        recommendedOnboarding: ['netscan', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/cisco-switch-monitoring',
        tags: ['cisco', 'switch', 'network', 'snmp']
    },
    {
        id: 'kubernetes',
        name: 'Kubernetes Cluster',
        description: 'Monitor Kubernetes clusters including nodes, pods, and container metrics.',
        category: 'Container',
        icon: Container,
        properties: [
            {
                name: 'Kubeconfig',
                description: 'Kubernetes configuration file',
                prop_name: 'kubeconfig',
                required: true
            },
            {
                name: 'API Endpoint',
                description: 'Kubernetes API endpoint',
                prop_name: 'system.hostname',
                required: true
            }
        ],
        permissions: [
            {
                name: 'Cluster Role',
                description: 'ClusterRole with read permissions',
                type: 'api'
            }
        ],
        recommendedOnboarding: ['wizard'],
        documentationUrl: 'https://www.logicmonitor.com/support/kubernetes-monitoring',
        tags: ['kubernetes', 'k8s', 'containers', 'docker']
    },
    {
        id: 'oracle-database',
        name: 'Oracle Database',
        description: 'Monitor Oracle databases including tablespaces, performance metrics, and sessions.',
        category: 'Database',
        icon: Database,
        properties: [
            {
                name: 'Username',
                description: 'Oracle database username',
                prop_name: 'jdbc.oracle.username',
                required: true
            },
            {
                name: 'Password',
                description: 'Oracle database password',
                prop_name: 'jdbc.oracle.password',
                required: true
            },
            {
                name: 'SID/Service Name',
                description: 'Oracle SID or service name',
                prop_name: 'jdbc.oracle.sid',
                required: true
            }
        ],
        permissions: [
            {
                name: 'SELECT ANY DICTIONARY',
                description: 'User must have SELECT ANY DICTIONARY privilege',
                type: 'database'
            }
        ],
        recommendedOnboarding: ['wizard', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/oracle-monitoring',
        tags: ['oracle', 'database', 'sql']
    },
    {
        id: 'f5-bigip',
        name: 'F5 BIG-IP',
        description: 'Monitor F5 BIG-IP load balancers including virtual servers, pools, and system metrics.',
        category: 'Network',
        icon: Globe,
        properties: [
            {
                name: 'SNMP Community',
                description: 'SNMP community string',
                prop_name: 'snmp.community',
                required: true
            },
            {
                name: 'REST Username',
                description: 'Username for REST API access',
                prop_name: 'f5.rest.username',
                required: true
            }
        ],
        permissions: [
            {
                name: 'SNMP Access',
                description: 'SNMP read access from collector IP',
                type: 'network'
            },
            {
                name: 'API Access',
                description: 'REST API read access',
                type: 'api'
            }
        ],
        recommendedOnboarding: ['wizard', 'csv'],
        documentationUrl: 'https://www.logicmonitor.com/support/f5-monitoring',
        tags: ['f5', 'load-balancer', 'network']
    },
    {
        id: 'ms-azure',
        name: 'Microsoft Azure',
        description: 'Monitor Azure services including VMs, databases, and app services.',
        category: 'Cloud',
        icon: Cloud,
        properties: [
            {
                name: 'Client ID',
                description: 'Azure AD application client ID',
                prop_name: 'azure.clientId',
                required: true
            },
            {
                name: 'Client Secret',
                description: 'Azure AD application client secret',
                prop_name: 'azure.clientSecret',
                required: true
            },
            {
                name: 'Subscription ID',
                description: 'Azure subscription ID',
                prop_name: 'azure.subscriptionId',
                required: true
            }
        ],
        permissions: [
            {
                name: 'Reader Role',
                description: 'Application must have Reader role on subscription',
                type: 'cloud'
            }
        ],
        recommendedOnboarding: ['wizard'],
        documentationUrl: 'https://www.logicmonitor.com/support/azure-monitoring',
        tags: ['azure', 'cloud', 'microsoft']
    }
];