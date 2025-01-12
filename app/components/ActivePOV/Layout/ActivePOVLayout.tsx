'use client'

import { useEffect, useCallback, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { usePOV } from '@/app/contexts/POVContext';
import ActivePOVHeader from './ActivePOVHeader';
import ActivePOVSidebar from './ActivePOVSidebar';
import ActivePOVDashboard from '../Dashboard/ActivePOVDashboard';
import { Skeleton } from "@/components/ui/skeleton";

interface ActivePOVLayoutProps {
    children?: React.ReactNode;
}

const LoadingPlaceholder = () => {
    return (
        <div className="w-full h-full animate-in fade-in-50">
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-[100px]" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px] rounded-xl" />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-[200px]" />
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-[60px] rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-[150px]" />
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <Skeleton key={i} className="h-[100px] rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-[180px]" />
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-[40px] rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-[160px]" />
                            <div className="grid grid-cols-2 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-[80px] rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ActivePOVLayout({ children }: ActivePOVLayoutProps) {
    const pathname = usePathname();
    const params = useParams();
    const povId = params.id as string;
    const { fetchPOV } = usePOVOperations();
    const { state } = usePOV();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializePOV = async () => {
            if (!povId || state.pov?.id === povId) {
                setIsLoading(false);
                return;
            }

            try {
                await fetchPOV(povId);
            } catch (error) {
                console.error('Error initializing POV:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializePOV();

        return () => {
            mounted = false;
        };
    }, [povId, fetchPOV, state.pov?.id]);

    const renderContent = () => {
        if (isLoading) {
            return <LoadingPlaceholder />;
        }

        if (pathname === `/active-pov/${povId}`) {
            return <ActivePOVDashboard />;
        }
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