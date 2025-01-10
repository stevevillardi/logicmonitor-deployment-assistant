import React from 'react';
import { FileText, PlayCircle, LibraryBig } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { POVProvider } from '@/app/contexts/POVContext';
import POVLibrary from './POVLibrary';
import POVManagement from './POVManagement';

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

const Playback = () => (
    <Card className="border border-gray-200 dark:border-gray-700 mb-4 min-h-[800px] dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
                <PlayCircle className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                <CardTitle className="dark:text-gray-100">POV Playback</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="p-6 bg-white dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400">
                POV playback content coming soon...
            </div>
        </CardContent>
    </Card>
);

const POVReadiness = () => {
    return (
        <POVProvider>
            <div className="space-y-6 overflow-y-auto min-h-[800px]">
                <Tabs defaultValue="pov-management" className="w-full">
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
                            value="playback"
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
                            <PlayCircle className="w-4 h-4" />
                            Playback
                        </TabsTrigger>
                    </TabsList>


                    <TabsContent value="pov-management" className="rounded-lg overflow-hidden">
                        <POVManagement />
                    </TabsContent>

                    <TabsContent value="content-library" className="rounded-lg overflow-hidden">
                        <POVLibrary />
                    </TabsContent>

                    <TabsContent value="playback" className="rounded-lg overflow-hidden">
                        <Playback />
                    </TabsContent>
                </Tabs>
            </div>
        </POVProvider>
    );
};

export default POVReadiness; 