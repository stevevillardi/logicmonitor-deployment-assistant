'use client';

import LoginPage from '../components/Authentication/LoginPage';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingPlaceholder from '../components/Shared/LoadingPlaceholder';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Login page:', { 
      isAuthenticated, 
      isLoading, 
      currentPath: window.location.pathname 
    });
    
    if (!isLoading && isAuthenticated) {
      console.log('Redirecting to home from login');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <LoginPage />;
} 