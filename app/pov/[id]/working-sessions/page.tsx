import { POVProvider } from '@/app/contexts/POVContext';
import POVLayout from '@/app/components/POV/POVLayout';
import ProtectedRoute from '@/app/components/Shared/ProtectedRoute';

export default function WorkingSessionsPage() {
  return (
    <ProtectedRoute
      requireAuth
      requiredPermission={{ action: 'view', resource: 'pov' }}
    >
      <POVProvider>
        <POVLayout />
      </POVProvider>
    </ProtectedRoute>
  );
}