"use client";

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
    // Add cache invalidation if the cache is too old
    if (Date.now() - roleCache.timestamp > CACHE_DURATION * 2) {
        roleCache = {
            userId: undefined,
            role: 'viewer',
            timestamp: 0
        };
        pendingRoleFetch = null;
    }

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
            const { data: profileData, error } = await supabaseBrowser
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !profileData) {
                console.log('No role found for user, defaulting to viewer');
                roleCache = {
                    userId,
                    role: 'viewer',
                    timestamp: Date.now()
                };
                return 'viewer';
            }

            const role = profileData.role as UserRole;
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
                
                // Set user immediately
                setUser(session?.user ?? null);
                
                // If no session, we can stop loading
                if (!session?.user) {
                    setIsLoading(false);
                    return;
                }

                // Fetch role with timeout
                try {
                    const role = await Promise.race([
                        fetchUserRole(session.user.id),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
                        )
                    ]);
                    
                    if (mounted) {
                        setUserRole(role as UserRole);
                    }
                } catch (roleError) {
                    console.error('Role fetch error:', roleError);
                    // On timeout/error, fallback to viewer role
                    if (mounted) {
                        setUserRole('viewer');
                    }
                }
                
                if (mounted) {
                    setIsLoading(false);
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
                
                if (!session?.user) {
                    setIsLoading(false);
                    return;
                }

                try {
                    const role = await Promise.race([
                        fetchUserRole(session.user.id),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
                        )
                    ]);
                    
                    if (mounted) {
                        setUserRole(role as UserRole);
                    }
                } catch (roleError) {
                    console.error('Role fetch error:', roleError);
                    if (mounted) {
                        setUserRole('viewer');
                    }
                }
                
                if (mounted) {
                    setIsLoading(false);
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