'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingPlaceholder from './LoadingPlaceholder';
import Unauthorized from './Unauthorized';
import type { Permission } from '@/app/types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requiredPermission?: Permission;
}

const ProtectedRoute = ({ 
    children, 
    requireAuth = true, 
    requiredPermission 
}: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && requireAuth && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, requireAuth, router]);

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Unauthorized />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 