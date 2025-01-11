'use client'

import { POVProvider } from '@/app/contexts/POVContext';
import ProtectedRoute from '@/app/components/Shared/ProtectedRoute';
import ActivePOVLayout from '@/app/components/ActivePOV/Layout/ActivePOVLayout';

export default function ActivePOVRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute
          requireAuth
          requiredPermission={{ action: 'read', resource: 'pov' }}
        >
            <POVProvider>
                <ActivePOVLayout>
                    {children}
                </ActivePOVLayout>
            </POVProvider>
        </ProtectedRoute>
    );
} 