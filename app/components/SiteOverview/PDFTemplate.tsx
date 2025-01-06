import { Site, Config } from '../DeploymentAssistant/types/types';
import ComputeRequirements from './ComputeRequirements';
import { Server, Activity, Component, Weight, HardDrive, Building, Earth, Info, MessageSquare } from 'lucide-react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import DisclaimerBox from '../Shared/DisclaimerBox';
import CollectorRecommendation from '../Shared/CollectorRecommendation';
import Image from 'next/image';

interface PDFTemplateProps {
    sites: Site[];
    config: Config;
    currentDate: string;
    siteMetrics: Record<number, {
        totalWeight: number;
        totalEPS: number;
        estimatedInstances: number;
        avgPollingLoad: number;
        avgLogsLoad: number;
        avgNetflowLoad: number;
        collectorsBySize: {
            polling: Record<string, number>;
            logs: Record<string, number>;
            netflow: Record<string, number>;
        };
    }>;
}

const SectionDivider = () => (
    <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-grow" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-grow" />
    </div>
);

const getTotalEPS = (site: Site) => {
    const logs = site.logs || { events: { eps: 0 } };
    return logs.events?.eps || 0;
};

const getTotalFPS = (site: Site) => {
    const logs = site.logs || { netflow: { fps: 0 } };
    return logs.netflow?.fps || 0;
};

const getTotalEPSBySites = (sites: Site[]) => {
    return sites.reduce((sum, site) => sum + getTotalEPS(site), 0);
};

const getTotalFPSBySites = (sites: Site[]) => {
    return sites.reduce((sum, site) => sum + getTotalFPS(site), 0);
};

const PDFTemplate = ({ sites, config, currentDate, siteMetrics }: PDFTemplateProps) => {
    const collectorSummary = sites.reduce((summary, site, index) => {
        const metrics = siteMetrics[index];
        return {
            totalWeight: summary.totalWeight + metrics.totalWeight,
            totalEPS: summary.totalEPS + metrics.totalEPS,
            estimatedInstances: summary.estimatedInstances + metrics.estimatedInstances,
            avgPollingLoad: Math.round((summary.avgPollingLoad + metrics.avgPollingLoad) / 2),
            avgLogsLoad: Math.round((summary.avgLogsLoad + metrics.avgLogsLoad) / 2)
        };
    }, { totalWeight: 0, totalEPS: 0, estimatedInstances: 0, avgPollingLoad: 0, avgLogsLoad: 0 });

    const globalCollectorSummary = sites.reduce((summary: {
        polling: Record<string, number>;
        logs: Record<string, number>;
        netflow: Record<string, number>;
    }, site, index) => {
        const metrics = siteMetrics[index];

        // Merge polling collectors
        Object.entries(metrics.collectorsBySize.polling).forEach(([size, count]) => {
            summary.polling[size] = (summary.polling[size] || 0) + count;
        });

        // Merge logs collectors
        Object.entries(metrics.collectorsBySize.logs).forEach(([size, count]) => {
            summary.logs[size] = (summary.logs[size] || 0) + count;
        });

        // Merge netflow collectors
        Object.entries(metrics.collectorsBySize.netflow).forEach(([size, count]) => {
            summary.netflow[size] = (summary.netflow[size] || 0) + count;
        });

        return summary;
    }, { polling: {}, logs: {}, netflow: {} });

    return (
        <div className="pdf-content max-w-[1000px] mx-auto p-4 sm:p-8 bg-white text-gray-900">
            <style>
                {`
                    @media print {
                        .site-section, .global-section {
                            page-break-after: always;
                        }
                    }
                `}
            </style>

            {/* Header */}
            <header className="mb-6 border-b pb-4 sm:pb-6">
                <div className="flex items-center justify-between">
                    <Image
                        src="/lmlogo.webp"
                        alt="LogicMonitor"
                        width={230}
                        height={43}
                        className="w-[150px] sm:w-[230px] object-contain"
                        priority
                    />
                    <div className="text-right">
                        <p className="text-xs sm:text-sm text-gray-600">Generated on {currentDate}</p>
                        <h1 className="text-lg sm:text-xl font-bold mt-1">Deployment Assistant</h1>
                    </div>
                </div>
            </header>

            {/* Overview Section */}
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Earth className="w-7 h-7 text-blue-700" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {config.deploymentName ? `Deployment: ${config.deploymentName}` : "Deployment Configuration"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Global Overview</p>
                    </div>
                </div>

                {/* Infrastructure & Monitoring Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Infrastructure Metrics */}
                    <div className="col-span-2 lg:col-span-3 grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Building className="w-4 h-4 text-blue-700" />
                                <h3 className="text-sm font-medium text-blue-900">Sites</h3>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{sites.length}</p>
                        </div>

                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Server className="w-4 h-4 text-blue-700" />
                                <h3 className="text-sm font-medium text-blue-900">Devices</h3>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                                {Math.round(sites.reduce((sum, site) =>
                                    sum + Object.values(site.devices).reduce((devSum, dev) => devSum + dev.count, 0), 0
                                )).toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Component className="w-4 h-4 text-blue-700" />
                                <h3 className="text-sm font-medium text-blue-900">Instances</h3>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                                {Math.round(collectorSummary.estimatedInstances).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Monitoring Metrics */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-orange-700" />
                                <h3 className="text-sm font-medium text-orange-900">Events/Sec</h3>
                            </div>
                            <p className="text-2xl font-bold text-orange-700">
                                {Math.round(getTotalEPSBySites(sites)).toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-purple-700" />
                                <h3 className="text-sm font-medium text-purple-900">Flows/Sec</h3>
                            </div>
                            <p className="text-2xl font-bold text-purple-700">
                                {Math.round(getTotalFPSBySites(sites)).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Global Collector Distribution */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-6">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                <h3 className="text-sm sm:text-base font-semibold text-blue-900">Polling Collectors</h3>
                            </div>
                        </div>
                        {(Object.keys(globalCollectorSummary.polling).length === 0 ||
                            (config.enablePollingFailover && Object.values(globalCollectorSummary.polling).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                            <div className="flex items-center gap-2 p-2 bg-white border border-blue-100 rounded-lg text-blue-500 text-sm">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Server className="w-3 h-3 text-blue-700" />
                                </div>
                                <span>No collectors required</span>
                            </div>
                        ) : (
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
                        )}
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-6">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                                <h3 className="text-sm sm:text-base font-semibold text-orange-900">Logs Collectors</h3>
                            </div>
                        </div>
                        {(Object.keys(globalCollectorSummary.logs).length === 0 ||
                            (config.enableLogsFailover && Object.values(globalCollectorSummary.logs).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                            <div className="flex items-center gap-2 p-2 bg-white border border-orange-100 rounded-lg text-orange-500 text-sm">
                                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                                    <MessageSquare className="w-3 h-3 text-orange-700" />
                                </div>
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
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-6">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
                                <h3 className="text-sm sm:text-base font-semibold text-purple-900">NetFlow Collectors</h3>
                            </div>
                        </div>
                        {(Object.keys(globalCollectorSummary.netflow).length === 0 ||
                            (config.enableLogsFailover && Object.values(globalCollectorSummary.netflow).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                            <div className="flex items-center gap-2 p-2 bg-white border border-purple-100 rounded-lg text-purple-500 text-sm">
                                <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                                    <Activity className="w-3 h-3 text-purple-700" />
                                </div>
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

                {/* Global Compute Requirements */}
                <div className="mb-6">
                    <ComputeRequirements
                        collectorsBySize={globalCollectorSummary}
                        totalLogsLoad={{
                            events: getTotalEPSBySites(sites),
                            netflow: getTotalFPSBySites(sites)
                        }}
                        enablePollingFailover={config.enablePollingFailover}
                        enableLogsFailover={config.enableLogsFailover}
                        forceLightMode={true}
                    />
                </div>

                <div className="mb-6">
                    <CollectorRecommendation forceLightMode={true} />
                </div>
                <div>
                    <SectionDivider />
                </div>
            </div>

            {/* Sites */}
            {sites.map((site, index) => {
                const metrics = siteMetrics[index];

                return (
                    <div key={index} className="site-section mt-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                            <h2 className="text-xl sm:text-2xl font-bold">Site: {site.name || `Site ${index + 1}`}</h2>
                        </div>

                        {/* Site Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Server className="w-3 h-3 sm:w-4 sm:h-4 text-blue-700" />
                                    <h3 className="text-xs sm:text-sm font-medium text-blue-900">Devices</h3>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-blue-700">
                                    {Object.values(site.devices).reduce((sum, dev) => sum + dev.count, 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Weight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                    <h3 className="text-xs sm:text-sm font-medium text-blue-900">Load</h3>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-blue-700">
                                    {Math.round(metrics.totalWeight).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Component className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                    <h3 className="text-xs sm:text-sm font-medium text-blue-900">Instances</h3>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-blue-700">
                                    {metrics.estimatedInstances.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-orange-50 rounded-lg border border-orange-200 p-2 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                                    <h3 className="text-xs sm:text-sm font-medium text-orange-900">Events/Sec</h3>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-orange-700">
                                    {Math.round(getTotalEPS(site)).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg border border-purple-200 p-2 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
                                    <h3 className="text-xs sm:text-sm font-medium text-purple-900">Flows/Sec</h3>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-purple-700">
                                    {Math.round(getTotalFPS(site)).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Collectors Grid */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-6">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                                    <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                    <h3 className="text-sm sm:text-base font-semibold text-blue-900">Polling Collectors</h3>
                                </div>
                                {(Object.keys(metrics.collectorsBySize.polling).length === 0 ||
                                    (config.enablePollingFailover && Object.values(metrics.collectorsBySize.polling).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-blue-100 rounded-lg text-blue-500 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Server className="w-3 h-3 text-blue-700" />
                                        </div>
                                        <span>No collectors required</span>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {Object.entries(metrics.collectorsBySize.polling)
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
                                )}
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-6">
                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                                        <h3 className="text-sm sm:text-base font-semibold text-orange-900">Logs Collectors</h3>
                                    </div>
                                    {config.enableLogsFailover && (site.logs.events.eps > 0 || site.logs.netflow.fps > 0) && (
                                        <div className="flex items-center gap-1 text-xs text-orange-700">
                                            <Info className="w-3 h-3" />
                                            <span>N+1 enabled</span>
                                        </div>
                                    )}
                                </div>
                                {(Object.keys(metrics.collectorsBySize.logs).length === 0 ||
                                    (config.enableLogsFailover && Object.values(metrics.collectorsBySize.logs).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-orange-100 rounded-lg text-orange-500 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                                            <MessageSquare className="w-3 h-3 text-orange-700" />
                                        </div>
                                        <span>No collectors required</span>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {Object.entries(metrics.collectorsBySize.logs)
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
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-6">
                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
                                        <h3 className="text-sm sm:text-base font-semibold text-purple-900">NetFlow Collectors</h3>
                                    </div>
                                    {config.enableLogsFailover && site.logs.netflow.fps > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-purple-700">
                                            <Info className="w-3 h-3" />
                                            <span>N+1 enabled</span>
                                        </div>
                                    )}
                                </div>
                                {(Object.keys(metrics.collectorsBySize.netflow).length === 0 ||
                                    (config.enableLogsFailover && Object.values(metrics.collectorsBySize.netflow).reduce((sum, count) => sum + count, 0) <= 1)) ? (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-purple-100 rounded-lg text-purple-500 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                                            <Activity className="w-3 h-3 text-purple-700" />
                                        </div>
                                        <span>No collectors required</span>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {Object.entries(metrics.collectorsBySize.netflow)
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

                        {/* Add Site-Specific Compute Requirements */}
                        <div className="mb-6">
                            <ComputeRequirements
                                collectorsBySize={metrics.collectorsBySize}
                                totalLogsLoad={{
                                    events: getTotalEPS(site),
                                    netflow: getTotalFPS(site)
                                }}
                                enablePollingFailover={config.enablePollingFailover}
                                enableLogsFailover={config.enableLogsFailover}
                                forceLightMode={true}
                            />
                        </div>

                        {/* Device Table */}
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">Device Type</th>
                                        <th className="text-right px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">Count</th>
                                        <th className="text-right px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">Instances</th>
                                        <th className="text-right px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">Load Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {Object.entries(site.devices)
                                        .filter(([_, data]) => data.count > 0)
                                        .length > 0 ? (
                                        Object.entries(site.devices)
                                            .filter(([_, data]) => data.count > 0)
                                            .map(([type, data]) => {
                                                const IconComponent = (Icons[data.icon as keyof typeof Icons] || Icons.Server) as LucideIcon;
                                                return (
                                                    <tr key={type} className="border-b last:border-0">
                                                        <td className="p-2 sm:p-3">
                                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                                                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-blue-700" />
                                                                </div>
                                                                <span className="text-xs sm:text-sm">{type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">{data.count.toLocaleString()}</td>
                                                        <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">{(data.instances * data.count).toLocaleString()}</td>
                                                        <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
                                                            {Math.round(
                                                                Object.entries(data.methods).reduce(
                                                                    (total, [method, ratio]) =>
                                                                        total + (data.instances * (ratio as number) * config.methodWeights[method] * data.count),
                                                                    0
                                                                )
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-2 sm:px-6 py-4">
                                                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                                    <Server className="w-4 h-4" />
                                                    <span>No devices configured</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {index < sites.length - 1 && <SectionDivider />}
                        {index == sites.length - 1 && <div className="mt-6"><DisclaimerBox /></div>}
                    </div>
                );
            })}
        </div>
    );
};

export default PDFTemplate; 