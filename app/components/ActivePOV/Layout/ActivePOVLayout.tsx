'use client'

import { useEffect, useCallback } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import ActivePOVHeader from './ActivePOVHeader';
import ActivePOVSidebar from './ActivePOVSidebar';
import ActivePOVDashboard from '../Dashboard/ActivePOVDashboard';

interface ActivePOVLayoutProps {
    children?: React.ReactNode;
}

export default function ActivePOVLayout({ children }: ActivePOVLayoutProps) {
    const pathname = usePathname();
    const params = useParams();
    const povId = params.id as string;
    const { fetchPOV } = usePOVOperations();

    const initializePOV = useCallback(async () => {
        if (povId) {
            await fetchPOV(povId);
        }
    }, [povId, fetchPOV]);

    useEffect(() => {
        initializePOV();
    }, [initializePOV]);

    const renderContent = () => {
        // For the root active-pov route, render dashboard
        if (pathname === `/active-pov/${povId}`) {
            return <ActivePOVDashboard />;
        }
        
        // For other routes, render the children
        return children;
    };

    return (
        <div className="flex h-screen">
            <ActivePOVSidebar />
            <div className="flex-1 flex flex-col">
                <ActivePOVHeader />
                <main className="flex-1 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
} 