'use client';

import { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/auth';
import { useRouter } from 'next/navigation';
import { debug, devError, devLog } from '@/app/components/Shared/utils/debug';

interface AuthContextType {
  user: any | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  }, [userRole]);

  useEffect(() => {
    let mounted = true;
    const handleAuthStateChange = async (session: any) => {
      try {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          if (!userRole) {
            const role = await fetchUserRole(session.user.id);
            if (mounted) {
              setUserRole(role);
            }
          } else {
            devLog('Using cached role:', userRole);
            return userRole;
          }
        } else {
          setUser(null);
          setUserRole('viewer');
          // Only redirect on explicit sign out, not on session check
          if (mounted && window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        debug.error('Auth state change handler failed', error);
        if (mounted) {
          setUser(null);
          setUserRole(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial session check
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      debug.auth('Initial session check', {
        hasSession: !!session,
        userId: session?.user?.id
      });
      handleAuthStateChange(session);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, session) => {
        debug.auth('Auth state changed', {
          event: _event,
          userId: session?.user?.id,
          hasSession: !!session
        });
        handleAuthStateChange(session);
      }
    );

    return () => {
      debug.auth('Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole, router]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole].some(
      p => p.action === permission.action && p.resource === permission.resource
    );
  }, [userRole]);

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabaseBrowser.auth.signOut();
      setUser(null);
      setUserRole(null);
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
    isAuthenticated: !!user && user.id != null,
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