import { LucideIcon } from 'lucide-react';

export type PermissionType = 'windows' | 'cloud' | 'api' | 'linux' | 'network' | 'database' | 'web' | 'hardware' | 'system';

export interface Permission {
    name: string;
    description: string;
    type: PermissionType;
}

export interface CredentialProperty {
    name: string;
    description: string;
    required: boolean;
    defaultValue?: string;
    validValues?: string[];
}

export interface CredentialType {
    id: string;
    name: string;
    description?: string;
    properties: CredentialProperty[];
    permissions?: Permission[];
    notes?: string;
    category: 'system' | 'protocol';
    subCategory?: string;
    icon: LucideIcon;
    tags?: string[];
    documentationUrl?: string;
    recommendedOnboarding?: string[];
}

export interface CredentialData {
    [key: string]: CredentialType;
}

export interface CredentialCategory {
    system: Record<string, CredentialType>;
    protocol: Record<string, CredentialType>;
} 