import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginPage from './auth/LoginPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={setIsAuthenticated} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 