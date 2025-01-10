import { createClient } from '@/app/lib/supabase/server';
import type { Permission, UserRole } from '@/app/types/auth';

// Only keep the server-side check
export async function checkServerPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error || !data) return false;

        const { ROLE_PERMISSIONS } = await import('@/app/types/auth');
        return ROLE_PERMISSIONS[data.role as UserRole].some(
            (p: Permission) => p.action === permission.action && p.resource === permission.resource
        );
    } catch (error) {
        console.error('Server permission check error:', error);
        return false;
    }
} 