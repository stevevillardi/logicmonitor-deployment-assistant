import { supabaseBrowser } from './supabase';
import type { Permission, UserRole } from '@/app/types/auth';

export async function checkPermission(permission: Permission): Promise<boolean> {
    try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session?.user) {
            return false;
        }

        // Use the context's hasPermission if available, otherwise fall back to direct check
        if (typeof window !== 'undefined') {
            const { useAuth } = await import('@/app/contexts/AuthContext');
            const { hasPermission } = useAuth();
            return hasPermission(permission);
        }

        // Server-side permission check
        const { data, error } = await supabaseBrowser
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (error || !data) return false;

        const { ROLE_PERMISSIONS } = await import('@/app/types/auth');
        return ROLE_PERMISSIONS[data.role as UserRole].some(
            (p: Permission) => p.action === permission.action && p.resource === permission.resource
        );
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
} 