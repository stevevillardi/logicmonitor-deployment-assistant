import { Site, Config } from '../DeploymentAssistant/types/types';
import { useState, useCallback, useEffect } from 'react';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button, Input } from '@/components/ui/enhanced-components'
import { Server, Activity, Building, Trash2, RotateCcw, MessageSquare, Info } from 'lucide-react';
import { calculateWeightedScore } from '../DeploymentAssistant/utils/utils';
import { calculateCollectors } from '../DeploymentAssistant/utils/utils';
import { DeviceTypeCard } from './DeviceTypeCardInput';
import { LogsInput } from './LogsInput';
import { CollectorVisualization } from './CollectorVisualization';
import EnhancedCard from '@/components/ui/enhanced-card';
import ConfigurationActions from './ConfigurationActions';
import { Plus, ChevronUp, ChevronDown, ChevronRight, HardDrive, HelpCircle, Bolt } from 'lucide-react';
import { FirstTimeVisit } from './FirstTimeVisit';
import { devLog } from '../Shared/utils/debug';
import { RxReset } from "react-icons/rx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DisclaimerBox from '../Shared/DisclaimerBox';
import DeploymentNameInput from './DeploymentNameInput';

interface SiteConfigurationProps {
    sites: Site[];
    onUpdateSites: (sites: Site[]) => void;
    onUpdateConfig: (config: Config) => void;
    config: Config;
    onSiteExpand: (expandedSites: Set<number>) => void;
    expandedSites: Set<number>;
}

export const SiteConfiguration = ({ sites, onUpdateSites, onUpdateConfig, config, onSiteExpand, expandedSites }: SiteConfigurationProps) => {
    devLog('SiteConfiguration received config:', config);
    devLog('SiteConfiguration received sites:', sites);

    const defaultLogs = {
        netflow: {
            fps: 0,
            collectors: []
        },
        events: {
            eps: 0,
            collectors: []
        },
        devices: {
            firewalls: 0,
            network: 0,
            linux: 0,
            storage: 0,
            windows: 0,
            loadbalancers: 0,
            vcenter: 0,
            iis: 0,
            accesspoints: 0,
            snmptraps: 0,
            netflowdevices: 0
        }
    };

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
            newSites[index].logs = defaultLogs;
        }
        onUpdateSites(newSites);
    };

    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    const getSiteResults = useCallback((site: Site) => {
        const totalWeight = calculateWeightedScore(site.devices, config.methodWeights, config);
        return calculateCollectors(totalWeight, {
            events: site.logs?.events?.eps || 0,
            netflow: site.logs?.netflow?.fps || 0
        }, config.maxLoad, config);
    }, [config]);

    const calculateAverageLoad = (collectors: Array<any>) => {
        const primaryCollectors = collectors.filter((c) => c.type === "Primary");
        if (primaryCollectors.length === 0) return 0;
        return Math.round(
            primaryCollectors.reduce((sum, c) => sum + c.load, 0) /
            primaryCollectors.length
        );
    };

    const toggleSite = (index: number) => {
        const newSet = new Set<number>(expandedSites);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        onSiteExpand(newSet);
    };

    const addSite = () => {
        const newSite = {
            name: "",
            devices: Object.fromEntries(
                Object.entries(config.deviceDefaults).map(([type, data]) => [
                    type,
                    { ...data, count: 0 },
                ])
            ),
            logs: { ...defaultLogs }
        };

        // Clear all expanded sites
        onSiteExpand(new Set());

        // Add new site to the beginning of the array
        onUpdateSites([newSite, ...sites]);

        // After a brief delay, expand the new site (now at index 0)
        setTimeout(() => {
            onSiteExpand(new Set([0]));
        }, 100);
    };

    const deleteSite = (index: number) => {
        onUpdateSites(sites.filter((_, i) => i !== index));
    };

    // Add useEffect to expand all sites when component mounts
    useEffect(() => {
        const allSiteIndexes = Array.from({ length: sites.length }, (_, i) => i);
        onSiteExpand(new Set(allSiteIndexes));
    }, [sites.length, onSiteExpand]);

    // Add default values when accessing logs
    const getTotalEPS = (site: Site) => {
        return (site.logs?.events?.eps || 0) + (site.logs?.netflow?.fps || 0);
    };

    return (
        <div className="space-y-3 min-h-[900px] mb-4 dark:bg-gray-900">
            <FirstTimeVisit
                isOpen={helpDialogOpen}
                onOpenChange={setHelpDialogOpen}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                        onClick={addSite}
                        className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2 w-full sm:w-auto dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Site
                    </Button>
                    {sites.length > 0 && (
                        <Button
                            onClick={() => {
                                const allSiteIndexes = Array.from({ length: sites.length }, (_, i) => i);
                                // If all sites are expanded, collapse all. Otherwise, expand all
                                const shouldExpandAll = expandedSites.size !== sites.length;
                                onSiteExpand(new Set(shouldExpandAll ? allSiteIndexes : []));
                            }}
                            variant="outline"
                            className="gap-2 w-full sm:w-auto dark:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-400 dark:hover:text-gray-800"
                        >
                            {expandedSites.size === sites.length ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Collapse All
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Expand All
                                </>
                            )}
                        </Button>
                    )}
                </div>
                <ConfigurationActions
                    sites={sites}
                    config={config}
                    onUpdateSites={onUpdateSites}
                    onUpdateConfig={onUpdateConfig}
                    onSiteExpand={onSiteExpand}
                />
            </div>
            <DeploymentNameInput
                value={config.deploymentName}
                onDeploymentNameChange={(name) => {
                    const newConfig = {
                        ...config,
                        deploymentName: name
                    };
                    devLog('Updating config with new deployment name:', newConfig);
                    onUpdateConfig(newConfig);
                }}
                onShowAdvancedSettingsChange={(show) => {
                    onUpdateConfig({ ...config, showAdvancedSettings: show });
                }}
                onUpdateConfig={onUpdateConfig}
                onUpdateSites={onUpdateSites}
                onSiteExpand={onSiteExpand}
                config={config}
                showDetails={config.showDetails}
                sites={sites}
            />
            
            {sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900/30 flex items-center justify-center mb-4">
                        <Building className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Sites Configured</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">Get started by adding your first site to calculate collector requirements.</p>
                    <Button
                        onClick={addSite}
                        className="bg-[#040F4B] hover:bg-[#0A1B6F] dark:bg-blue-600 dark:hover:bg-blue-700 text-white gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add First Site
                    </Button>
                </div>
            ) : (
                sites.map((site, index) => (
                    <EnhancedCard
                        key={`site-${index}`}
                        className="mb-4 border-gray-200 dark:border-gray-700"
                    >
                        <CardHeader className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex flex-col gap-4">
                                {/* Site Name Row */}
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                        onClick={() => toggleSite(index)}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                                                            <Building className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                        </div>
                                                        <ChevronRight className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${expandedSites.has(index) ? 'rotate-90' : ''}`} />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                                    <p className="dark:text-gray-100">Click to {expandedSites.has(index) ? 'collapse' : 'expand'} site</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Input
                                            value={site.name}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                const newSites = [...sites];
                                                newSites[index].name = e.target.value;
                                                onUpdateSites(newSites);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder={`Enter Site Name...`}
                                            className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                        />
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSite(index);
                                        }}
                                        className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Site
                                    </Button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {/* Polling Stats */}
                                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Server className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Polling</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                                        {(() => {
                                                            const collectors = getSiteResults(site).polling.collectors;
                                                            const count = collectors.filter(c => c.type === "Primary").length;
                                                            return count > 0 ? count : "0";
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-blue-600 dark:text-blue-300">
                                                        {(() => {
                                                            const count = getSiteResults(site).polling.collectors.filter(c => c.type === "Primary").length;
                                                            return count === 1 ? "collector" : "collectors";
                                                        })()}
                                                    </span>
                                                    {config.enablePollingFailover && getSiteResults(site).polling.collectors.length > 0 && (
                                                        <span className="text-xs text-blue-600 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Info className="w-3 h-3" />N+1
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                    <span className="text-xs text-blue-600 dark:text-blue-300">
                                                        {Object.values(site.devices).reduce((sum, device) => sum + (device.count || 0), 0).toLocaleString()} devices
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-12 h-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-600 rounded-full"
                                                                style={{ 
                                                                    width: `${Math.min(calculateAverageLoad(getSiteResults(site).polling.collectors), 100)}%`,
                                                                    backgroundColor: calculateAverageLoad(getSiteResults(site).polling.collectors) >= 80 ? '#ef4444' : 
                                                                           calculateAverageLoad(getSiteResults(site).polling.collectors) >= 60 ? '#f59e0b' : '#2563eb'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                                                            {calculateAverageLoad(getSiteResults(site).polling.collectors)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logs Stats */}
                                    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <MessageSquare className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                                                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Logs</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                                                        {(() => {
                                                            const collectors = getSiteResults(site).logs.eventCollectors;
                                                            const count = collectors.filter(c => c.type === "Primary").length;
                                                            return count > 0 ? count : "0";
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-orange-600 dark:text-orange-300">
                                                        {(() => {
                                                            const count = getSiteResults(site).logs.eventCollectors.filter(c => c.type === "Primary").length;
                                                            return count === 1 ? "collector" : "collectors";
                                                        })()}
                                                    </span>
                                                    {config.enableLogsFailover && getSiteResults(site).logs.eventCollectors.length > 0 && (
                                                        <span className="text-xs text-orange-600 dark:text-orange-300 bg-orange-100/50 dark:bg-orange-900/50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Info className="w-3 h-3" />N+1
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                    <span className="text-xs text-orange-600 dark:text-orange-300">
                                                        {(site.logs?.events?.eps || 0).toLocaleString()} EPS
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-12 h-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-orange-600 rounded-full"
                                                                style={{ 
                                                                    width: `${Math.min(calculateAverageLoad(getSiteResults(site).logs.eventCollectors), 100)}%`,
                                                                    backgroundColor: calculateAverageLoad(getSiteResults(site).logs.eventCollectors) >= 80 ? '#ef4444' : 
                                                                           calculateAverageLoad(getSiteResults(site).logs.eventCollectors) >= 60 ? '#f59e0b' : '#ea580c'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/50 px-1.5 py-0.5 rounded">
                                                            {calculateAverageLoad(getSiteResults(site).logs.eventCollectors)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NetFlow Stats */}
                                    <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Activity className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                                                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">NetFlow</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                                                        {(() => {
                                                            const collectors = getSiteResults(site).logs.netflowCollectors;
                                                            const count = collectors.filter(c => c.type === "Primary").length;
                                                            return count > 0 ? count : "0";
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-purple-600 dark:text-purple-300">
                                                        {(() => {
                                                            const count = getSiteResults(site).logs.netflowCollectors.filter(c => c.type === "Primary").length;
                                                            return count === 1 ? "collector" : "collectors";
                                                        })()}
                                                    </span>
                                                    {config.enableLogsFailover && getSiteResults(site).logs.netflowCollectors.length > 0 && (
                                                        <span className="text-xs text-purple-600 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Info className="w-3 h-3" />N+1
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                    <span className="text-xs text-purple-600 dark:text-purple-300">
                                                        {(site.logs?.netflow?.fps || 0).toLocaleString()} FPS
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-12 h-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-purple-600 rounded-full"
                                                                style={{ 
                                                                    width: `${Math.min(calculateAverageLoad(getSiteResults(site).logs.netflowCollectors), 100)}%`,
                                                                    backgroundColor: calculateAverageLoad(getSiteResults(site).logs.netflowCollectors) >= 80 ? '#ef4444' : 
                                                                           calculateAverageLoad(getSiteResults(site).logs.netflowCollectors) >= 60 ? '#f59e0b' : '#9333ea'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">
                                                            {calculateAverageLoad(getSiteResults(site).logs.netflowCollectors)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        {expandedSites.has(index) && (
                            <CardContent className="dark:bg-gray-800">
                                <div className="flex flex-col gap-4 justify-center">
                                    <Tabs defaultValue="devices" className="flex-1">
                                        <TabsList className="bg-white dark:text-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg">
                                            <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400" value="devices">
                                                Devices
                                            </TabsTrigger>
                                            <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400" value="logs">
                                                Logs, Traps & NetFlow
                                            </TabsTrigger>
                                            <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400" value="collectors">
                                                Collector Preview
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="devices" className="px-2 sm:px-0">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Devices</h3>
                                                <Button
                                                    onClick={() => resetSite(index, "devices")}
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:bg-red-900/30 dark:border-red-800 dark:hover:bg-red-900/50 dark:hover:border-red-700"
                                                >
                                                    <RxReset className="w-4 h-4 mr-2" />
                                                    Reset Devices
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                                                {Object.entries(site.devices).map(([type, data]) => (
                                                    <DeviceTypeCard
                                                        key={type}
                                                        type={type}
                                                        data={data}
                                                        methodWeights={config.methodWeights}
                                                        onUpdate={(newCount, additionalCount) => {
                                                            const newSites = [...sites];
                                                            newSites[index].devices[type] = {
                                                                ...newSites[index].devices[type],
                                                                count: newCount,
                                                                additional_count: additionalCount
                                                            };
                                                            onUpdateSites(newSites);
                                                        }}
                                                        onMethodUpdate={(newMethods) => {
                                                            const newSites = [...sites];
                                                            newSites[index].devices[type] = {
                                                                ...newSites[index].devices[type],
                                                                methods: newMethods
                                                            };
                                                            onUpdateSites(newSites);
                                                        }}
                                                        showDetails={config.showDetails}
                                                    />
                                                ))}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="logs">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Logs, Traps & NetFlow</h3>
                                                <Button
                                                    onClick={() => resetSite(index, "logs")}
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:bg-red-900/30 dark:border-red-800 dark:hover:bg-red-900/50 dark:hover:border-red-700"
                                                >
                                                    <RxReset className="w-4 h-4 mr-2" />
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
                                                showDetails={config.showDetails}
                                            />
                                        </TabsContent>

                                        <TabsContent value="collectors">
                                            <CollectorVisualization
                                                pollingCollectors={getSiteResults(site).polling.collectors}
                                                logsCollectors={getSiteResults(site).logs.eventCollectors}
                                                netflowCollectors={getSiteResults(site).logs.netflowCollectors}
                                                totalPollingLoad={calculateWeightedScore(site.devices, config.methodWeights, config)}
                                                totalLogsLoad={{
                                                    events: site.logs?.events?.eps || 0,
                                                    netflow: site.logs?.netflow?.fps || 0
                                                }}
                                                enablePollingFailover={config.enablePollingFailover}
                                                enableLogsFailover={config.enableLogsFailover}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </CardContent>
                        )}
                    </EnhancedCard>
                ))
            )}
            <div>
                <DisclaimerBox />
            </div>
        </div>
    );
};

export default SiteConfiguration;