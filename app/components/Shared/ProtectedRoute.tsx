'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingPlaceholder from './LoadingPlaceholder';
import Unauthorized from './Unauthorized';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requiredPermission?: {
        action: 'create' | 'read' | 'update' | 'delete';
        resource: 'challenges' | 'pov' | 'criteria' | 'users';
    };
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

    // Show loading state first
    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    // Then check permissions only after loading is complete
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Unauthorized />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 