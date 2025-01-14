import { createClient } from '@/app/lib/supabase/server';
import type { Permission, UserRole } from '@/app/types/auth';

// Function to get user role from the database
async function getUserRole(userId: string): Promise<UserRole | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error('Error fetching user role:', error);
        return null;
    }

    return data.role as UserRole;
}

// Function to check if a user has a specific permission
export async function hasServerPermission(userId: string, permission: Permission): Promise<boolean> {
    const role = await getUserRole(userId);
    if (!role) return false;

    const { ROLE_PERMISSIONS } = await import('@/app/types/auth');
    
    // Check for direct permission match
    const hasDirectPermission = ROLE_PERMISSIONS[role].some(
        (p: Permission) => p.action === permission.action && p.resource === permission.resource
    );

    // If checking for 'view', 'create', or 'delete', also check if user has 'manage'
    if (!hasDirectPermission && permission.action !== 'manage') {
        return ROLE_PERMISSIONS[role].some(
            (p: Permission) => p.action === 'manage' && p.resource === permission.resource
        );
    }

    return hasDirectPermission;
}

// Function to check if a user has any of the specified permissions
export async function hasAnyServerPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
        if (await hasServerPermission(userId, permission)) {
            return true;
        }
    }
    return false;
}

// Function to check if a user has all of the specified permissions
export async function hasAllServerPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
        if (!(await hasServerPermission(userId, permission))) {
            return false;
        }
    }
    return true;
}

// Function to check if a user can access a resource
export async function canAccessServerResource(userId: string, resource: Permission['resource']): Promise<boolean> {
    return await hasAnyServerPermission(userId, [
        { action: 'view', resource },
        { action: 'manage', resource },
        { action: 'create', resource },
        { action: 'delete', resource }
    ]);
} 
