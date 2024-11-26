'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { defaultMethodWeights, defaultDeviceTypes, collectorCapacities } from './constants';
import SiteConfiguration from './components/SiteConfiguration';
import { SystemConfiguration } from './components/SystemConfiguration';
import SiteOverview from './components/SiteOverview';
import CollectorInfo from './components/CollectorInfo';
import { Config, Site } from './types';
import Image from 'next/image';
import { KeyRound, PlayCircle, Server, MessageCircleQuestion, HelpCircle, Settings, BookText, Info, Terminal, Bolt, Bot } from 'lucide-react';
import { FirstTimeVisit } from './components/FirstTimeVisit';
import DeviceOnboarding from './components/DeviceOnboarding';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dist/shared/lib/dynamic';
import VideoLibrary from '../CollectorCalculator/components/VideoLibrary';
const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <Image
                src="lmlogo.webp"
                alt="LogicMonitor"
                width={250}
                height={250}
                priority
            />
        </div>
    );
};

// Map URL paths to tab values
const TAB_PATHS = {
    sites: '/',
    overview: '/overview',
    system: '/system',
    'collector-info': '/collector-info',
    'api-explorer': '/api-explorer',
    'device-onboarding': '/device-onboarding',
    'video-library': '/video-library'
} as const;

const PATH_TO_TAB = Object.entries(TAB_PATHS).reduce((acc, [tab, path]) => {
    acc[path] = tab;
    return acc;
}, {} as Record<string, string>);

const LazyAPIExplorer = dynamic(() => import('./components/SwaggerUI'), { 
    ssr: false
});

const CollectorCalculator = () => {
    const [config, setConfig] = useState<Config>(() => {
        // Try to get the config from localStorage
        const savedConfig = typeof window !== 'undefined' ? localStorage.getItem('collectorConfig') : null;
        return savedConfig ? JSON.parse(savedConfig) : {
            deploymentName: 'New Deployment',
            methodWeights: { ...defaultMethodWeights },
            maxLoad: 85,
            enablePollingFailover: true,
            enableLogsFailover: false,
            deviceDefaults: { ...defaultDeviceTypes },
            collectorCapacities: { ...collectorCapacities },
        };
    });

    const [sites, setSites] = useState<Site[]>(() => {
        // Try to get the sites from localStorage
        const savedSites = typeof window !== 'undefined' ? localStorage.getItem('collectorSites') : null;
        return savedSites ? JSON.parse(savedSites) : [{
            name: "Site 1",
            devices: Object.fromEntries(
                Object.entries(defaultDeviceTypes).map(([type, data]) => [
                    type,
                    { ...data, count: 0 },
                ])
            ),
            logs: {
                netflow: 0,
                syslog: 0,
                traps: 0,
            },
        }];
    });

    const router = useRouter();
    const pathname = usePathname();

    // Get the active tab based on the current pathname
    const getActiveTab = (path: string) => {
        return PATH_TO_TAB[path] || 'sites';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab(pathname));
    const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set());
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('collectorConfig', JSON.stringify(config));
    }, [config]);

    useEffect(() => {
        localStorage.setItem('collectorSites', JSON.stringify(sites));
    }, [sites]);

    // Update the URL when tab changes
    const handleTabChange = useCallback((value: string) => {
        const path = TAB_PATHS[value as keyof typeof TAB_PATHS];
        if (path && value !== activeTab) {
            setActiveTab(value);
            router.push(path, { scroll: false });
        }
    }, [activeTab, router]);

    // Only update active tab from URL on initial load and direct navigation
    useEffect(() => {
        const newTab = getActiveTab(pathname);
        if (newTab !== activeTab) {
            setActiveTab(newTab);
        }
    }, [pathname]);

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedCollectorCalculator');
        if (!hasVisited) {
            setHelpDialogOpen(true);
            localStorage.setItem('hasVisitedCollectorCalculator', 'true');
        }
    }, []);

    const handleConfigUpdate = useCallback((newConfig: Config) => {
        console.log('Config update triggered:', newConfig);
        setConfig(newConfig);
    }, []);

    const handleSitesUpdate = useCallback((newSites: Site[]) => {
        setSites(newSites);
    }, []);

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <FirstTimeVisit
                isOpen={helpDialogOpen}
                onOpenChange={setHelpDialogOpen}
            />
            <Card className="w-full max-w-[1440px] bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-white to-blue-50/50 no-print">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-8">
                            <a href="https://www.logicmonitor.com" target="_blank" rel="noopener noreferrer">
                                <Logo />
                            </a>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#040F4B] to-blue-600 bg-clip-text text-transparent">
                                Deployment Assistant
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.logicmonitor.com/support/getting-started/advanced-logicmonitor-setup/defining-authentication-credentials"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            >
                                <Server className="w-5 h-5 text-blue-700" />
                                <span className="text-sm font-medium text-blue-700">Installing a Collector</span>
                            </a>
                            <a
                                href="https://www.logicmonitor.com/support/getting-started/advanced-logicmonitor-setup/defining-authentication-credentials"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            >
                                <KeyRound className="w-5 h-5 text-blue-700" />
                                <span className="text-sm font-medium text-blue-700">Collector Credentials</span>
                            </a>
                            <a
                                href="https://www.logicmonitor.com/support/collectors/collector-overview/about-the-logicmonitor-collector"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            >
                                <MessageCircleQuestion className="w-5 h-5 text-blue-700" />
                                <span className="text-sm font-medium text-blue-700">Collector FAQs</span>
                            </a>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 bg-gray-50">
                    <Tabs
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="space-y-6"
                    >
                        <TabsList className="bg-white border border-gray-200 p-1 rounded-lg no-print">
                            <TabsTrigger
                                value="sites"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                <Bolt className="w-5 h-5 pr-1" />
                                Deployment Configuration
                            </TabsTrigger>
                            <TabsTrigger
                                value="overview"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                <BookText className="w-5 h-5 pr-1" />
                                Deployment Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="device-onboarding"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                <Bot className="w-5 h-5 pr-1" />
                                Device Onboarding
                            </TabsTrigger>
                            <TabsTrigger
                                value="collector-info"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                <Info className="w-5 h-5 pr-1" />
                                Collector Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="api-explorer"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                <Terminal className="w-5 h-5 pr-1" />
                                API Explorer
                            </TabsTrigger>
                            <TabsTrigger
                                value="video-library"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                <PlayCircle className="w-5 h-5 pr-1" />
                                Video Library
                            </TabsTrigger>
                            <TabsTrigger
                                value="system"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                <Settings className="w-5 h-5 pr-1" />
                                System Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="sites" className="mt-6">
                            <SiteConfiguration
                                sites={sites}
                                onUpdateSites={handleSitesUpdate}
                                config={config}
                                onUpdateConfig={handleConfigUpdate}
                                onSiteExpand={setExpandedSites}
                                expandedSites={expandedSites}
                            />
                        </TabsContent>

                        <TabsContent value="system" className="mt-6">
                            <SystemConfiguration
                                config={config}
                                onUpdate={handleConfigUpdate}
                            />
                        </TabsContent>

                        <TabsContent value="overview" className="mt-6">
                            <SiteOverview
                                sites={sites}
                                config={config}
                            />
                        </TabsContent>
                        <TabsContent value="collector-info" className="mt-6">
                            <CollectorInfo config={config} />
                        </TabsContent>
                        <TabsContent value="api-explorer" className="mt-6">
                            {activeTab === 'api-explorer' && <LazyAPIExplorer />}
                        </TabsContent>
                        <TabsContent value="device-onboarding" className="mt-6">
                            <DeviceOnboarding />
                        </TabsContent>
                        <TabsContent value="video-library" className="mt-6">
                            <VideoLibrary />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CollectorCalculator;