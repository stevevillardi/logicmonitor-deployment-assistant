import { Site, Config } from '../DeploymentAssistant/types/types';
import ComputeRequirements from './ComputeRequirements';
import { Server, Activity, Component, Weight, HardDrive, Building, Earth, Info } from 'lucide-react';
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
        collectorsBySize: {
            polling: Record<string, number>;
            logs: Record<string, number>;
        };
    }>;
}

const SectionDivider = () => (
    <div className="flex items-center gap-4 my-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-grow" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-grow" />
    </div>
);

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
            <header className="mb-8 sm:mb-12 border-b pb-4 sm:pb-6">
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

            {/* Global Section */}
            <div className="global-section">
                {/* Overview Cards */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Earth className="w-5 h-5 sm:w-7 sm:h-7 text-blue-700" />
                        <h2 className="text-xl sm:text-2xl font-bold"> {"Deployment: " + config.deploymentName || "Deployment Configuration"}</h2>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                            <h3 className="text-xs sm:text-sm font-medium text-blue-900">Total Sites</h3>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold text-blue-700">{sites.length}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                            <h3 className="text-xs sm:text-sm font-medium text-blue-900">Total Devices</h3>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold text-blue-700">
                            {sites.reduce((sum, site) =>
                                sum + Object.values(site.devices).reduce((devSum, dev) => devSum + dev.count, 0), 0
                            ).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Component className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                            <h3 className="text-xs sm:text-sm font-medium text-blue-900">Total Instances</h3>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold text-blue-700">
                            {collectorSummary.estimatedInstances.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Weight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                            <h3 className="text-xs sm:text-sm font-medium text-blue-900">Total Load Score</h3>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold text-blue-700">
                            {Math.round(collectorSummary.totalWeight).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg border border-orange-200 p-3 sm:p-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                            <h3 className="text-xs sm:text-sm font-medium text-orange-900">Total Events Per Second</h3>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold text-orange-700">
                            {Math.round(collectorSummary.totalEPS).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Global Collector Distribution */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                            <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                            <h3 className="text-sm sm:text-base font-semibold text-blue-900">Total Polling Collectors</h3>
                        </div>
                        {Object.keys(sites.reduce((acc, _, index) => {
                            const metrics = siteMetrics[index];
                            Object.entries(metrics.collectorsBySize.polling).forEach(([size, count]) => {
                                acc[size] = (acc[size] || 0) + count;
                            });
                            return acc;
                        }, {} as Record<string, number>)).length > 0 ? (
                            Object.entries(sites.reduce((acc, _, index) => {
                                const metrics = siteMetrics[index];
                                Object.entries(metrics.collectorsBySize.polling).forEach(([size, count]) => {
                                    acc[size] = (acc[size] || 0) + count;
                                });
                                return acc;
                            }, {} as Record<string, number>)).map(([size, count]) => (
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
                            ))
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-white border border-blue-100 rounded-lg text-blue-500 text-sm">
                                <Server className="w-4 h-4" />
                                <span>No collectors required</span>
                            </div>
                        )}
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-6">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                                <h3 className="text-sm sm:text-base font-semibold text-orange-900">Total Logs/NetFlow Collectors</h3>
                            </div>
                            {config.enableLogsFailover && sites.some(site => Object.values(site.logs).some(eps => eps > 0)) && (
                                <div className="flex items-center gap-1 text-xs text-orange-700">
                                    <Info className="w-3 h-3" />
                                    <span>N+1 enabled</span>
                                </div>
                            )}
                        </div>
                        {Object.keys(sites.reduce((acc, _, index) => {
                            const metrics = siteMetrics[index];
                            Object.entries(metrics.collectorsBySize.logs).forEach(([size, count]) => {
                                acc[size] = (acc[size] || 0) + count;
                            });
                            return acc;
                        }, {} as Record<string, number>)).length > 0 ? (
                            Object.entries(sites.reduce((acc, _, index) => {
                                const metrics = siteMetrics[index];
                                Object.entries(metrics.collectorsBySize.logs).forEach(([size, count]) => {
                                    acc[size] = (acc[size] || 0) + count;
                                });
                                return acc;
                            }, {} as Record<string, number>)).map(([size, count]) => (
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
                            ))
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-white border border-orange-100 rounded-lg text-orange-500 text-sm">
                                <Activity className="w-4 h-4" />
                                <span>No collectors required</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Global Compute Requirements */}
                <div className="mb-6">
                    <ComputeRequirements
                        collectorsBySize={{
                            polling: sites.reduce((acc, _, index) => {
                                const metrics = siteMetrics[index];
                                Object.entries(metrics.collectorsBySize.polling).forEach(([size, count]) => {
                                    acc[size] = (acc[size] || 0) + count;
                                });
                                return acc;
                            }, {} as Record<string, number>),
                            logs: sites.reduce((acc, _, index) => {
                                const metrics = siteMetrics[index];
                                Object.entries(metrics.collectorsBySize.logs).forEach(([size, count]) => {
                                    acc[size] = (acc[size] || 0) + count;
                                });
                                return acc;
                            }, {} as Record<string, number>)
                        }}
                    />
                </div>

                <div className="mb-6">
                    <CollectorRecommendation />
                </div>
                <SectionDivider />
            </div>

            {/* Sites */}
            {sites.map((site, index) => {
                const metrics = siteMetrics[index];

                return (
                    <div key={index} className="site-section mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                            <h2 className="text-xl sm:text-2xl font-bold">Site: {site.name || `Site ${index + 1}`}</h2>
                        </div>

                        {/* Site Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
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
                                    <h3 className="text-xs sm:text-sm font-medium text-blue-900">Load Score</h3>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-blue-700">
                                    {Math.round(metrics.totalWeight).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                    <h3 className="text-xs sm:text-sm font-medium text-blue-900">EPS</h3>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-blue-700">
                                    {Math.round(metrics.totalEPS).toLocaleString()}
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
                        </div>

                        {/* Collectors Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-6">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                                    <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                    <h3 className="text-sm sm:text-base font-semibold text-blue-900">Polling Collectors</h3>
                                </div>
                                {Object.keys(metrics.collectorsBySize.polling).length > 0 ? (
                                    <>
                                        {Object.entries(metrics.collectorsBySize.polling).map(([size, count]) => (
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
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-blue-100 rounded-lg text-blue-500 text-sm">
                                        <Server className="w-4 h-4" />
                                        <span>No collectors required</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-6">
                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                                        <h3 className="text-sm sm:text-base font-semibold text-orange-900">Logs/NetFlow Collectors</h3>
                                    </div>
                                    {config.enableLogsFailover && Object.values(site.logs).some(eps => eps > 0) && (
                                        <div className="flex items-center gap-1 text-xs text-orange-700">
                                            <Info className="w-3 h-3" />
                                            <span>N+1 enabled</span>
                                        </div>
                                    )}
                                </div>
                                {Object.keys(metrics.collectorsBySize.logs).length > 0 ? (
                                    <>
                                        {Object.entries(metrics.collectorsBySize.logs).map(([size, count]) => (
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
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-orange-100 rounded-lg text-orange-500 text-sm">
                                        <Activity className="w-4 h-4" />
                                        <span>No collectors required</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Site-Specific Compute Requirements */}
                        <div className="mb-6">
                            <ComputeRequirements
                                collectorsBySize={{
                                    polling: metrics.collectorsBySize.polling,
                                    logs: metrics.collectorsBySize.logs
                                }}
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
                                        })}
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