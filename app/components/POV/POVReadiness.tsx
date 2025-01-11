import React, { useCallback, useEffect } from 'react';
import { FileText, ClipboardList, LibraryBig } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { POVProvider, usePOV } from '@/app/contexts/POVContext';
import POVLibrary from './POVLibrary';
import POVManagement from './POVManagement';
import POVTracker from './POVTracker';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabaseBrowser } from '@/app/lib/supabase/client';

// Placeholder components for other sections
const PovManagement = () => (
    <Card className="border border-gray-200 dark:border-gray-700 mb-4 min-h-[800px] dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                <CardTitle className="dark:text-gray-100">POV Management</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="p-6 bg-white dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400">
                POV management coming soon...
            </div>
        </CardContent>
    </Card>
);

const POVReadinessContent = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'pov-management';
    const { state, dispatch } = usePOV();

    // Only fetch if we don't have data
    useEffect(() => {
        if (!state.povs && !state.loading) {
            // Dispatch loading state
            dispatch({ type: 'SET_LOADING', payload: true });
            
            // Fetch data using existing Supabase query from context
            const fetchData = async () => {
                try {
                    const { data, error } = await supabaseBrowser
                        .from('pov')
                        .select(`
                            *,
                            challenges:pov_challenges(*),
                            key_business_services:pov_key_business_services(*),
                            team_members:pov_team_members(team_member:team_members(*)),
                            device_scopes:pov_device_scopes(*),
                            working_sessions:pov_working_sessions(
                                *,
                                session_activities:pov_session_activities(
                                    id,
                                    decision_criteria_activity_id,
                                    activity,
                                    status,
                                    notes,
                                    display_order
                                )
                            ),
                            decision_criteria:pov_decision_criteria(*)
                        `)
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    const transformedData = data?.map(pov => ({
                        ...pov,
                        team_members: pov.team_members?.map((tm: any) => tm.team_member).filter(Boolean)
                    }));

                    dispatch({ type: 'SET_POVS', payload: transformedData });
                } catch (error) {
                    console.error('Error fetching POVs:', error);
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch POVs' });
                } finally {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            };

            fetchData();
        }
    }, [state.povs, state.loading]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams);
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    const handleTabChange = useCallback((value: string) => {
        // Update the URL without forcing a hard navigation
        router.replace(`${pathname}?${createQueryString('tab', value)}`, {
            scroll: false,
        });
    }, [router, pathname, createQueryString]);

    return (
        <div className="space-y-6 overflow-y-auto min-h-[800px]">
            <Tabs 
                defaultValue={currentTab} 
                onValueChange={handleTabChange} 
                className="w-full"
            >
                <TabsList className="grid grid-cols-1 sm:flex w-full h-full bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
                    <TabsTrigger
                        value="pov-management"
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                            data-[state=active]:bg-blue-50 
                            data-[state=active]:text-blue-700 
                            data-[state=active]:border-blue-200
                            data-[state=active]:shadow-sm
                            dark:data-[state=active]:bg-blue-900/50
                            dark:data-[state=active]:text-blue-300
                            dark:data-[state=active]:border-blue-800
                            hover:bg-gray-50 
                            dark:hover:bg-gray-700
                            text-gray-600
                            dark:text-gray-300
                            font-medium
                            transition-all
                            border border-transparent
                            mb-2 sm:mb-0 sm:mr-2"
                    >
                        <FileText className="w-4 h-4" />
                        POV Management
                    </TabsTrigger>
                    <TabsTrigger
                        value="content-library"
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                            data-[state=active]:bg-blue-50 
                            data-[state=active]:text-blue-700 
                            data-[state=active]:border-blue-200
                            data-[state=active]:shadow-sm
                            dark:data-[state=active]:bg-blue-900/50
                            dark:data-[state=active]:text-blue-300
                            dark:data-[state=active]:border-blue-800
                            hover:bg-gray-50 
                            dark:hover:bg-gray-700
                            text-gray-600
                            dark:text-gray-300
                            font-medium
                            transition-all
                            border border-transparent
                            mb-2 sm:mb-0 sm:mr-2"
                    >
                        <LibraryBig className="w-4 h-4" />
                        Content Library
                    </TabsTrigger>
                    <TabsTrigger
                        value="pov-tracker"
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                            data-[state=active]:bg-blue-50 
                            data-[state=active]:text-blue-700 
                            data-[state=active]:border-blue-200
                            data-[state=active]:shadow-sm
                            dark:data-[state=active]:bg-blue-900/50
                            dark:data-[state=active]:text-blue-300
                            dark:data-[state=active]:border-blue-800
                            hover:bg-gray-50 
                            dark:hover:bg-gray-700
                            text-gray-600
                            dark:text-gray-300
                            font-medium
                            transition-all
                            border border-transparent"
                    >
                        <ClipboardList className="w-4 h-4" />
                        POV Tracker
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pov-management" className="rounded-lg overflow-hidden">
                    <POVManagement />
                </TabsContent>

                <TabsContent value="content-library" className="rounded-lg overflow-hidden">
                    <POVLibrary />
                </TabsContent>

                <TabsContent value="pov-tracker" className="rounded-lg overflow-hidden">
                    <POVTracker />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const POVReadiness = () => {
    return (
        <POVProvider>
            <POVReadinessContent />
        </POVProvider>
    );
};

export default POVReadiness; 