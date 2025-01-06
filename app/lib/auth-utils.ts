import { supabaseBrowser } from './supabase';
import { ROLE_PERMISSIONS } from '@/app/types/auth';
import type { UserRole } from '@/app/types/auth';

// Import the fetchUserRole function to reuse the caching logic
import { fetchUserRole } from '../hooks/useAuth';

export async function checkPermission(permission: { 
    action: 'create' | 'read' | 'update' | 'delete'; 
    resource: 'challenges' | 'pov' | 'criteria' | 'users';
}): Promise<boolean> {
    try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        
        if (!session?.user) {
            return false;
        }

        // Use the same cached fetchUserRole function
        const userRole = await fetchUserRole(session.user.id);

        return ROLE_PERMISSIONS[userRole].some(
            p => p.action === permission.action && p.resource === permission.resource
        );
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
} 