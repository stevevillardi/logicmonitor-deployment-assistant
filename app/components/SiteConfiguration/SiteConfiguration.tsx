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
import DeploymentNameInput from './DeploymentNameInput';
import { devLog } from '../Shared/utils/debug';
import { RxReset } from "react-icons/rx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DisclaimerBox from '../Shared/DisclaimerBox';

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
            logs: defaultLogs
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

    return (
        <div className="space-y-8 min-h-[900px]">
            <FirstTimeVisit
                isOpen={helpDialogOpen}
                onOpenChange={setHelpDialogOpen}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                        onClick={addSite}
                        className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2 w-full sm:w-auto"
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
                            className="gap-2 w-full sm:w-auto"
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
                    console.log('Updating config with new deployment name:', newConfig);
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
            />
            
            {sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <Building className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sites Configured</h3>
                    <p className="text-gray-500 text-center mb-6">Get started by adding your first site to calculate collector requirements.</p>
                    <Button
                        onClick={addSite}
                        className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add First Site
                    </Button>
                </div>
            ) : (
                sites.map((site, index) => (
                    <EnhancedCard
                        key={`site-${index}`}
                        className="mb-4"
                    >
                        <CardHeader className="border-gray-200 bg-white">
                            {/* Mobile-friendly layout */}
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
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                                                            <Building className="w-4 h-4 text-blue-700" />
                                                        </div>
                                                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedSites.has(index) ? 'rotate-90' : ''}`} />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Click to {expandedSites.has(index) ? 'collapse' : 'expand'} site</p>
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
                                            className="w-full"
                                        />
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSite(index);
                                        }}
                                        className="text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Site
                                    </Button>
                                </div>

                                {/* Stats Grid - Full width on mobile */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {/* Polling Stats */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Server className="w-4 h-4 text-blue-700" />
                                                <span className="text-sm font-medium text-blue-900">Polling</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-sm font-semibold text-blue-700">
                                                        {(() => {
                                                            const collectors = getSiteResults(site).polling.collectors;
                                                            const count = collectors.filter(c => c.type === "Primary").length;
                                                            return count > 0 ? count : "0";
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-blue-600">
                                                        {(() => {
                                                            const count = getSiteResults(site).polling.collectors.filter(c => c.type === "Primary").length;
                                                            return count === 1 ? "collector" : "collectors";
                                                        })()}
                                                    </span>
                                                    {config.enablePollingFailover && getSiteResults(site).polling.collectors.length > 0 && (
                                                        <span className="text-xs text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Info className="w-3 h-3" />N+1
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                    <span className="text-xs text-blue-600">
                                                        {Object.values(site.devices).reduce((sum, device) => sum + (device.count || 0), 0).toLocaleString()} devices
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-12 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-600 rounded-full"
                                                                style={{ 
                                                                    width: `${Math.min(calculateAverageLoad(getSiteResults(site).polling.collectors), 100)}%`,
                                                                    backgroundColor: calculateAverageLoad(getSiteResults(site).polling.collectors) >= 80 ? '#ef4444' : 
                                                                           calculateAverageLoad(getSiteResults(site).polling.collectors) >= 60 ? '#f59e0b' : '#2563eb'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-blue-700 bg-blue-100/50 px-1.5 py-0.5 rounded">
                                                            {calculateAverageLoad(getSiteResults(site).polling.collectors)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logs Stats */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <MessageSquare className="w-4 h-4 text-orange-700" />
                                                <span className="text-sm font-medium text-orange-900">Logs</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-sm font-semibold text-orange-700">
                                                        {(() => {
                                                            const collectors = getSiteResults(site).logs.eventCollectors;
                                                            const count = collectors.filter(c => c.type === "Primary").length;
                                                            return count > 0 ? count : "0";
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-orange-600">
                                                        {(() => {
                                                            const count = getSiteResults(site).logs.eventCollectors.filter(c => c.type === "Primary").length;
                                                            return count === 1 ? "collector" : "collectors";
                                                        })()}
                                                    </span>
                                                    {config.enableLogsFailover && getSiteResults(site).logs.eventCollectors.length > 0 && (
                                                        <span className="text-xs text-orange-600 bg-orange-100/50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Info className="w-3 h-3" />N+1
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                    <span className="text-xs text-orange-600">
                                                        {site.logs.events.eps.toLocaleString()} EPS
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-12 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-orange-600 rounded-full"
                                                                style={{ 
                                                                    width: `${Math.min(calculateAverageLoad(getSiteResults(site).logs.eventCollectors), 100)}%`,
                                                                    backgroundColor: calculateAverageLoad(getSiteResults(site).logs.eventCollectors) >= 80 ? '#ef4444' : 
                                                                           calculateAverageLoad(getSiteResults(site).logs.eventCollectors) >= 60 ? '#f59e0b' : '#ea580c'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-orange-700 bg-orange-100/50 px-1.5 py-0.5 rounded">
                                                            {calculateAverageLoad(getSiteResults(site).logs.eventCollectors)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NetFlow Stats */}
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Activity className="w-4 h-4 text-purple-700" />
                                                <span className="text-sm font-medium text-purple-900">NetFlow</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-sm font-semibold text-purple-700">
                                                        {(() => {
                                                            const collectors = getSiteResults(site).logs.netflowCollectors;
                                                            const count = collectors.filter(c => c.type === "Primary").length;
                                                            return count > 0 ? count : "0";
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-purple-600">
                                                        {(() => {
                                                            const count = getSiteResults(site).logs.netflowCollectors.filter(c => c.type === "Primary").length;
                                                            return count === 1 ? "collector" : "collectors";
                                                        })()}
                                                    </span>
                                                    {config.enableLogsFailover && getSiteResults(site).logs.netflowCollectors.length > 0 && (
                                                        <span className="text-xs text-purple-600 bg-purple-100/50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Info className="w-3 h-3" />N+1
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                    <span className="text-xs text-purple-600">
                                                        {site.logs.netflow.fps.toLocaleString()} FPS
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-12 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-purple-600 rounded-full"
                                                                style={{ 
                                                                    width: `${Math.min(calculateAverageLoad(getSiteResults(site).logs.netflowCollectors), 100)}%`,
                                                                    backgroundColor: calculateAverageLoad(getSiteResults(site).logs.netflowCollectors) >= 80 ? '#ef4444' : 
                                                                           calculateAverageLoad(getSiteResults(site).logs.netflowCollectors) >= 60 ? '#f59e0b' : '#9333ea'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-purple-700 bg-purple-100/50 px-1.5 py-0.5 rounded">
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
                            <CardContent>
                                <div className="flex justify-between items-center mb-4">
                                    <Tabs defaultValue="devices" className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
                                                <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" value="devices">
                                                    Devices
                                                </TabsTrigger>
                                                <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" value="logs">
                                                    Logs, Traps & NetFlow
                                                </TabsTrigger>
                                                <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" value="collectors">
                                                    Collectors
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="devices">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold">Devices</h3>
                                                <Button
                                                    onClick={() => resetSite(index, "devices")}
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <RxReset className="w-4 h-4 mr-2" />
                                                    Reset Devices
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                <h3 className="text-lg font-semibold">Logs, Traps & NetFlow</h3>
                                                <Button
                                                    onClick={() => resetSite(index, "logs")}
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
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
            <div className="mb-6">
                <DisclaimerBox />
            </div>
        </div>
    );
};

export default SiteConfiguration;