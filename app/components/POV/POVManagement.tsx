'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { POV } from '@/app/types/pov';
import { formatDate } from '@/lib/utils';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { devLog } from '../Shared/utils/debug';

export default function POVManagement() {
    const router = useRouter();
    const { state, dispatch } = usePOV();
    const povs = state.povs;
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        const fetchPOVs = async () => {
            try {
                if (isLoading) return; // Wait for auth to be checked

                const { data, error } = await supabaseBrowser
                    .from('pov')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    devLog('Supabase query error:', error);
                    throw error;
                }
                
                dispatch({ type: 'SET_POVS', payload: data });

            } catch (error) {
                devLog('Error in fetchPOVs:', error);
            }
        };

        fetchPOVs();
    }, [dispatch, router, isAuthenticated, isLoading]);

    const handleCreatePOV = () => {
        router.push('/pov/new');
    };

    const handleViewPOV = (povId: string) => {
        router.push(`/pov/${povId}`);
    };

    const getStatusBadgeColor = (status: POV['status']) => {
        const colors = {
            'DRAFT': 'bg-yellow-100 text-yellow-800',
            'SUBMITTED': 'bg-yellow-100 text-yellow-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'COMPLETE': 'bg-green-100 text-green-800',
            'BLOCKED': 'bg-red-100 text-red-800',
            'TECHNICALLY_SELECTED': 'bg-purple-100 text-purple-800',
            'NOT_SELECTED': 'bg-gray-100 text-gray-800',
        } as const;
        return colors[status as keyof typeof colors] || colors.DRAFT;
    };

    return (
        <Card className="border border-gray-200 dark:border-gray-700 mb-4 h-full flex flex-col bg-white dark:bg-gray-900">
            <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[#040F4B] dark:text-blue-400" />
                        <CardTitle className="text-gray-900 dark:text-gray-100">POV Management</CardTitle>
                    </div>
                    <Button
                        onClick={handleCreatePOV}
                        className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create POV
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 bg-white dark:bg-gray-900">
                {povs && povs.length > 0 ? (
                    <div className="grid gap-4">
                        {povs.map((pov: POV) => (
                            <div
                                key={pov.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                                    hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                onClick={() => handleViewPOV(pov.id)}
                            >
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        {pov.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pov.customer_name} • {pov.customer_industry}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Created on {formatDate(pov.created_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(pov.status)}`}>
                                        {pov.status.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(pov.start_date)} - {formatDate(pov.end_date)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-full flex items-center justify-center bg-transparent">
                        <div className="text-center px-4 py-12">
                            <div className="bg-gray-50 dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-6 h-6 text-[#040F4B] dark:text-blue-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                No Published Proof of Values (POVs)
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Your published POVs will appear here
                            </p>
                            <div className="mt-6">
                                <Button
                                    onClick={handleCreatePOV}
                                    className="flex items-center gap-2 mx-auto bg-[#040F4B] hover:bg-[#0A1B6F] text-white 
                                        dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                                    variant="ghost"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create POV
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 