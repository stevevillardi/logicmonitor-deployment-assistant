'use client';

import { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/auth';
import { useRouter } from 'next/navigation';
import { debug, devError } from '@/app/components/Shared/utils/debug';

interface AuthContextType {
  user: any | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      debug.auth('Fetching user role', { userId });
      const { data, error } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      debug.auth('User role fetched', { role: data?.role });
      return (data?.role as UserRole) || 'viewer';
    } catch (error) {
      debug.error('Failed to fetch user role', error);
      return 'viewer';
    }
  }, []);

  // Handle initial session
  useEffect(() => {
    let mounted = true;
    debug.auth('Initializing auth state');

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        debug.auth('Initial session check', { 
          hasSession: !!session,
          userId: session?.user?.id 
        });
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          if (mounted) {
            setUserRole(role);
          }
        } else {
          if (mounted) {
            setUser(null);
            setUserRole('viewer');
          }
        }
      } catch (error) {
        debug.error('Auth initialization failed', error);
        if (mounted) {
          setUser(null);
          setUserRole('viewer');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();
    return () => { mounted = false; };
  }, [fetchUserRole]);

  // Handle auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        debug.auth('Auth state changed', { event, userId: session?.user?.id });

        try {
          if (session?.user) {
            setUser(session.user);
            const role = await fetchUserRole(session.user.id);
            setUserRole(role);
          } else {
            setUser(null);
            setUserRole('viewer');
            if (event === 'SIGNED_OUT') {
              debug.auth('User signed out, redirecting to login');
              router.push('/login');
            }
          }
        } catch (error) {
          debug.error('Auth state change failed', error);
          setUser(null);
          setUserRole('viewer');
        }
      }
    );

    return () => {
      debug.auth('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [fetchUserRole, router, isInitialized]);

  // Log state changes only in development
  useEffect(() => {
    debug.auth('Auth state updated', {
      isLoading,
      isInitialized,
      isAuthenticated: !!user,
      userRole,
      userId: user?.id
    });
  }, [isLoading, isInitialized, user, userRole]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    return ROLE_PERMISSIONS[userRole].some(
      p => p.action === permission.action && p.resource === permission.resource
    );
  }, [userRole]);

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabaseBrowser.auth.signOut();
      setUser(null);
      setUserRole('viewer');
      router.push('/login');
    } catch (error) {
      devError('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    userRole,
    isAuthenticated: !!user,
    isLoading,
    hasPermission,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 