'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import type { Permission } from '@/app/types/auth';

interface PermissionGatedProps {
    children: React.ReactNode;
    permission: Permission;
    fallback?: React.ReactNode; // Optional fallback UI
}

const PermissionGated = ({ 
    children, 
    permission, 
    fallback = null 
}: PermissionGatedProps) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(permission)) {
        return fallback;
    }

    return <>{children}</>;
};

export default PermissionGated; 