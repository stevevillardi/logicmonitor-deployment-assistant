'use client';
    
import POVLayout from '@/app/components/POV/POVLayout';
import POVForm from '@/app/components/POV/POVForm';
import ProtectedRoute from '@/app/components/Shared/ProtectedRoute';
import { POVProvider } from '@/app/contexts/POVContext';

export default function NewPOVPage() {

    return (
        <ProtectedRoute
            requireAuth
            requiredPermission={{ action: 'create', resource: 'pov' }}
        >
            <POVProvider>
                <POVLayout>
                    <POVForm />
                </POVLayout>
            </POVProvider>
        </ProtectedRoute>
    );
} 