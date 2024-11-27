import { LucideIcon } from 'lucide-react';
import { CredentialData, PermissionType } from '../types/credentials';
import credentialList from './credential-list.json';
import {
    Database,
    Server,
    Network,
    Cloud,
    Lock,
    Key,
    Monitor,
    Cpu,
    HardDrive,
    Globe,
    Shield,
} from 'lucide-react';

const getIconForCredential = (id: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
        // System Credentials
        citrixXen: Monitor,
        citrixXenApp: Monitor,
        dellEMC: HardDrive,
        esxServer: Server,
        mongodb: Database,
        netapp: HardDrive,

        // Protocol Credentials
        http: Globe,
        ipmi: Cpu,
        'jdbc-mysql': Database,
        'jdbc-oracle': Database,
        'snmp-v1v2c': Network,
        'snmp-v3': Shield,
        ssh: Lock,
        wmi: Key,
    };

    return iconMap[id] || Server; // Default to Server icon if no match
};

const isValidPermissionType = (type: string): type is PermissionType => {
    const validTypes = ['windows', 'cloud', 'api', 'linux', 'network', 'database', 'web', 'hardware', 'system'];
    return validTypes.includes(type);
};

export const transformCredentialData = (): CredentialData => {
    const result: CredentialData = {};

    // Transform system credentials
    Object.entries(credentialList.systemCredentials).forEach(([id, cred]) => {
        result[id] = {
            id,
            name: cred.name,
            description: cred.description,
            properties: cred.properties,
            permissions: cred.permissions.map(permission => ({
                ...permission,
                type: isValidPermissionType(permission.type) ? permission.type : 'system'
            })),
            category: 'system',
            icon: getIconForCredential(id),
            tags: cred.tags,
            documentationUrl: cred.documentationUrl,
            recommendedOnboarding: cred.recommendedOnboarding
        };
    });

    // Transform protocol credentials
    Object.entries(credentialList.protocolCredentials).forEach(([id, cred]) => {
        result[id] = {
            id,
            name: cred.name,
            description: cred.description,
            properties: cred.properties,
            permissions: cred.permissions.map(permission => ({
                ...permission,
                type: isValidPermissionType(permission.type) ? permission.type : 'system'
            })),
            category: 'protocol',
            icon: getIconForCredential(id),
            tags: cred.tags,
            documentationUrl: cred.documentationUrl,
            recommendedOnboarding: cred.recommendedOnboarding
        };
    });

    return result;
};

const mapToSpecificType = (type: string): "windows" | "cloud" | "api" | "linux" | "network" | "database" => {
    // Implement logic to map the generic type to a specific one
    switch (type) {
        case "windows":
        case "cloud":
        case "api":
        case "linux":
        case "network":
        case "database":
            return type;
        default:
            throw new Error(`Invalid type: ${type}`);
    }
}; 