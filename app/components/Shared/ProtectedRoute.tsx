'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingPlaceholder from './LoadingPlaceholder';
import Unauthorized from './Unauthorized';
import type { Permission } from '@/app/types/auth';
import { usePermissions } from '@/app/hooks/usePermissions';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requiredPermission?: Permission;
    requiredPermissions?: Permission[];
    requireAll?: boolean;
}

const ProtectedRoute = ({ 
    children, 
    requireAuth = true, 
    requiredPermission,
    requiredPermissions = [],
    requireAll = false
}: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();
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

    if (requiredPermissions.length > 0) {
        const hasPermissions = requireAll 
            ? hasAllPermissions(requiredPermissions)
            : hasAnyPermission(requiredPermissions);

        if (!hasPermissions) {
            return <Unauthorized />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute; 