'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { defaultMethodWeights, defaultDeviceTypes } from './constants';
import SiteConfiguration from './components/SiteConfiguration';
import { SystemConfiguration } from './components/SystemConfiguration';
import SiteOverview from './components/SiteOverview';
import { Config, Site } from './types';
import Image from 'next/image';
import { useCallback } from 'react';
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

const CollectorCalculator = () => {
    const [config, setConfig] = useState<Config>({
        methodWeights: { ...defaultMethodWeights },
        maxLoad: 85,
        enablePollingFailover: true,
        enableLogsFailover: false,
        deviceDefaults: { ...defaultDeviceTypes },
    });

    const [sites, setSites] = useState<Site[]>([
        {
            name: "Default Site",
            devices: Object.fromEntries(
                Object.entries(config.deviceDefaults).map(([type, data]) => [
                    type,
                    { ...data, count: 0 },
                ])
            ),
            logs: {
                netflow: 0,
                syslog: 0,
                traps: 0,
            },
        },
    ]);

    const handleConfigUpdate = useCallback((newConfig: Config) => {
        console.log('Config update triggered:', newConfig);
        setConfig(newConfig);
        
        // Update sites with new device defaults
        setSites(prevSites => prevSites.map(site => ({
            ...site,
            devices: Object.fromEntries(
                Object.entries(newConfig.deviceDefaults).map(([type, data]) => [
                    type,
                    {
                        ...data,
                        count: site.devices[type]?.count || 0
                    }
                ])
            )
        })));
    }, []);

    const handleSitesUpdate = useCallback((newSites: Site[]) => {
        console.log('Sites update triggered:', newSites);
        setSites(newSites);
    }, []);

    console.log('Current state - Sites:', sites);
    console.log('Current state - Config:', config);

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <Card className="w-full max-w-[1440px] bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <Logo />
                        <CardTitle className="text-3xl text-[#040F4B]">
                            Collector Capacity Planning
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 bg-gray-50">
                    <Tabs defaultValue="sites" className="space-y-6">
                        <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
                            <TabsTrigger 
                                value="sites" 
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                Site Configuration
                            </TabsTrigger>
                            <TabsTrigger 
                                value="system"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                System Settings
                            </TabsTrigger>
                            <TabsTrigger 
                                value="overview"
                                className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                            >
                                Overview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="sites" className="mt-6">
                            <SiteConfiguration
                                sites={sites}
                                onUpdateSites={handleSitesUpdate}
                                config={config}
                                onUpdateConfig={handleConfigUpdate}
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
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CollectorCalculator;