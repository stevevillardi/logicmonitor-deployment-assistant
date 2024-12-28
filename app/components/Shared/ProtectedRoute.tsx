'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingPlaceholder from './LoadingPlaceholder';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Protected Route:', { 
      isAuthenticated, 
      isLoading, 
      path: window.location.pathname 
    });
    
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login from:', window.location.pathname);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <LoadingPlaceholder />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 