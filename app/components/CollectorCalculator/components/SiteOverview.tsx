import React from 'react';
import { Component, Building, Server, Activity, Download, Calculator, Users, Database, Weight, HardDrive, Earth } from 'lucide-react';
import { calculateWeightedScore } from '../utils';
import { calculateCollectors } from '../utils';
import { Site, Config } from '../types';
import { Button } from '@/components/ui/enhanced-components';
import EnhancedCard from '@/components/ui/enhanced-card';
import { Info } from 'lucide-react';

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

    const getEstimatedInstanceCount = (site: Site) => {
        return Object.entries(site.devices).reduce((sum, [_, data]) => {
            return sum + (data.count * data.instances);
        }, 0);
    };

    const getTotalInstanceCount = () => {
        return sites.reduce((sum, site) => sum + getEstimatedInstanceCount(site), 0);
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
            return total + (data.instances * ratio * config.methodWeights[method] * data.count);
        }, 0);

        const totalInstances = data.instances * data.count;

        return { totalLoad, totalInstances };
    };

    const globalCollectorSummary = getCollectorSummary();

    return (
        <div className="space-y-6">
            {/* Global Summary */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building className="w-5 h-5 text-blue-700" />
                        <h3 className="font-medium text-blue-900">Total Sites</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{sites.length}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-emerald-700" />
                        <h3 className="font-medium text-emerald-900">Total Devices</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                        {getTotalDevicesBySites().toLocaleString()}
                    </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Server className="w-5 h-5 text-purple-700" />
                        <h3 className="font-medium text-purple-900">Estimated Load Score</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                        {Math.round(getTotalLoadScore()).toLocaleString()}
                    </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-orange-700" />
                        <h3 className="font-medium text-orange-900">Estimated EPS</h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                        {getTotalEPSBySites().toLocaleString()}
                    </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Component className="w-5 h-5 text-indigo-700" />
                        <h3 className="font-medium text-indigo-900">Estimated Instances</h3>
                    </div>
                    <p className="text-2xl font-bold text-indigo-700">
                        {getTotalInstanceCount().toLocaleString()}
                    </p>
                </div>
            </div>

{/* Global Collector Distribution */}
<EnhancedCard className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
    <div className="border-b border-gray-200 bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Earth className="w-6 h-6 text-blue-700" />
                <h2 className="text-xl font-bold text-gray-900">Global Collector Distribution</h2>
            </div>
            <Button
                onClick={() => window.print()}
                className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2"
            >
                <Download className="w-4 h-4" />
                Export PDF
            </Button>
        </div>
    </div>
    <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Server className="w-5 h-5 text-blue-700" />
                    <h3 className="font-medium text-gray-900">Polling Collectors</h3>
                </div>
                <div className="space-y-2">
                    {Object.keys(globalCollectorSummary.polling).length > 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                            {Object.entries(globalCollectorSummary.polling)
                                .sort(([sizeA], [sizeB]) => {
                                    const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                    return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                })
                                .map(([size, count]) => (
                                    <div key={size} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Server className="w-4 h-4 text-blue-700" />
                                            </div>
                                            <span className="font-medium text-gray-900">{size}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                            {count} {count === 1 ? 'collector' : 'collectors'}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <Server className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium mb-1">No Collectors Required</p>
                            <p className="text-gray-500 text-sm text-center">Add devices to sites to see collector requirements</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-700" />
                    <h3 className="font-medium text-gray-900">Logs/NetFlow Collectors</h3>
                </div>
                <div className="space-y-2">
                    {Object.keys(globalCollectorSummary.logs).length > 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                            {Object.entries(globalCollectorSummary.logs)
                                .sort(([sizeA], [sizeB]) => {
                                    const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                    return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                })
                                .map(([size, count]) => (
                                    <div key={size} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-blue-700" />
                                            </div>
                                            <span className="font-medium text-gray-900">{size}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                            {count} {count === 1 ? 'collector' : 'collectors'}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <Activity className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium mb-1">No Collectors Required</p>
                            <p className="text-gray-500 text-sm text-center">Configure logs collection to see requirements</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
</EnhancedCard>

            {/* Site Details */}
            <div className="space-y-6">
                {sites.map((site, index) => {
                    const metrics = getSummaryMetrics(site);

                    return (
                        <EnhancedCard key={index} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className="border-b border-gray-200 bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Building className="w-6 h-6 text-blue-700" />
                                    <h2 className="text-xl font-bold text-gray-900">{site.name}</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Site Metrics */}
                                    {/* Site Metrics */}
                                    <div className="grid grid-cols-5 gap-4">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calculator className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Estimated Load Score</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {Math.round(metrics.totalWeight).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Database className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Total Devices</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {getTotalDeviceCount(site).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Component className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Estimated Instances</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {metrics.estimatedInstances.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Estimated EPS</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {getTotalEPS(site).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Weight className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Estimated Avg Load</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Polling</span>
                                                    <span className={`font-medium ${getLoadColor(metrics.avgPollingLoad)}`}>
                                                        {metrics.avgPollingLoad}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Logs</span>
                                                    <span className={`font-medium ${getLoadColor(metrics.avgLogsLoad)}`}>
                                                        {metrics.avgLogsLoad}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

{/* Site Collector Distribution */}
<div className="grid grid-cols-2 gap-4">
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-blue-700" />
            <h3 className="font-medium text-gray-900">Polling Collectors</h3>
        </div>
        <div className="space-y-2">
            {metrics.avgPollingLoad > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                    {Object.entries(metrics.collectorsBySize?.polling || {})
                        .sort(([sizeA], [sizeB]) => {
                            const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                            return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                        })
                        .map(([size, count]) => (
                            <div key={size} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Server className="w-4 h-4 text-blue-700" />
                                    </div>
                                    <span className="font-medium text-gray-900">{size}</span>
                                </div>
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {count} {count === 1 ? 'collector' : 'collectors'}
                                </div>
                            </div>
                        ))}
                    {config.enablePollingFailover && (
                        <div className="flex items-center gap-2 mt-2 p-2 text-sm text-blue-700 bg-blue-50 rounded-lg">
                            <Info className="w-4 h-4" />
                            <span>Includes N+1 redundancy collector</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <Server className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No Collectors Required</p>
                    <p className="text-gray-500 text-sm text-center">Add devices to see collector requirements</p>
                </div>
            )}
        </div>
    </div>
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-700" />
            <h3 className="font-medium text-gray-900">Logs/NetFlow Collectors</h3>
        </div>
        <div className="space-y-2">
            {metrics.avgLogsLoad > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                    {Object.entries(metrics.collectorsBySize?.logs || {})
                        .sort(([sizeA], [sizeB]) => {
                            const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                            return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                        })
                        .map(([size, count]) => (
                            <div key={size} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-blue-700" />
                                    </div>
                                    <span className="font-medium text-gray-900">{size}</span>
                                </div>
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {count} {count === 1 ? 'collector' : 'collectors'}
                                </div>
                            </div>
                        ))}
                    {config.enableLogsFailover && (
                        <div className="flex items-center gap-2 mt-2 p-2 text-sm text-blue-700 bg-blue-50 rounded-lg">
                            <Info className="w-4 h-4" />
                            <span>Includes N+1 redundancy collector</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No Collectors Required</p>
                    <p className="text-gray-500 text-sm text-center">Configure logs collection to see requirements</p>
                </div>
            )}
        </div>
    </div>
</div>

                                    {/* Device Types */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {Object.entries(site.devices)
                                                .filter(([_, data]) => data.count > 0)
                                                .map(([type, data]) => {
                                                    const groupMetrics = calculateDeviceGroupMetrics(site, type, data);

                                                    return (
                                                        <div
                                                            key={type}
                                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                                                        >
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                                        <Server className="w-4 h-4 text-blue-700" />
                                                                    </div>
                                                                    <span className="font-medium text-gray-900">{type}</span>
                                                                </div>
                                                                <div className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                                                    {data.count} devices
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Weight className="w-4 h-4 text-blue-700" />
                                                                        <span className="text-sm text-gray-600">Estimated Group Load</span>
                                                                    </div>
                                                                    <p className="text-lg font-semibold text-blue-700">
                                                                        {Math.round(groupMetrics.totalLoad).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Component className="w-4 h-4 text-blue-700" />
                                                                        <span className="text-sm text-gray-600">Estimated Instances</span>
                                                                    </div>
                                                                    <p className="text-lg font-semibold text-blue-700">
                                                                        {groupMetrics.totalInstances.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </EnhancedCard>
                    );
                })}
            </div>
        </div>
    );
};

export default SiteOverview;