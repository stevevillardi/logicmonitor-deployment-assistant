import { Site, Config } from '../types';
import { useState, useEffect, useCallback } from 'react';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button, Input } from '@/components/ui/enhanced-components'
import { Server, Activity, Building, Trash2, RotateCcw } from 'lucide-react';
import { calculateWeightedScore } from '../utils';
import { calculateCollectors } from '../utils';
import { DeviceTypeCard } from './DeviceTypeCardInput';
import { LogsInput } from './LogsInput';
import { CollectorVisualization } from './CollectorVisualization';
import EnhancedCard from '@/components/ui/enhanced-card';
import ConfigurationActions from './ConfigurationActions';
import { Plus, ChevronUp, ChevronDown, HardDrive, HelpCircle, Bolt } from 'lucide-react';
import { FirstTimeVisit } from './FirstTimeVisit';
import DeploymentNameInput from './DeploymentNameInput';
import { devLog } from '@/utils/debug';
import { RxReset } from "react-icons/rx";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SiteConfigurationProps {
    sites: Site[];
    onUpdateSites: (sites: Site[]) => void;
    onUpdateConfig: (config: Config) => void;
    config: Config;
    onSiteExpand: (expandedSites: Set<number>) => void;
    expandedSites: Set<number>;
}

export const SiteConfiguration = ({ sites, onUpdateSites, onUpdateConfig, config, onSiteExpand }: SiteConfigurationProps) => {
    devLog('SiteConfiguration received config:', config);
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

    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    const getSiteResults = useCallback((site: Site) => {
        const totalWeight = calculateWeightedScore(site.devices, config.methodWeights);
        const totalEPS = Object.values(site.logs).reduce((sum, eps) => sum + eps, 0);
        return calculateCollectors(totalWeight, totalEPS, config.maxLoad, config);
    }, [config]);

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
        const newSite = {
            name: "",
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

        // Clear all expanded sites
        setExpandedSites(new Set());

        // Add new site to the beginning of the array
        onUpdateSites([newSite, ...sites]);

        // After a brief delay, expand the new site (now at index 0)
        setTimeout(() => {
            setExpandedSites(new Set([0]));
        }, 100);
    };

    const deleteSite = (index: number) => {
        onUpdateSites(sites.filter((_, i) => i !== index));
    };

    useEffect(() => {
        console.log('Config updated in SiteConfiguration:', config);
    }, [config]);

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
                                setExpandedSites(new Set(shouldExpandAll ? allSiteIndexes : []));
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
                    onSiteExpand={setExpandedSites}
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
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                {/* Site Name Section - Clickable */}
                                <div 
                                    className="flex-none sm:min-w-[200px] sm:max-w-[300px] w-full"
                                    onClick={() => toggleSite(index)}
                                >
                                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                                                        <Building className="w-4 h-4 text-blue-700" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white border border-gray-200 text-gray-900 shadow-sm">
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
                                            placeholder={`Site ${index + 1}`}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Stats Grid - Not Clickable */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
                                        {/* Polling Collectors */}
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg w-full">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                                <Server className="w-4 h-4 text-blue-700" />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium text-blue-900 truncate">
                                                        {getSiteResults(site).polling.collectors.filter(c => c.type === "Primary").length}x Polling
                                                    </span>
                                                </div>
                                                {config.enablePollingFailover && (
                                                    <span className="text-xs text-blue-700">
                                                        +1 Redundant
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Netflow/Logs Collectors */}
                                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg w-full">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                                <Activity className="w-4 h-4 text-orange-700" />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium text-orange-900 truncate">
                                                        {getSiteResults(site).logs.collectors.filter(c => c.type === "Primary").length}x Logs
                                                    </span>
                                                </div>
                                                {config.enableLogsFailover && (
                                                    <span className="text-xs text-orange-700">
                                                        +1 Redundant
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Average Load */}
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                            calculateAverageLoad(getSiteResults(site).polling.collectors) >= 80
                                                ? "bg-red-50 border-red-200"
                                                : calculateAverageLoad(getSiteResults(site).polling.collectors) >= 60
                                                    ? "bg-yellow-50 border-yellow-200"
                                                    : "bg-emerald-50 border-emerald-200"
                                        }`}>
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                <Bolt className={`w-4 h-4 ${
                                                    calculateAverageLoad(getSiteResults(site).polling.collectors) >= 80
                                                        ? "text-red-700"
                                                        : calculateAverageLoad(getSiteResults(site).polling.collectors) >= 60
                                                            ? "text-yellow-700"
                                                            : "text-emerald-700"
                                                }`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-medium ${
                                                    calculateAverageLoad(getSiteResults(site).polling.collectors) >= 80
                                                        ? "text-red-900"
                                                        : calculateAverageLoad(getSiteResults(site).polling.collectors) >= 60
                                                            ? "text-yellow-900"
                                                            : "text-emerald-900"
                                                }`}>Average Load</span>
                                                <span className={`text-xs ${
                                                    calculateAverageLoad(getSiteResults(site).polling.collectors) >= 80
                                                        ? "text-red-700"
                                                        : calculateAverageLoad(getSiteResults(site).polling.collectors) >= 60
                                                            ? "text-yellow-700"
                                                            : "text-emerald-700"
                                                }`}>
                                                    {calculateAverageLoad(getSiteResults(site).polling.collectors)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Device Count */}
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                <HardDrive className="w-4 h-4 text-blue-700" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-blue-900">
                                                    {Object.values(site.devices).reduce(
                                                        (sum, device) => sum + (device.count || 0),
                                                        0
                                                    )}{" "}
                                                    Devices
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <Button
                                        variant="outline"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 w-full sm:w-auto shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Site
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        {expandedSites.has(index) && (
                            <CardContent>
                                <Tabs defaultValue="devices">
                                    <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
                                        <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" value="devices">Devices</TabsTrigger>
                                        <TabsTrigger className="rounded px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" value="logs">Logs & NetFlow</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="devices" className="mt-4">
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
                                                    onUpdate={(newCount) => {
                                                        const newSites = [...sites];
                                                        newSites[index].devices[type].count = newCount;
                                                        onUpdateSites(newSites);
                                                    }}
                                                    showDetails={config.showDetails}
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
                                    {(() => {
                                        const siteResults = getSiteResults(site);
                                        const totalPollingLoad = calculateWeightedScore(site.devices, config.methodWeights);
                                        const totalLogsLoad = Object.values(site.logs).reduce((sum, eps) => sum + eps, 0);

                                        devLog('Site Results Detail:', {
                                            polling: {
                                                collectors: siteResults.polling.collectors.map(c => ({
                                                    size: c.size,
                                                    type: c.type,
                                                    load: c.load
                                                })),
                                                totalLoad: totalPollingLoad
                                            },
                                            logs: {
                                                collectors: siteResults.logs.collectors.map(c => ({
                                                    size: c.size,
                                                    type: c.type,
                                                    load: c.load
                                                })),
                                                totalLoad: totalLogsLoad
                                            }
                                        });

                                        return (
                                            <CollectorVisualization
                                                polling={siteResults.polling}
                                                logs={siteResults.logs}
                                                totalPollingLoad={totalPollingLoad}
                                                totalLogsLoad={totalLogsLoad}
                                            />
                                        );
                                    })()}
                                </div>
                            </CardContent>
                        )}
                    </EnhancedCard>
                ))
            )}
        </div>
    );
};

export default SiteConfiguration;