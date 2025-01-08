'use client';

import LoginPage from '../components/Authentication/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingPlaceholder from '../components/Shared/LoadingPlaceholder';
import { devLog } from '../components/Shared/utils/debug';

export default function Login() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    devLog('Login page state:', {
      isAuthenticated,
      isLoading,
      userId: user?.id,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      devLog('Redirecting to home from login');
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    devLog('Rendering LoadingPlaceholder');
    return <LoadingPlaceholder />;
  }

  devLog('Rendering LoginPage');
  return <LoginPage />;
} 