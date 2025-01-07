'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SiteConfiguration from '../SiteConfiguration/SiteConfiguration';
import { SystemConfiguration } from '../SystemSettings/SystemConfiguration';
import SiteOverview from '../SiteOverview/SiteOverview';
import CollectorInfo from '../CollectorInfo/CollectorInfo';
import { Config, Site } from './types/types';
import Image from 'next/image';
import { Rocket } from 'lucide-react';
import { FirstTimeVisit } from '../SiteConfiguration/FirstTimeVisit';
import DeviceOnboarding from '../DeviceInfo/DeviceOnboarding';
import { useRouter, usePathname } from 'next/navigation';
import VideoLibrary from '../VideoLibrary/VideoLibrary';
import { devLog } from '../Shared/utils/debug';
import { getInitialConfig, getInitialSites } from './utils/storage';
import SwaggerUIComponent from '../APIExplorer/SwaggerUI';
import { VersionInfo } from '../VersionInfo/VersionInfo';
import { LaunchTour } from '../PlatformTour/LaunchTour';
import DashboardExplorer from '../DashboardExplorer/DashboardExplorer';
import { CartProvider } from '@/app/contexts/CartContext';
import { Profile } from '../Authentication/Profile';
import POVReadiness from '../POV/POVReadiness';
import { Navigation } from './Navigation';
import HomePage from '../Home/Home';
import ReportsExplorer from '../ReportsExplorer/ReportsExplorer';

const DeploymentAssistant = () => {
    const [config, setConfig] = useState<Config>(getInitialConfig);
    const [sites, setSites] = useState<Site[]>(getInitialSites);
    const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set());
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
    
    const router = useRouter();
    const pathname = usePathname();

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('collectorConfig', JSON.stringify(config));
    }, [config]);

    useEffect(() => {
        localStorage.setItem('collectorSites', JSON.stringify(sites));
    }, [sites]);

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedDeploymentAssistant');
        if (!hasVisited) {
            setHelpDialogOpen(true);
            localStorage.setItem('hasVisitedDeploymentAssistant', 'true');
        }
    }, []);

    const handleConfigUpdate = useCallback((newConfig: Config) => {
        devLog('Config update triggered:', newConfig);
        setConfig(newConfig);
    }, []);

    const handleSitesUpdate = useCallback((newSites: Site[]) => {
        devLog('Sites update triggered:', newSites);
        setSites(newSites);
    }, []);

    const renderContent = () => {
        switch (pathname) {
            case '/home':
                return <HomePage />;
            case '/sites':
                return (
                    <SiteConfiguration
                        sites={sites}
                        onUpdateSites={handleSitesUpdate}
                        config={config}
                        onUpdateConfig={handleConfigUpdate}
                        onSiteExpand={setExpandedSites}
                        expandedSites={expandedSites}
                    />
                );
            case '/system':
                return (
                    <SystemConfiguration
                        config={config}
                        onUpdate={handleConfigUpdate}
                        sites={sites}
                        onUpdateSites={handleSitesUpdate}
                    />
                );
            case '/overview':
                return <SiteOverview sites={sites} config={config} />;
            case '/collector-info':
                return <CollectorInfo config={config} />;
            case '/dashboard-explorer':
                return (
                    <CartProvider>
                        <DashboardExplorer />
                    </CartProvider>
                );
            case '/api-explorer':
                return <SwaggerUIComponent />;
            case '/reports-explorer':
                return <ReportsExplorer />;
            case '/device-onboarding':
                return <DeviceOnboarding />;
            case '/video-library':
                return <VideoLibrary />;
            case '/pov':
                return <POVReadiness />;
            default:
                return null;
        }
    };

    return (    
        <div className="min-h-screen bg-[#040F4B] w-full flex items-center justify-center">
            <FirstTimeVisit
                isOpen={helpDialogOpen}
                onOpenChange={setHelpDialogOpen}
            />
            <Card className="w-full max-w-[1700px] bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden">
                <CardHeader className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 no-print p-1 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 py-2">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 w-full sm:w-auto">
                            <Rocket className="w-10 h-10 text-[#040F4B] dark:text-blue-400" />
                            <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                            <CardTitle className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-[#040F4B] to-blue-600 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                                Deployment Assistant
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className="flex md:hidden items-center gap-2">
                                <Profile />
                            </div>
                            <div className="hidden md:flex items-center gap-2 lg:gap-4">
                                <LaunchTour />
                                <VersionInfo />
                                <Profile />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 pl-3 pr-3 bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-6">
                        <Navigation />
                        <div className="mt-6">
                            {renderContent()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeploymentAssistant;