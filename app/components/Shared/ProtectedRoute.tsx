'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingPlaceholder from './LoadingPlaceholder';
import Unauthorized from './Unauthorized';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireDomain?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = false, requireDomain = false }: ProtectedRouteProps) => {
    const { isAuthenticated, isAuthorized, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                router.push('/login');
            }
        }
    }, [isAuthenticated, isAuthorized, isLoading, requireAuth, requireDomain, router]);

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (requireDomain && !isAuthorized) {
        return <Unauthorized />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 