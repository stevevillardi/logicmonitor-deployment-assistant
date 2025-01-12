import { useAuth } from '@/app/contexts/AuthContext';
import type { Permission } from '@/app/types/auth';

export function usePermissions() {
    const { hasPermission: authHasPermission } = useAuth();

    // Helper to check if a user has permission considering hierarchy
    const hasPermission = (permission: Permission): boolean => {
        // Check for direct permission match
        if (authHasPermission(permission)) {
            return true;
        }

        // If checking for 'view', 'create', or 'delete', also check if user has 'manage'
        if (permission.action !== 'manage') {
            return authHasPermission({
                action: 'manage',
                resource: permission.resource
            });
        }

        return false;
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
        return permissions.every(permission => hasPermission(permission));
    };

    // Helper to check if user can perform any action on a resource
    const canAccessResource = (resource: Permission['resource']): boolean => {
        return hasAnyPermission([
            { action: 'view', resource },
            { action: 'manage', resource },
            { action: 'create', resource },
            { action: 'delete', resource }
        ]);
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccessResource
    };
} 