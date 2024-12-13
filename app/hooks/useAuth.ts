import { useEffect, useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    // Set loading to false after checking auth
    setIsLoading(false);
  }, []);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    isLoading
  };
} 