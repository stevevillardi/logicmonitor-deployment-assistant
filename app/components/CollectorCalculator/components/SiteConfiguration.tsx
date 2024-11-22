import { defaultDeviceTypes } from '../constants';
import { Site, Config } from '../types';
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button, Input } from '@/components/ui/enhanced-components'
import { Server, Activity, Network } from 'lucide-react';
import { calculateWeightedScore } from '../utils';
import { calculateCollectors } from '../utils';
import { DeviceTypeCard } from './DeviceTypeCard';
import { LogsInput } from './LogsInput';
import { CollectorVisualization } from './CollectorVisualization';
import EnhancedCard from '@/components/ui/enhanced-card';

interface SiteConfigurationProps {
    sites: Site[];
    onUpdateSites: (sites: Site[]) => void;
    config: Config;
}

export const SiteConfiguration = ({ sites, onUpdateSites, config }: SiteConfigurationProps) => {
    const resetSite = (index: number, type: string) => {
        const newSites = [...sites];
        if (type === "devices") {
            newSites[index].devices = Object.fromEntries(
                Object.entries(config.deviceDefaults).map(([type, data]) => [
                    type,
                    { ...data, count: 0 },
                ])
            );
        } else if (type === "logs") {
            newSites[index].logs = {
                netflow: 0,
                syslog: 0,
                traps: 0,
            };
        }
        onUpdateSites(newSites);
    };

    const getSiteResults = (site: Site) => {
        const totalWeight = calculateWeightedScore(
            site.devices,
            config.methodWeights
        );
        const totalEPS = Object.values(site.logs).reduce(
            (sum, eps) => sum + eps,
            0
        );
        return calculateCollectors(totalWeight, totalEPS, config.maxLoad, config);
    };

    const calculateAverageLoad = (collectors: Array<any>) => {
        const primaryCollectors = collectors.filter((c) => c.type === "Primary");
        if (primaryCollectors.length === 0) return 0;
        return Math.round(
            primaryCollectors.reduce((sum, c) => sum + c.load, 0) /
            primaryCollectors.length
        );
    };

    const [expandedSites, setExpandedSites] = useState(new Set([0])); // Start with first site expanded

    const toggleSite = (index: number) => {
        setExpandedSites((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const addSite = () => {
        const blankDevices = Object.fromEntries(
            Object.entries(defaultDeviceTypes).map(([type, data]) => [
                type,
                { ...data, count: 0 },
            ])
        );

        const newSite = {
            name: `Site ${sites.length + 1}`,
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
        };
        onUpdateSites([...sites, newSite]);
    };

    const deleteSite = (index: number) => {
        onUpdateSites(sites.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            {sites.map((site, index) => (
                <EnhancedCard key={index} className="bg-white">
                    <CardHeader
                        className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50"
                        onClick={() => toggleSite(index)}
                    >
                        <div className="flex items-center gap-4">
                            <Network className="w-6 h-6 text-blue-600" />
                            <div className="flex items-center gap-2">
                                <Input
                                    value={site.name}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        const newSites = [...sites];
                                        newSites[index].name = e.target.value;
                                        onUpdateSites(newSites);
                                    }}
                                    className="w-64"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-slate-400">
                                    {expandedSites.has(index) ? "▼" : "▶"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Add collector summary */}
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Server className="w-4 h-4 text-blue-600" />
                                    <span className="text-slate-600">
                                        {
                                            getSiteResults(site).polling.collectors.filter(
                                                (c) => c.type === "Primary"
                                            ).length
                                        }
                                        {config.enablePollingFailover && "+1"}{" "}
                                        {getSiteResults(site).polling.collectors.length > 0
                                            ? getSiteResults(site).polling.collectors[0].size
                                            : ""}
                                        <span
                                            className={`ml-1 ${calculateAverageLoad(
                                                getSiteResults(site).polling.collectors
                                            ) >= 80
                                                ? "text-red-600"
                                                : calculateAverageLoad(
                                                    getSiteResults(site).polling.collectors
                                                ) >= 60
                                                    ? "text-yellow-600"
                                                    : "text-green-600"
                                                }`}
                                        >
                                            (
                                            {calculateAverageLoad(
                                                getSiteResults(site).polling.collectors
                                            )}
                                            %)
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-green-600" />
                                    <span className="text-slate-600">
                                        {
                                            getSiteResults(site).logs.collectors.filter(
                                                (c) => c.type === "Primary"
                                            ).length
                                        }
                                        {config.enableLogsFailover && "+1"}{" "}
                                        {getSiteResults(site).logs.collectors.length > 0
                                            ? getSiteResults(site).logs.collectors[0].size
                                            : ""}
                                        <span
                                            className={`ml-1 ${calculateAverageLoad(
                                                getSiteResults(site).logs.collectors
                                            ) >= 80
                                                ? "text-red-600"
                                                : calculateAverageLoad(
                                                    getSiteResults(site).logs.collectors
                                                ) >= 60
                                                    ? "text-yellow-600"
                                                    : "text-green-600"
                                                }`}
                                        >
                                            (
                                            {calculateAverageLoad(
                                                getSiteResults(site).logs.collectors
                                            )}
                                            %)
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <span className="text-sm text-slate-500 border-l border-slate-200 pl-4">
                                {Object.values(site.devices).reduce(
                                    (sum, device) => sum + (device.count || 0),
                                    0
                                )}{" "}
                                Devices
                            </span>
                            <Button
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSite(index);
                                }}
                                className="bg-red-100 text-red-600 hover:bg-red-200"
                            >
                                Remove Site
                            </Button>
                        </div>
                    </CardHeader>
                    {expandedSites.has(index) && (
                        <CardContent>
                            <Tabs defaultValue="devices">
                                <TabsList>
                                    <TabsTrigger value="devices">Devices</TabsTrigger>
                                    <TabsTrigger value="logs">Logs & NetFlow</TabsTrigger>
                                </TabsList>

                                <TabsContent value="devices" className="mt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Devices</h3>
                                        <Button
                                            onClick={() => resetSite(index, "devices")}
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Reset Devices
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.entries(site.devices).map(([type, data]) => (
                                            <DeviceTypeCard
                                                key={type}
                                                type={type}
                                                data={data}
                                                onUpdate={(newCount) => {
                                                    const newSites = [...sites];
                                                    newSites[index].devices[type].count = newCount;
                                                    onUpdateSites(newSites);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="logs" className="mt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Logs & NetFlow</h3>
                                        <Button
                                            onClick={() => resetSite(index, "logs")}
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Reset Logs
                                        </Button>
                                    </div>
                                    <LogsInput
                                        logs={site.logs}
                                        onUpdate={(newLogs) => {
                                            const newSites = [...sites];
                                            newSites[index].logs = newLogs;
                                            onUpdateSites(newSites);
                                        }}
                                    />
                                </TabsContent>
                            </Tabs>

                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-white-900 mb-4">
                                    {site.name} Collectors
                                </h3>
                                <CollectorVisualization
                                    polling={getSiteResults(site).polling}
                                    logs={getSiteResults(site).logs}
                                />
                            </div>
                        </CardContent>
                    )}
                </EnhancedCard>
            ))}

            <Button
                onClick={addSite}
                className="w-full bg-[#040F4B] hover:bg-[#040F4B]/80 text-white py-6 text-lg"
            >
                Add New Site
            </Button>
        </div>
    );
};