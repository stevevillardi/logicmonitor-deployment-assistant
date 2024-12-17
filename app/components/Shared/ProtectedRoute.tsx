import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoginPage from '../Auth/LoginPage';
import LoadingPlaceholder from './LoadingPlaceholder';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, setIsAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (<LoadingPlaceholder/>);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={setIsAuthenticated} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 