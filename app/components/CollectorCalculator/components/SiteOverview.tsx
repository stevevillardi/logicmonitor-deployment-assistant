import React from 'react';
import { Building, Server, Activity, Download, Calculator, Users, Database, Weight, HardDrive, Earth } from 'lucide-react';
import { calculateWeightedScore } from '../utils';
import { calculateCollectors } from '../utils';
import { Site, Config } from '../types';
import { Button } from '@/components/ui/enhanced-components';
import EnhancedCard from '@/components/ui/enhanced-card';

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

            // Count polling collectors by size
            results.polling.collectors.forEach(collector => {
                if (collector.type === "Primary") {
                    collectorsBySize.polling[collector.size] = (collectorsBySize.polling[collector.size] || 0) + 1;
                }
            });

            // Count logs collectors by size
            results.logs.collectors.forEach(collector => {
                if (collector.type === "Primary") {
                    collectorsBySize.logs[collector.size] = (collectorsBySize.logs[collector.size] || 0) + 1;
                }
            });
        });

        // Add N+1 collectors to the counts
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

        // Count primary collectors by size
        results.polling.collectors
            .filter(c => c.type === "Primary")
            .forEach(c => {
                collectorsBySize.polling[c.size] = (collectorsBySize.polling[c.size] || 0) + 1;
            });

        results.logs.collectors
            .filter(c => c.type === "Primary")
            .forEach(c => {
                collectorsBySize.logs[c.size] = (collectorsBySize.logs[c.size] || 0) + 1;
            });

        // Add N+1 collectors
        const redundantPolling = results.polling.collectors.find(c => c.type === "N+1 Redundancy");
        if (redundantPolling) {
            collectorsBySize.polling[redundantPolling.size] =
                (collectorsBySize.polling[redundantPolling.size] || 0) + 1;
        }

        const redundantLogs = results.logs.collectors.find(c => c.type === "N+1 Redundancy");
        if (redundantLogs) {
            collectorsBySize.logs[redundantLogs.size] =
                (collectorsBySize.logs[redundantLogs.size] || 0) + 1;
        }

        return {
            totalWeight,
            totalEPS,
            collectorsBySize,
            avgPollingLoad: Math.round(
                results.polling.collectors
                    .filter(c => c.type === "Primary")
                    .reduce((sum, c) => sum + c.load, 0) /
                results.polling.collectors.filter(c => c.type === "Primary").length
            ),
            avgLogsLoad: Math.round(
                results.logs.collectors
                    .filter(c => c.type === "Primary")
                    .reduce((sum, c) => sum + c.load, 0) /
                results.logs.collectors.filter(c => c.type === "Primary").length
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

    const globalCollectorSummary = getCollectorSummary();

    return (
        <div className="space-y-6">
            {/* Global Summary */}
            <div className="grid grid-cols-4 gap-4">
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
                        <h3 className="font-medium text-purple-900">Total Collectors</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                        {(Object.values(globalCollectorSummary.polling).reduce((a, b) => a + b, 0) +
                            Object.values(globalCollectorSummary.logs).reduce((a, b) => a + b, 0)).toLocaleString()}
                    </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-orange-700" />
                        <h3 className="font-medium text-orange-900">Total EPS</h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                        {getTotalEPSBySites().toLocaleString()}
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
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Server className="w-5 h-5 text-blue-700" />
                                <h3 className="font-medium text-gray-900">Polling Collectors</h3>
                            </div>
                            <div className="space-y-2">
                                {renderCollectorSizeSummary(globalCollectorSummary.polling)}
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-blue-700" />
                                <h3 className="font-medium text-gray-900">Logs/NetFlow Collectors</h3>
                            </div>
                            <div className="space-y-2">
                                {renderCollectorSizeSummary(globalCollectorSummary.logs)}
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
                                <div className="flex items-center gap-3 ">
                                    <Building className="w-6 h-6 text-blue-700" />
                                    <h2 className="text-xl font-bold text-gray-900">{site.name}</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Site Metrics */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calculator className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Load Score</span>
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
                                                <Activity className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Total EPS</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {getTotalEPS(site).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Weight className="w-5 h-5 text-blue-700" />
                                                <span className="text-sm text-gray-600">Avg Load</span>
                                            </div>
                                            <div className="space-y-1">
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
                                                {renderCollectorSizeSummary(metrics.collectorsBySize.polling)}
                                                {config.enablePollingFailover && (
                                                    <div className="text-sm text-gray-600 mt-2">
                                                        Includes N+1 redundancy collector
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
                                                {renderCollectorSizeSummary(metrics.collectorsBySize.logs)}
                                                {config.enableLogsFailover && (
                                                    <div className="text-sm text-gray-600 mt-2">
                                                        Includes N+1 redundancy collector
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
                                                    const deviceLoad = Object.entries(data.methods).reduce(
                                                        (total, [method, ratio]) =>
                                                            total + (data.instances * ratio * config.methodWeights[method]),
                                                        0
                                                    );

                                                    return (
                                                        <div
                                                            key={type}
                                                            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-medium text-gray-900">{type}</span>
                                                                <span className="text-gray-600">{data.count} devices</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Weight className="w-4 h-4" />
                                                                <span>Load per device: {Math.round(deviceLoad * 10) / 10}</span>
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