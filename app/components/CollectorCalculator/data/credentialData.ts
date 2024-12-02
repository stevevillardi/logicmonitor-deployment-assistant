import { LucideIcon } from 'lucide-react';
import { CredentialData, CredentialType, PermissionType } from '../types/credentials';
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
        citrixXenServer: Monitor,
        citrixXenApp: Monitor,
        esxServer: Server,
        mongodb: Database,
        netapp: HardDrive,
        paloaltoFirewall: Shield,
        dellEMCIsilon: HardDrive,
        dellEMCUnity: HardDrive,
        dellEMCPowerStore: HardDrive,
        dellEMCVNX: HardDrive,
        vcenterServer: Server,
        ciscoUcs: Server,
        citrixNetscaler: Network,
        ciscoMeraki: Network,
        // Protocol Credentials
        http: Globe,
        ipmi: Cpu,
        'jdbc-mysql': Database,
        'jdbc-oracle': Database,
        'snmp-v1v2c': Network,
        'snmp-v3': Network,
        ssh: Lock,
        wmi: Key,
    };

    return iconMap[id] || Server; // Default to Server icon if no match
};

export const transformCredentialData = async () => {
    const credentialList = await import('./credential-list.json');
    const transformedData: { [key: string]: CredentialType } = {};

    // Transform system credentials
    Object.entries(credentialList.default.systemCredentials).forEach(([id, cred]: [string, any]) => {
        transformedData[id] = {
            id,
            type: 'system',
            name: cred.name,
            description: cred.description,
            category: cred.category,
            properties: cred.properties,
            permissions: cred.permissions,
            recommendedOnboarding: cred.recommendedOnboarding,
            documentationUrl: cred.documentationUrl,
            tags: cred.tags,
            icon: getIconForCredential(id)
        };
    });

    // Transform protocol credentials
    Object.entries(credentialList.default.protocolCredentials).forEach(([id, cred]: [string, any]) => {
        transformedData[id] = {
            id,
            type: 'protocol',
            name: cred.name,
            description: cred.description,
            category: cred.category,
            properties: cred.properties,
            permissions: cred.permissions,
            recommendedOnboarding: cred.recommendedOnboarding,
            documentationUrl: cred.documentationUrl,
            tags: cred.tags,
            icon: getIconForCredential(id)
        };
    });

    return transformedData;
};