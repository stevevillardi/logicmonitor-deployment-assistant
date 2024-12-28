'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SiteConfiguration from '../SiteConfiguration/SiteConfiguration';
import { SystemConfiguration } from '../SystemSettings/SystemConfiguration';
import SiteOverview from '../SiteOverview/SiteOverview';
import CollectorInfo from '../CollectorInfo/CollectorInfo';
import { Config, Site } from './types/types';
import Image from 'next/image';
import { ChevronDown, PlayCircle, Server, Settings, BookText, Terminal, Bolt, Bot, FileText, ChartLine } from 'lucide-react';
import { FirstTimeVisit } from '../SiteConfiguration/FirstTimeVisit';
import DeviceOnboarding from '../DeviceInfo/DeviceOnboarding';
import { useRouter, usePathname } from 'next/navigation';
import VideoLibrary from '../VideoLibrary/VideoLibrary';
import { devLog } from '../Shared/utils/debug';
import { Button } from '@/components/ui/button';
import { getInitialConfig, getInitialSites } from './utils/storage';
import SwaggerUIComponent from '../APIExplorer/SwaggerUI';
import { VersionInfo } from '../VersionInfo/VersionInfo';
import { LaunchTour } from '../PlatformTour/LaunchTour';
import DashboardExplorer from '../DashboardExplorer/DashboardExplorer';
import { CartProvider } from '@/app/contexts/CartContext';
const Logo = () => {
    return (
        <div className="flex items-center">
            <Image
                src="lmlogo.webp"
                alt="LogicMonitor"
                width={250}
                height={47}
                className="w-[150px] h-auto sm:w-[200px] lg:w-[250px]"
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
    'video-library': '/video-library',
    'dashboard-explorer': '/dashboard-explorer' 
} as const;

const PATH_TO_TAB = Object.entries(TAB_PATHS).reduce((acc, [tab, path]) => {
    acc[path] = tab;
    return acc;
}, {} as Record<string, string>);

const Navigation = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (value: string) => void }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        { id: 'sites', label: 'Deployment Configuration', icon: <Bolt className="w-4 h-4" /> },
        { id: 'overview', label: 'Deployment Overview', icon: <BookText className="w-4 h-4" /> },
        { id: 'device-onboarding', label: 'Device Information', icon: <Server className="w-4 h-4" /> },
        { id: 'collector-info', label: 'Collector Information', icon: <Bot className="w-4 h-4" /> },
        { id: 'dashboard-explorer', label: 'Dashboard Explorer', icon: <ChartLine className="w-4 h-4" /> },
        { id: 'api-explorer', label: 'API Explorer', icon: <Terminal className="w-4 h-4" /> },
        { id: 'video-library', label: 'Video Library', icon: <PlayCircle className="w-4 h-4" /> },
        { id: 'system', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden lg:block rounded-lg w-full bg-[#040F4B] px-4 py-2">
                <div className="flex flex-wrap justify-center gap-2">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex items-center text-sm  gap-2 px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap
                                ${activeTab === item.id 
                                    ? 'bg-[#1a2b7f] text-white' 
                                    : 'text-white/85 hover:bg-[#0A1B6F] hover:text-white'}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden w-full bg-[#040F4B] px-4 py-2">
                <div className="relative">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 text-white bg-[#1a2b7f] rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            {navigationItems.find(item => item.id === activeTab)?.icon}
                            <span>{navigationItems.find(item => item.id === activeTab)?.label}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMobileMenuOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-[#040F4B] rounded-lg shadow-lg z-50">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onTabChange(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-4 py-2 transition-colors
                                        ${activeTab === item.id 
                                            ? 'bg-[#1a2b7f] text-white' 
                                            : 'text-white/85 hover:bg-[#0A1B6F] hover:text-white'}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const DeploymentAssistant = () => {
    const [config, setConfig] = useState<Config>(getInitialConfig);
    const [sites, setSites] = useState<Site[]>(getInitialSites);
    
    const router = useRouter();
    const pathname = usePathname();

    // Get the active tab based on the current pathname
    const getActiveTab = (path: string) => {
        return PATH_TO_TAB[path] || 'sites';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab(pathname));
    const [expandedSites, setExpandedSites] = useState < Set < number >> (new Set());
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
    }, [pathname, activeTab]);

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

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <FirstTimeVisit
                isOpen={helpDialogOpen}
                onOpenChange={setHelpDialogOpen}
            />
            <Card className="w-full max-w-[1700px] bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden">
                <CardHeader className="border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white dark:from-gray-900 to-blue-50/50 dark:to-blue-950/50 no-print p-1 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 py-2">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 w-full sm:w-auto">
                            <a href="https://www.logicmonitor.com" target="_blank" rel="noopener noreferrer">
                                <Logo />
                            </a>
                            <div className="hidden sm:block h-10 w-px bg-gray-200"></div>
                            <CardTitle className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-[#040F4B] to-blue-600 bg-clip-text text-transparent">
                                Deployment Assistant
                            </CardTitle>
                        </div>
                        <div className="hidden md:flex flex-wrap items-center gap-2 lg:gap-4">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/portal-reports'}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm text-blue-700"
                            >
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                <span className="hidden xl:inline">Reports (Beta)</span>
                            </Button>
                            <VersionInfo />
                            <LaunchTour />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 pl-3 pr-3 bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-6">
                        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

                        {activeTab === 'sites' && (
                            <div className="mt-6">
                                <SiteConfiguration
                                    sites={sites}
                                    onUpdateSites={handleSitesUpdate}
                                    config={config}
                                    onUpdateConfig={handleConfigUpdate}
                                    onSiteExpand={setExpandedSites}
                                    expandedSites={expandedSites}
                                />
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div className="mt-6">
                                <SystemConfiguration
                                    config={config}
                                    onUpdate={handleConfigUpdate}
                                    sites={sites}
                                    onUpdateSites={handleSitesUpdate}
                                />
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="mt-6">
                                <SiteOverview
                                    sites={sites}
                                    config={config}
                                />
                            </div>
                        )}

                        {activeTab === 'collector-info' && (
                            <div className="mt-6">
                                <CollectorInfo config={config} />
                            </div>
                        )}

                        {activeTab === 'dashboard-explorer' && (
                            <div className="mt-6">
                                <CartProvider>
                                    <DashboardExplorer />
                                </CartProvider>
                            </div>
                        )}

                        {activeTab === 'api-explorer' && (
                            <div className="mt-6">
                                <SwaggerUIComponent />
                            </div>
                        )}

                        {activeTab === 'device-onboarding' && (
                            <div className="mt-6">
                                <DeviceOnboarding />
                            </div>
                        )}

                        {activeTab === 'video-library' && (
                            <div className="mt-6">
                                <VideoLibrary />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeploymentAssistant;