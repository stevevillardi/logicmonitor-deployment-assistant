import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Component, Building, Server, Activity, Download, Database, Weight, HardDrive, Earth, Building2, LucideIcon, MessageSquare } from 'lucide-react';
import { calculateWeightedScore } from '../DeploymentAssistant/utils/utils';
import { calculateCollectors } from '../DeploymentAssistant/utils/utils';
import { Site, Config } from '../DeploymentAssistant/types/types';
import { Button } from '@/components/ui/enhanced-components';
import EnhancedCard from '@/components/ui/enhanced-card';
import { Info } from 'lucide-react';
import ReactDOM from 'react-dom/client';
import PDFTemplate from './PDFTemplate';
import ComputeRequirements from './ComputeRequirements';
import DisclaimerBox from '../Shared/DisclaimerBox';
import CollectorRecommendation from '../Shared/CollectorRecommendation';

interface SiteOverviewProps {
    sites: Site[];
    config: Config;
}

const calculateAverageLoad = (collectors: Array<{ load: number }>) => {
    if (!collectors.length) return 0;
    return Math.round(collectors.reduce((sum, c) => sum + c.load, 0) / collectors.length);
};

const countCollectorsBySize = (collectors: Array<{ size: string }>) => {
    return collectors.reduce((acc, c) => {
        acc[c.size] = (acc[c.size] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
};

const SiteOverview: React.FC<SiteOverviewProps> = ({ sites, config }) => {
    const currentDate = new Date().toLocaleDateString();

    const getTotalDeviceCount = (site: Site) => {
        return Object.values(site.devices).reduce((sum, device) => sum + device.count, 0);
    };

    const getTotalDevicesBySites = () => {
        return sites.reduce((sum, site) => sum + getTotalDeviceCount(site), 0);
    };

    const getTotalEPS = (site: Site) => {
        return site.logs.events.eps + site.logs.netflow.fps;
    };

    const getTotalEPSBySites = () => {
        return sites.reduce((sum, site) => sum + getTotalEPS(site), 0);
    };

    const totalLoadScore = useMemo(() =>
        sites.reduce((sum, site) =>
            sum + calculateWeightedScore(site.devices, config.methodWeights, config), 0
        ), [sites, config]
    );

    const getEstimatedInstanceCount = (site: Site) => {
        return Object.entries(site.devices).reduce((sum, [_, data]) => {
            return sum + (data.count * data.instances);
        }, 0);
    };

    const getTotalInstanceCount = () => {
        return sites.reduce((sum, site) => sum + getEstimatedInstanceCount(site), 0);
    };

    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Add base HTML structure with Tailwind CDN
        printWindow.document.write(`
            <html>
                <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        * { font-family: 'Inter', sans-serif; }
                        @media print { 
                            @page { size: A4; margin: 20mm; }
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div id="pdf-root"></div>
                </body>
            </html>
        `);

        // Wait for document to be ready
        printWindow.document.close();

        const renderContent = () => {
            const container = printWindow.document.getElementById('pdf-root');
            if (container) {
                const root = ReactDOM.createRoot(container);
                root.render(
                    <PDFTemplate
                        sites={sites}
                        config={config}
                        currentDate={currentDate}
                        siteMetrics={siteMetrics}
                    />
                );

                setTimeout(() => {
                    printWindow.print();
                    printWindow.onafterprint = () => printWindow.close();
                }, 1000);
            }
        };

        if (printWindow.document.readyState === 'complete') {
            renderContent();
        } else {
            printWindow.onload = renderContent;
        }
    };

    const getCollectorSummary = () => {
        const collectorsBySize = {
            polling: {} as Record<string, number>,
            logs: {} as Record<string, number>,
            netflow: {} as Record<string, number>
        };

        // First count primary collectors
        sites.forEach(site => {
            const results = calculateCollectors(
                calculateWeightedScore(site.devices, config.methodWeights, config),
                { events: site.logs.events.eps, netflow: site.logs.netflow.fps },
                config.maxLoad,
                config
            );

            results.polling.collectors.forEach((collector: { type: string; size: string }) => {
                if (collector.type === "Primary") {
                    collectorsBySize.polling[collector.size] = (collectorsBySize.polling[collector.size] || 0) + 1;
                }
            });

            results.logs.eventCollectors.forEach((collector: { type: string; size: string }) => {
                if (collector.type === "Primary") {
                    collectorsBySize.logs[collector.size] = (collectorsBySize.logs[collector.size] || 0) + 1;
                }
            });

            results.logs.netflowCollectors.forEach((collector: { type: string; size: string }) => {
                if (collector.type === "Primary") {
                    collectorsBySize.netflow[collector.size] = (collectorsBySize.netflow[collector.size] || 0) + 1;
                }
            });
        });

        // Only add redundant collectors if there are primary collectors
        if (config.enablePollingFailover && Object.keys(collectorsBySize.polling).length > 0) {
            sites.forEach(site => {
                const results = calculateCollectors(
                    calculateWeightedScore(site.devices, config.methodWeights, config),
                    { events: site.logs.events.eps, netflow: site.logs.netflow.fps },
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
                    calculateWeightedScore(site.devices, config.methodWeights, config),
                    { events: site.logs.events.eps, netflow: site.logs.netflow.fps },
                    config.maxLoad,
                    config
                );
                const redundantCollector = results.logs.eventCollectors.find(c => c.type === "N+1 Redundancy");
                if (redundantCollector) {
                    collectorsBySize.logs[redundantCollector.size] =
                        (collectorsBySize.logs[redundantCollector.size] || 0) + 1;
                }
            });
        }

        if (config.enableLogsFailover) {
            sites.forEach(site => {
                const results = calculateCollectors(
                    calculateWeightedScore(site.devices, config.methodWeights, config),
                    { events: site.logs.events.eps, netflow: site.logs.netflow.fps },
                    config.maxLoad,
                    config
                );
                const redundantCollector = results.logs.netflowCollectors.find(c => c.type === "N+1 Redundancy");
                if (redundantCollector) {
                    collectorsBySize.netflow[redundantCollector.size] =
                        (collectorsBySize.netflow[redundantCollector.size] || 0) + 1;
                }
            });
        }

        return collectorsBySize;
    };

    const calculateSiteMetrics = (site: Site) => {
        const results = calculateCollectors(
            calculateWeightedScore(site.devices, config.methodWeights, config),
            { events: site.logs.events.eps, netflow: site.logs.netflow.fps },
            config.maxLoad,
            config
        );

        return {
            totalWeight: calculateWeightedScore(site.devices, config.methodWeights, config),
            totalEPS: getTotalEPS(site),
            estimatedInstances: getEstimatedInstanceCount(site),
            avgPollingLoad: calculateAverageLoad(results.polling.collectors),
            avgLogsLoad: calculateAverageLoad(results.logs.eventCollectors),
            avgNetflowLoad: calculateAverageLoad(results.logs.netflowCollectors),
            collectorsBySize: {
                polling: countCollectorsBySize(results.polling.collectors),
                logs: countCollectorsBySize(results.logs.eventCollectors),
                netflow: countCollectorsBySize(results.logs.netflowCollectors)
            }
        };
    };

    const siteMetrics = sites.reduce((acc, site, index) => {
        acc[index] = calculateSiteMetrics(site);
        return acc;
    }, {} as Record<number, ReturnType<typeof calculateSiteMetrics>>);

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

    const globalResults = calculateCollectors(
        totalLoadScore,
        { 
            events: getTotalEPSBySites(), 
            netflow: sites.reduce((sum, site) => sum + site.logs.netflow.fps, 0) 
        },
        config.maxLoad,
        config
    );

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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                {/* Total Sites */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building className="w-4 h-4 text-blue-700" />
                                        <span className="text-sm text-blue-900">Total Sites</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-700">
                                        {sites.length}
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
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Component className="w-4 h-4 text-blue-700" />
                                        <span className="text-sm text-blue-900">Instances</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-700">
                                        {getTotalInstanceCount().toLocaleString()}
                                    </p>
                                </div>

                                {/* Total EPS */}
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare className="w-4 h-4 text-orange-700" />
                                        <span className="text-sm text-orange-900">Events Per Second</span>
                                    </div>
                                    <p className="text-lg font-bold text-orange-700">
                                        {getTotalEPSBySites().toLocaleString()}
                                    </p>
                                </div>

                                {/* Total FPS */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-4 h-4 text-purple-700" />
                                        <span className="text-sm text-purple-900">Flows Per Second</span>
                                    </div>
                                    <p className="text-lg font-bold text-purple-700">
                                        {sites.reduce((sum, site) => sum + site.logs.netflow.fps, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Global Collector Distribution */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Polling Collectors */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Server className="w-4 h-4 text-blue-700" />
                                            <h3 className="font-medium text-blue-900">Polling Collectors</h3>
                                        </div>
                                        {config.enablePollingFailover && (Object.entries(globalCollectorSummary.polling).length > 0) && (
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

                                {/* Logs Collectors */}
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-orange-700" />
                                            <h3 className="font-medium text-orange-900">Logs Collectors</h3>
                                        </div>
                                        {config.enableLogsFailover && 
                                            Object.values(globalCollectorSummary.logs).reduce((sum, count) => sum + count, 0) > 1 && (
                                            <div className="flex items-center gap-1 text-xs text-orange-700">
                                                <Info className="w-3 h-3" />
                                                <span>N+1 enabled</span>
                                            </div>
                                        )}
                                    </div>
                                    {(Object.keys(globalCollectorSummary.logs).length === 0 || 
                                      (config.enableLogsFailover && Object.values(globalCollectorSummary.logs).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                                        <div className="flex items-center gap-2 p-2 bg-white border border-orange-100 rounded-lg text-orange-500 text-sm">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>No collectors required</span>
                                        </div>
                                    ) : (
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
                                                                <MessageSquare className="w-3 h-3 text-orange-700" />
                                                            </div>
                                                            <span className="text-sm font-medium text-orange-900">{size}</span>
                                                        </div>
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                                            {count}x
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* NetFlow Collectors */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-purple-700" />
                                            <h3 className="font-medium text-purple-900">NetFlow Collectors</h3>
                                        </div>
                                        {config.enableLogsFailover && 
                                            Object.values(globalCollectorSummary.netflow).reduce((sum, count) => sum + count, 0) > 1 && (
                                            <div className="flex items-center gap-1 text-xs text-purple-700">
                                                <Info className="w-3 h-3" />
                                                <span>N+1 enabled</span>
                                            </div>
                                        )}
                                    </div>
                                    {(Object.keys(globalCollectorSummary.netflow).length === 0 || 
                                      (config.enableLogsFailover && Object.values(globalCollectorSummary.netflow).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                                        <div className="flex items-center gap-2 p-2 bg-white border border-purple-100 rounded-lg text-purple-500 text-sm">
                                            <Activity className="w-4 h-4" />
                                            <span>No collectors required</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {Object.entries(globalCollectorSummary.netflow)
                                                .sort(([sizeA], [sizeB]) => {
                                                    const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                                    return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                                })
                                                .map(([size, count]) => (
                                                    <div key={size} className="flex items-center justify-between p-2 bg-white border border-purple-100 rounded-lg hover:bg-purple-50/50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                                                                <Activity className="w-3 h-3 text-purple-700" />
                                                            </div>
                                                            <span className="text-sm font-medium text-purple-900">{size}</span>
                                                        </div>
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                                            {count}x
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add the new Compute Requirements section */}
                            <ComputeRequirements
                                collectorsBySize={{
                                    polling: globalCollectorSummary.polling,
                                    logs: globalCollectorSummary.logs,
                                    netflow: globalCollectorSummary.netflow
                                }}
                                totalLogsLoad={{
                                    events: getTotalEPSBySites(),
                                    netflow: sites.reduce((sum, site) => sum + site.logs.netflow.fps, 0)
                                }}
                                className="mt-4"
                                enablePollingFailover={config.enablePollingFailover}
                                enableLogsFailover={config.enableLogsFailover}
                            />

                            {/* Collector Req section */}
                            <CollectorRecommendation />
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
                                const metrics = calculateSiteMetrics(site);
                                return (
                                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                                        {/* Site Header */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <Building className="w-5 h-5 text-blue-700" />
                                            <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                                        </div>

                                        {/* Site Content */}
                                        <div className="space-y-4">
                                            {/* Sites List - Site Level Metrics */}
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
                                                {/* Devices */}
                                                <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-4">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                        <Server className="w-3 h-3 sm:w-4 sm:h-4 text-blue-700" />
                                                        <h3 className="text-xs sm:text-sm font-medium text-blue-900">Devices</h3>
                                                    </div>
                                                    <p className="text-lg sm:text-xl font-bold text-blue-700">
                                                        {Object.values(site.devices).reduce((sum, dev) => sum + dev.count, 0).toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Load Score */}
                                                <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-4">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                        <Weight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                                        <h3 className="text-xs sm:text-sm font-medium text-blue-900">Load Score</h3>
                                                    </div>
                                                    <p className="text-lg sm:text-xl font-bold text-blue-700">
                                                        {Math.round(metrics.totalWeight).toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Instances */}
                                                <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-4">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                        <Component className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                                        <h3 className="text-xs sm:text-sm font-medium text-blue-900">Instances</h3>
                                                    </div>
                                                    <p className="text-lg sm:text-xl font-bold text-blue-700">
                                                        {metrics.estimatedInstances.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Events Per Second */}
                                                <div className="bg-orange-50 rounded-lg border border-orange-200 p-2 sm:p-4">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                                                        <h3 className="text-xs sm:text-sm font-medium text-orange-900">Events/Sec</h3>
                                                    </div>
                                                    <p className="text-lg sm:text-xl font-bold text-orange-700">
                                                        {Math.round(metrics.totalEPS).toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Flows Per Second */}
                                                <div className="bg-purple-50 rounded-lg border border-purple-200 p-2 sm:p-4">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
                                                        <h3 className="text-xs sm:text-sm font-medium text-purple-900">Flows/Sec</h3>
                                                    </div>
                                                    <p className="text-lg sm:text-xl font-bold text-purple-700">
                                                        {Math.round(site.logs.netflow.fps).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Site Collector Distribution */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {/* Polling Collectors */}
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

                                                {/* Logs Collectors */}
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="w-4 h-4 text-orange-700" />
                                                            <h3 className="font-medium text-orange-900">Logs Collectors</h3>
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
                                                                                <MessageSquare className="w-3 h-3 text-orange-700" />
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
                                                            <MessageSquare className="w-4 h-4" />
                                                            <span>No collectors required</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* NetFlow Collectors */}
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-purple-700" />
                                                            <h3 className="font-medium text-purple-900">NetFlow Collectors</h3>
                                                        </div>
                                                        {config.enableLogsFailover && metrics.avgNetflowLoad > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-purple-700">
                                                                <Info className="w-3 h-3" />
                                                                <span>N+1 enabled</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {metrics.avgNetflowLoad > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {Object.entries(metrics.collectorsBySize?.netflow || {})
                                                                .sort(([sizeA], [sizeB]) => {
                                                                    const sizes = ["XXL", "XL", "LARGE", "MEDIUM", "SMALL"];
                                                                    return sizes.indexOf(sizeA) - sizes.indexOf(sizeB);
                                                                })
                                                                .filter(() => !config.enableLogsFailover || Object.values(metrics.collectorsBySize.netflow).reduce((sum, count) => sum + count, 0) > 1)
                                                                .map(([size, count]) => (
                                                                    <div key={size} className="flex items-center justify-between p-2 bg-white border border-purple-100 rounded-lg hover:bg-purple-50/50">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                                                                                <Activity className="w-3 h-3 text-purple-700" />
                                                                            </div>
                                                                            <span className="text-sm font-medium text-purple-900">{size}</span>
                                                                        </div>
                                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                                                            {count}x
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-2 bg-white border border-purple-100 rounded-lg text-purple-500 text-sm">
                                                            <Activity className="w-4 h-4" />
                                                            <span>No collectors required</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Add the new site-specific Compute Requirements section */}
                                            <ComputeRequirements
                                                collectorsBySize={{
                                                    polling: metrics.collectorsBySize.polling,
                                                    logs: metrics.collectorsBySize.logs,
                                                    netflow: metrics.collectorsBySize.netflow
                                                }}
                                                totalLogsLoad={{
                                                    events: site.logs.events.eps,
                                                    netflow: site.logs.netflow.fps
                                                }}
                                                className="mt-4"
                                                enablePollingFailover={config.enablePollingFailover}
                                                enableLogsFailover={config.enableLogsFailover}
                                            />

                                            {/* Device Distribution */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Device Distribution</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {Object.entries(site.devices)
                                                        .filter(([_, data]) => data.count > 0)
                                                        .map(([type, data]) => {
                                                            const groupMetrics = calculateDeviceGroupMetrics(site, type, data);
                                                            const IconComponent = (Icons[data.icon as keyof typeof Icons] || Icons.EthernetPort) as LucideIcon;

                                                            return (
                                                                <div
                                                                    key={type}
                                                                    className="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-300"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                                            <IconComponent className="w-6 h-6 text-blue-700" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium text-gray-900 text-sm truncate">{type}</span>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 text-xs text-gray-600">
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
            <div className="mb-6">
                <DisclaimerBox />
            </div>
        </div>
    );
};

SiteOverview.displayName = "SiteOverview";

export default SiteOverview;