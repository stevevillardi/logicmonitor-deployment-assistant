import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Permission, UserRole, ROLE_PERMISSIONS } from '../types/auth';

// Move cache variables outside and export them if needed by other modules
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let roleCache: {
    userId: string | undefined;
    role: UserRole;
    timestamp: number;
} = {
    userId: undefined,
    role: 'viewer',
    timestamp: 0
};

let pendingRoleFetch: Promise<UserRole> | null = null;

// Export the fetchUserRole function so it can be used by auth-utils
export async function fetchUserRole(userId: string): Promise<UserRole> {
    // Check memory cache first
    if (
        roleCache.userId === userId && 
        Date.now() - roleCache.timestamp < CACHE_DURATION
    ) {
        return roleCache.role;
    }

    // If there's already a pending fetch, return that instead of making a new request
    if (pendingRoleFetch) {
        return pendingRoleFetch;
    }

    // Create new fetch promise
    pendingRoleFetch = (async () => {
        try {
            const { data: roleData, error } = await supabaseBrowser
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .single();

            // Handle case where user has no role explicitly
            if (error || !roleData) {
                console.log('No role found for user, defaulting to viewer');
                // Update cache with default role
                roleCache = {
                    userId,
                    role: 'viewer',
                    timestamp: Date.now()
                };
                return 'viewer';
            }

            // We know roleData exists here, so we can safely cast
            const role = roleData.role as UserRole;
            // Update cache
            roleCache = {
                userId,
                role,
                timestamp: Date.now()
            };

            return role;
        } catch (error) {
            console.error('Error fetching user role:', error);
            return 'viewer';
        } finally {
            pendingRoleFetch = null;
        }
    })();

    return pendingRoleFetch;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>('viewer');

    const hasPermission = (permission: Permission): boolean => {
        const rolePermissions = ROLE_PERMISSIONS[userRole];
        return rolePermissions.some(
            p => p.action === permission.action && p.resource === permission.resource
        );
    };

    useEffect(() => {
        let mounted = true;

        const getUser = async () => {
            try {
                const { data: { session } } = await supabaseBrowser.auth.getSession();
                
                if (!mounted) return;
                
                setUser(session?.user ?? null);
                
                if (session?.user) {
                    const role = await fetchUserRole(session.user.id);
                    if (mounted) {
                        setUserRole(role);
                        setIsLoading(false);
                    }
                } else {
                    if (mounted) {
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error('Auth error:', error);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        getUser();

        const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return;
                
                setUser(session?.user ?? null);
                if (session?.user) {
                    const role = await fetchUserRole(session.user.id);
                    if (mounted) {
                        setUserRole(role);
                        setIsLoading(false);
                    }
                } else {
                    if (mounted) {
                        setIsLoading(false);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return {
        isAuthenticated: !!user,
        user,
        isLoading,
        userRole,
        hasPermission,
    };
} 