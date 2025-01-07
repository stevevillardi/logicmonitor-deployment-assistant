"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Permission, UserRole, ROLE_PERMISSIONS } from '../types/auth';

// Constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_ROLE: UserRole = 'viewer';

// Role cache implementation
class RoleCache {
    private static instance: RoleCache;
    private cache: Map<string, { role: UserRole; timestamp: number }>;
    private pendingFetches: Map<string, Promise<UserRole>>;

    private constructor() {
        this.cache = new Map();
        this.pendingFetches = new Map();
    }

    static getInstance() {
        if (!RoleCache.instance) {
            RoleCache.instance = new RoleCache();
        }
        return RoleCache.instance;
    }

    async getRole(userId: string): Promise<UserRole> {
        // Return cached role if valid
        const cached = this.cache.get(userId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.role;
        }

        // Return pending fetch if exists
        const pending = this.pendingFetches.get(userId);
        if (pending) return pending;

        // Create new fetch
        const fetchPromise = this.fetchRole(userId);
        this.pendingFetches.set(userId, fetchPromise);

        try {
            const role = await fetchPromise;
            return role;
        } finally {
            this.pendingFetches.delete(userId);
        }
    }

    private async fetchRole(userId: string): Promise<UserRole> {
        try {
            const { data: profileData, error } = await supabaseBrowser
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            const role = (error || !profileData) ? DEFAULT_ROLE : (profileData.role as UserRole);
            
            this.cache.set(userId, {
                role,
                timestamp: Date.now()
            });

            return role;
        } catch (error) {
            console.error('Error fetching user role:', error);
            return DEFAULT_ROLE;
        }
    }

    clearCache(userId?: string) {
        if (userId) {
            this.cache.delete(userId);
        } else {
            this.cache.clear();
        }
    }
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>(DEFAULT_ROLE);

    const roleCache = RoleCache.getInstance();

    const updateUserRole = useCallback(async (userId: string) => {
        try {
            const role = await roleCache.getRole(userId);
            setUserRole(role);
        } catch (error) {
            console.error('Error updating user role:', error);
            setUserRole(DEFAULT_ROLE);
        }
    }, []);

    const handleVisibilityChange = useCallback(() => {
        if (document.visibilityState === 'visible' && user) {
            updateUserRole(user.id);
        }
    }, [user, updateUserRole]);

    const hasPermission = useCallback((permission: Permission): boolean => {
        const rolePermissions = ROLE_PERMISSIONS[userRole];
        return rolePermissions.some(
            p => p.action === permission.action && p.resource === permission.resource
        );
    }, [userRole]);

    useEffect(() => {
        let mounted = true;
        
        const handleAuthStateChange = async (session: any) => {
            try {
                const currentUser = session?.user ?? null;
                
                if (mounted) {
                    setUser(currentUser);
                    
                    if (currentUser) {
                        await updateUserRole(currentUser.id);
                    } else {
                        setUserRole(DEFAULT_ROLE);
                    }
                }
            } catch (error) {
                console.error('Auth state change error:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        // Initial session check
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabaseBrowser.auth.getSession();
                await handleAuthStateChange(session);
            } catch (error) {
                console.error('Initial auth check error:', error);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    roleCache.clearCache();
                }
                await handleAuthStateChange(session);
            }
        );

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [updateUserRole, handleVisibilityChange]);

    return {
        isAuthenticated: !!user,
        user,
        isLoading,
        userRole,
        hasPermission,
    };
} 