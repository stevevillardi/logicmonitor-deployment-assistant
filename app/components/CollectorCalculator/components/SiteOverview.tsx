import React from 'react';
import { Component, Building, Server, Activity, Download, Calculator, Users, Database, Weight, HardDrive, Earth, Building2 } from 'lucide-react';
import { calculateWeightedScore } from '../utils';
import { calculateCollectors } from '../utils';
import { Site, Config } from '../types';
import { Button } from '@/components/ui/enhanced-components';
import EnhancedCard from '@/components/ui/enhanced-card';
import { Info } from 'lucide-react';
import { Router, Network, Settings, Wifi, Monitor, Cpu } from 'lucide-react';

interface SiteOverviewProps {
    sites: Site[];
    config: Config;
}

const SiteOverview = ({ sites, config }: SiteOverviewProps) => {
    const getTotalDeviceCount = (site: Site) => {
        return Object.values(site.devices).reduce((sum, device) => sum + device.count, 0);
    };

    const getTotalDevicesBySites = () => {
        return sites.reduce((sum, site) => sum + getTotalDeviceCount(site), 0);
    };

    const getTotalEPS = (site: Site) => {
        return Object.values(site.logs).reduce((sum, eps) => sum + eps, 0);
    };

    const getTotalEPSBySites = () => {
        return sites.reduce((sum, site) => sum + getTotalEPS(site), 0);
    };

    const getTotalLoadScore = () => {
        return sites.reduce((sum, site) => sum + calculateWeightedScore(site.devices, config.methodWeights), 0);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "Linux Servers":
            case "Windows Servers":
                return <Server className="w-6 h-6 text-blue-700" />;
            case "SQL Servers (Linux)":
            case "SQL Servers (Windows)":
                return <Database className="w-6 h-6 text-blue-700" />;
            case "Routers":
                return <Router className="w-6 h-6 text-blue-700" />;
            case "Switches":
                return <Network className="w-6 h-6 text-blue-700" />;
            case "Firewalls":
                return <Settings className="w-6 h-6 text-blue-700" />;
            case "SD-WAN Edges":
                return <Activity className="w-6 h-6 text-blue-700" />;
            case "Access Points":
                return <Wifi className="w-6 h-6 text-blue-700" />;
            case "Storage Arrays":
                return <HardDrive className="w-6 h-6 text-blue-700" />;
            case "vCenter VMs":
                return <Monitor className="w-6 h-6 text-blue-700" />;
            case "ESXi Hosts":
                return <Cpu className="w-6 h-6 text-blue-700" />;
            default:
                return <Server className="w-6 h-6 text-blue-700" />;
        }
    };

    const getEstimatedInstanceCount = (site: Site) => {
        return Object.entries(site.devices).reduce((sum, [_, data]) => {
            return sum + (data.count * data.instances);
        }, 0);
    };

    const getTotalInstanceCount = () => {
        return sites.reduce((sum, site) => sum + getEstimatedInstanceCount(site), 0);
    };

    const handleExportPDF = () => {
        // Add report header before printing
        const printHeader = document.createElement('div');
        printHeader.className = 'report-header print-only';
        printHeader.style.display = 'none';

        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        printHeader.innerHTML = `
        <h1 class="text-2xl font-bold text-[#040F4B] mb-2">Deployment Assistant Report</h1>
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-8">
            <img src="/lmlogo.webp" alt="LogicMonitor" class="h-12" />
            <div>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        ${currentDate}
                    </div>
                    <div class="h-4 w-px bg-gray-300"></div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        ${sites.length} Site${sites.length !== 1 ? 's' : ''}
                    </div>
                    <div class="h-4 w-px bg-gray-300"></div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        ${getTotalDevicesBySites().toLocaleString()} Device${getTotalDevicesBySites() !== 1 ? 's' : ''}
                    </div>
                    <div class="h-4 w-px bg-gray-300"></div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Load Score: ${Math.round(getTotalLoadScore()).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="bg-blue-50/50 p-4 border-b border-t border-blue-200">
        <div class="flex items-center gap-2 text-sm text-blue-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This report provides a comprehensive overview of your LogicMonitor collector deployment configuration and recommendations.
        </div>
    </div>
`;

        // Add print-specific elements
        document.body.prepend(printHeader);

        // Trigger print
        window.print();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(printHeader);
        }, 0);
    };

    const getCollectorSummary = () => {
        const collectorsBySize = {
            polling: {} as Record<string, number>,
            logs: {} as Record<string, number>
        };

        sites.forEach(site => {
            const results = calculateCollectors(
                calculateWeightedScore(site.devices, config.methodWeights),
                getTotalEPS(site),
                config.maxLoad,
                config
            );

            results.polling.collectors.forEach(collector => {
                if (collector.type === "Primary") {
                    collectorsBySize.polling[collector.size] = (collectorsBySize.polling[collector.size] || 0) + 1;
                }
            });

            results.logs.collectors.forEach(collector => {
                if (collector.type === "Primary") {
                    collectorsBySize.logs[collector.size] = (collectorsBySize.logs[collector.size] || 0) + 1;
                }
            });
        });

        if (config.enablePollingFailover) {
            sites.forEach(site => {
                const results = calculateCollectors(
                    calculateWeightedScore(site.devices, config.methodWeights),
                    getTotalEPS(site),
                    config.maxLoad,
                    config
                );
                const redundantCollector = results.polling.collectors.find(c => c.type === "N+1 Redundancy");
                if (redundantCollector) {
                    collectorsBySize.polling[redundantCollector.size] =
                        (collectorsBySize.polling[redundantCollector.size] || 0) + 1;
                }
            });
        }

        if (config.enableLogsFailover) {
            sites.forEach(site => {
                const results = calculateCollectors(
                    calculateWeightedScore(site.devices, config.methodWeights),
                    getTotalEPS(site),
                    config.maxLoad,
                    config
                );
                const redundantCollector = results.logs.collectors.find(c => c.type === "N+1 Redundancy");
                if (redundantCollector) {
                    collectorsBySize.logs[redundantCollector.size] =
                        (collectorsBySize.logs[redundantCollector.size] || 0) + 1;
                }
            });
        }

        return collectorsBySize;
    };

    const getSummaryMetrics = (site: Site) => {
        const totalWeight = calculateWeightedScore(site.devices, config.methodWeights);
        const totalEPS = getTotalEPS(site);
        const results = calculateCollectors(totalWeight, totalEPS, config.maxLoad, config);

        const collectorsBySize = {
            polling: {} as Record<string, number>,
            logs: {} as Record<string, number>
        };

        // Count polling collectors by size
        results.polling.collectors
            .filter(c => c.type === "Primary")
            .forEach(collector => {
                collectorsBySize.polling[collector.size] = (collectorsBySize.polling[collector.size] || 0) + 1;
            });

        // Count logs collectors by size
        results.logs.collectors
            .filter(c => c.type === "Primary")
            .forEach(collector => {
                collectorsBySize.logs[collector.size] = (collectorsBySize.logs[collector.size] || 0) + 1;
            });

        // Add N+1 collectors if enabled
        if (config.enablePollingFailover) {
            const redundantCollector = results.polling.collectors.find(c => c.type === "N+1 Redundancy");
            if (redundantCollector) {
                collectorsBySize.polling[redundantCollector.size] =
                    (collectorsBySize.polling[redundantCollector.size] || 0) + 1;
            }
        }

        if (config.enableLogsFailover) {
            const redundantCollector = results.logs.collectors.find(c => c.type === "N+1 Redundancy");
            if (redundantCollector) {
                collectorsBySize.logs[redundantCollector.size] =
                    (collectorsBySize.logs[redundantCollector.size] || 0) + 1;
            }
        }

        return {
            totalWeight,
            totalEPS,
            estimatedInstances: getEstimatedInstanceCount(site),
            collectorsBySize,
            avgPollingLoad: Math.round(
                results.polling.collectors
                    .filter(c => c.type === "Primary")
                    .reduce((sum, c) => sum + c.load, 0) /
                results.polling.collectors.filter(c => c.type === "Primary").length || 0
            ),
            avgLogsLoad: Math.round(
                results.logs.collectors
                    .filter(c => c.type === "Primary")
                    .reduce((sum, c) => sum + c.load, 0) /
                results.logs.collectors.filter(c => c.type === "Primary").length || 0
            )
        };
    };

    const getLoadColor = (load: number) => {
        if (load >= 80) return "text-red-600";
        if (load >= 60) return "text-yellow-600";
        return "text-emerald-600";
    };

    const renderCollectorSizeSummary = (collectors: Record<string, number>) => {
        return Object.entries(collectors)
            .sort(([sizeA], [sizeB]) => {
                const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
            })
            .map(([size, count]) => (
                <div key={size} className="flex items-center gap-2">
                    <span className="font-medium">{size}</span>
                    <span className="text-gray-600">×</span>
                    <span className="font-medium text-blue-700">{count}</span>
                </div>
            ));
    };

    const calculateDeviceGroupMetrics = (site: Site, deviceType: string, data: any) => {
        const totalLoad = Object.entries(data.methods).reduce((total, [method, ratio]) => {
            return total + (data.instances * (ratio as number) * config.methodWeights[method] * data.count);
        }, 0);

        const totalInstances = data.instances * data.count;

        return { totalLoad, totalInstances };
    };

    const globalCollectorSummary = getCollectorSummary();

    return (
        <div className="space-y-6 overflow-y-auto min-h-[800px]">
        <EnhancedCard className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300 ">
            <div className="p-6 space-y-6">
                {/* Global Section */}
                <div className="space-y-6">
                    {/* Global Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                            <Earth className="w-7 h-7 text-blue-700 mt-1" />
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">{config.deploymentName || "Deployment Configuration"}</h2>
                                <p className="text-sm text-gray-500 mt-1">Global Collector Distribution</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleExportPDF}
                            className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2 no-print"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>
                    </div>

                    {/* Global Content with Border */}
                    <div className="border border-blue-200 rounded-lg p-6 space-y-6">
                        {/* Global Metrics */}
                        <div className="grid grid-cols-5 gap-2">
                            {/* Total Sites */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building className="w-4 h-4 text-blue-700" />
                                    <span className="text-sm text-blue-900">Sites</span>
                                </div>
                                <p className="text-lg font-bold text-blue-700">
                                    {sites.length.toLocaleString()}
                                </p>
                            </div>

                            {/* Total Devices */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Server className="w-4 h-4 text-blue-700" />
                                    <span className="text-sm text-blue-900">Devices</span>
                                </div>
                                <p className="text-lg font-bold text-blue-700">
                                    {getTotalDevicesBySites().toLocaleString()}
                                </p>
                            </div>

                            {/* Total Instances */}
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Component className="w-4 h-4 text-indigo-700" />
                                    <span className="text-sm text-indigo-900">Instances</span>
                                </div>
                                <p className="text-lg font-bold text-indigo-700">
                                    {getTotalInstanceCount().toLocaleString()}
                                </p>
                            </div>

                            {/* Total Load Score */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Weight className="w-4 h-4 text-purple-700" />
                                    <span className="text-sm text-purple-900">Load Score</span>
                                </div>
                                <p className="text-lg font-bold text-purple-700">
                                    {Math.round(getTotalLoadScore()).toLocaleString()}
                                </p>
                            </div>

                            {/* Total EPS */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="w-4 h-4 text-orange-700" />
                                    <span className="text-sm text-orange-900">Events Per Second</span>
                                </div>
                                <p className="text-lg font-bold text-orange-700">
                                    {getTotalEPSBySites().toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Global Collector Distribution */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Polling Collectors */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Server className="w-4 h-4 text-blue-700" />
                                        <h3 className="font-medium text-blue-900">Polling Collectors</h3>
                                    </div>
                                    {config.enablePollingFailover &&
                                        (Object.entries(globalCollectorSummary.polling).reduce((sum, [_, count]) => sum + count, 0) > 1) && (
                                            <div className="flex items-center gap-1 text-xs text-blue-700">
                                                <Info className="w-3 h-3" />
                                                <span>N+1 enabled</span>
                                            </div>
                                        )}
                                </div>
                                {Object.keys(globalCollectorSummary.polling).length > 0 ? (
                                    <div className="space-y-1.5">
                                        {Object.entries(globalCollectorSummary.polling)
                                            .sort(([sizeA], [sizeB]) => {
                                                const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                                return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                            })
                                            .map(([size, count]) => (
                                                <div key={size} className="flex items-center justify-between p-2 bg-white border border-blue-100 rounded-lg hover:bg-blue-50/50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                                            <Server className="w-3 h-3 text-blue-700" />
                                                        </div>
                                                        <span className="text-sm font-medium text-blue-900">{size}</span>
                                                    </div>
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                        {count}x
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-blue-100 rounded-lg text-blue-500 text-sm">
                                        <Server className="w-4 h-4" />
                                        <span>No collectors required</span>
                                    </div>
                                )}
                            </div>

                            {/* Logs/NetFlow Collectors */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-orange-700" />
                                        <h3 className="font-medium text-orange-900">Logs/NetFlow Collectors</h3>
                                    </div>
                                    {config.enableLogsFailover &&
                                        (Object.entries(globalCollectorSummary.logs).reduce((sum, [_, count]) => sum + count, 0) > 1) && (
                                            <div className="flex items-center gap-1 text-xs text-orange-700">
                                                <Info className="w-3 h-3" />
                                                <span>N+1 enabled</span>
                                            </div>
                                        )}
                                </div>
                                {Object.keys(globalCollectorSummary.logs).length > 0 ? (
                                    <div className="space-y-1.5">
                                        {Object.entries(globalCollectorSummary.logs)
                                            .sort(([sizeA], [sizeB]) => {
                                                const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                                return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                            })
                                            .map(([size, count]) => (
                                                <div key={size} className="flex items-center justify-between p-2 bg-white border border-orange-100 rounded-lg hover:bg-orange-50/50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                                                            <Activity className="w-3 h-3 text-orange-700" />
                                                        </div>
                                                        <span className="text-sm font-medium text-orange-900">{size}</span>
                                                    </div>
                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                                        {count}x
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-orange-100 rounded-lg text-orange-500 text-sm">
                                        <Activity className="w-4 h-4" />
                                        <span>No collectors required</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200" />

                {/* Sites Section */}
                <div className="space-y-6">
                    {/* Sites Header */}
                    <div className="flex items-center gap-3">
                        <Building2 className="w-7 h-7 text-blue-700" />
                        <h2 className="text-2xl font-semibold text-gray-900">Site Distribution ({sites.length} sites)</h2>
                    </div>

                    {/* Sites List */}
                    <div className="space-y-4">
                        {sites.map((site, index) => {
                            const metrics = getSummaryMetrics(site);
                            return (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                                    {/* Site Header */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <Building className="w-5 h-5 text-blue-700" />
                                        <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                                    </div>

                                    {/* Site Content */}
                                    <div className="space-y-4">
                                        {/* Site Metrics */}
                                        <div className="grid grid-cols-6 gap-2">
                                            {/* Total Devices */}
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Server className="w-4 h-4 text-blue-700" />
                                                    <span className="text-sm text-blue-900">Devices</span>
                                                </div>
                                                <p className="text-lg font-bold text-blue-700">
                                                    {getTotalDeviceCount(site).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Estimated Instances */}
                                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Component className="w-4 h-4 text-indigo-700" />
                                                    <span className="text-sm text-indigo-900">Instances</span>
                                                </div>
                                                <p className="text-lg font-bold text-indigo-700">
                                                    {metrics.estimatedInstances.toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Estimated Load */}
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Weight className="w-4 h-4 text-purple-700" />
                                                    <span className="text-sm text-purple-900">Load Score</span>
                                                </div>
                                                <p className="text-lg font-bold text-purple-700">
                                                    {Math.round(metrics.totalWeight).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Estimated EPS */}
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Activity className="w-4 h-4 text-orange-700" />
                                                    <span className="text-sm text-orange-900">Events Per Second</span>
                                                </div>
                                                <p className="text-lg font-bold text-orange-700">
                                                    {getTotalEPS(site).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Polling Load */}
                                            <div className={`rounded-lg p-3 ${getLoadColor(metrics.avgPollingLoad).includes('text-red') ? 'bg-red-50 border border-red-200' :
                                                getLoadColor(metrics.avgPollingLoad).includes('text-yellow') ? 'bg-yellow-50 border border-yellow-200' :
                                                    'bg-emerald-50 border-emerald-200 border'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Server className="w-4 h-4 text-gray-700" />
                                                    <span className="text-sm text-gray-900">Polling Load</span>
                                                </div>
                                                <p className={`text-lg font-bold ${getLoadColor(metrics.avgPollingLoad)}`}>
                                                    {metrics.avgPollingLoad}%
                                                </p>
                                            </div>

                                            {/* Logs Load */}
                                            <div className={`rounded-lg p-3 ${getLoadColor(metrics.avgLogsLoad).includes('text-red') ? 'bg-red-50 border border-red-200' :
                                                getLoadColor(metrics.avgLogsLoad).includes('text-yellow') ? 'bg-yellow-50 border border-yellow-200' :
                                                    'bg-emerald-50 border border-emerald-200'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Activity className="w-4 h-4 text-gray-700" />
                                                    <span className="text-sm text-gray-900">Logs Load</span>
                                                </div>
                                                <p className={`text-lg font-bold ${getLoadColor(metrics.avgLogsLoad)}`}>
                                                    {metrics.avgLogsLoad}%
                                                </p>
                                            </div>
                                        </div>

                                        {/* Site Collector Distribution */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Server className="w-4 h-4 text-blue-700" />
                                                        <h3 className="font-medium text-blue-900">Polling Collectors</h3>
                                                    </div>
                                                    {config.enablePollingFailover && metrics.avgPollingLoad > 0 && (
                                                        <div className="flex items-center gap-1 text-xs text-blue-700">
                                                            <Info className="w-3 h-3" />
                                                            <span>N+1 enabled</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {metrics.avgPollingLoad > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {Object.entries(metrics.collectorsBySize?.polling || {})
                                                            .sort(([sizeA], [sizeB]) => {
                                                                const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                                                return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                                            })
                                                            .map(([size, count]) => (
                                                                <div key={size} className="flex items-center justify-between p-2 bg-white border border-blue-100 rounded-lg hover:bg-blue-50/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                                                            <Server className="w-3 h-3 text-blue-700" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-blue-900">{size}</span>
                                                                    </div>
                                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                                        {count}x
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 p-2 bg-white border border-blue-100 rounded-lg text-blue-500 text-sm">
                                                        <Server className="w-4 h-4" />
                                                        <span>No collectors required</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-orange-700" />
                                                        <h3 className="font-medium text-orange-900">Logs/NetFlow Collectors</h3>
                                                    </div>
                                                    {config.enableLogsFailover && metrics.avgLogsLoad > 0 && (
                                                        <div className="flex items-center gap-1 text-xs text-orange-700">
                                                            <Info className="w-3 h-3" />
                                                            <span>N+1 enabled</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {metrics.avgLogsLoad > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {Object.entries(metrics.collectorsBySize?.logs || {})
                                                            .sort(([sizeA], [sizeB]) => {
                                                                const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                                                return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                                            })
                                                            .map(([size, count]) => (
                                                                <div key={size} className="flex items-center justify-between p-2 bg-white border border-orange-100 rounded-lg hover:bg-orange-50/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                                                                            <Activity className="w-3 h-3 text-orange-700" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-orange-900">{size}</span>
                                                                    </div>
                                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                                                        {count}x
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 p-2 bg-white border border-orange-100 rounded-lg text-orange-500 text-sm">
                                                        <Activity className="w-4 h-4" />
                                                        <span>No collectors required</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Device Distribution */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Device Distribution</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {Object.entries(site.devices)
                                                    .filter(([_, data]) => data.count > 0)
                                                    .map(([type, data]) => {
                                                        const groupMetrics = calculateDeviceGroupMetrics(site, type, data);
                                                        const DeviceIcon = getIcon(type);
                                                        return (
                                                            <div
                                                                key={type}
                                                                className="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-300"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                                        {DeviceIcon}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium text-gray-900 text-sm truncate">{type}</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-gray-600">
                                                                            <div className="flex items-center gap-1">
                                                                                <HardDrive className="w-3 h-3 text-blue-700" />
                                                                                <span>Devices: {data.count}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Weight className="w-3 h-3 text-blue-700" />
                                                                                <span>Weight: {Math.round(groupMetrics.totalLoad).toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Component className="w-3 h-3 text-blue-700" />
                                                                                <span>Inst: {groupMetrics.totalInstances.toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </EnhancedCard>
        </div>
    );
};

export default SiteOverview;