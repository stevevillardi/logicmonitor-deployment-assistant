import React from 'react';
import { Server, Activity } from 'lucide-react';
import { devLog } from '@/utils/debug';

interface CollectorVisualizationProps {
    polling: { collectors: Array<any> };
    logs: { collectors: Array<any> };
    totalPollingLoad?: number;
    totalLogsLoad?: number;
}

export const CollectorVisualization = ({ polling, logs, totalPollingLoad = 0, totalLogsLoad = 0 }: CollectorVisualizationProps) => {
    devLog('CollectorVisualization Received:', {
        polling: {
            collectors: polling.collectors.map(c => ({
                size: c.size,
                type: c.type,
                load: c.load
            })),
            totalLoad: totalPollingLoad
        },
        logs: {
            collectors: logs.collectors.map(c => ({
                size: c.size,
                type: c.type,
                load: c.load
            })),
            totalLoad: totalLogsLoad
        }
    });

    const getLoadColor = (load: number) => {
        if (load >= 80) return "bg-red-50 border-red-200 text-red-700";
        if (load >= 60) return "bg-yellow-50 border-yellow-200 text-yellow-700";
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
    };

    const calculateMetrics = (collectors: Array<any>) => {
        const primaryCollectors = collectors.filter(c => c.type === "Primary");
        const hasRedundancy = collectors.some(c => c.type === "N+1 Redundancy");
        const avgLoad = primaryCollectors.length > 0
            ? Math.round(primaryCollectors.reduce((sum, c) => sum + c.load, 0) / primaryCollectors.length)
            : 0;

        devLog('Calculated metrics:', {
            collectors,
            primaryCollectors,
            avgLoad,
            size: collectors[0]?.size || 'N/A',
            hasRedundancy
        });

        return {
            avgLoad,
            primaryCount: primaryCollectors.length,
            totalCount: collectors.length,
            size: collectors[0]?.size || 'N/A',
            hasRedundancy
        };
    };

    const renderCollectorGroup = (
        title: string,
        collectors: Array<any>,
        icon: React.ReactNode,
        borderColor: string,
        totalLoad: number
    ) => {
        const metrics = calculateMetrics(collectors);
        const loadColor = getLoadColor(metrics.avgLoad);
        const primaryCollectors = collectors.filter(c => c.type === "Primary");
        const hasOnlyRedundancy = collectors.length === 1 && collectors[0].type === "N+1 Redundancy";
        const showNA = primaryCollectors.length === 0 || hasOnlyRedundancy;

        return (
            <div className={`border rounded-lg p-4 sm:p-6 bg-white shadow-sm ${borderColor}`}>
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                            {icon}
                            {title}
                        </h3>

                        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="px-2 sm:px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1.5">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">Collectors</span>
                                    <span className="text-sm font-bold">
                                        {showNA ? "N/A" : `${metrics.totalCount}${metrics.hasRedundancy ? ' (with N+1)' : ''}`}
                                    </span>
                                </div>
                            </div>
                            <div className="px-2 sm:px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">Avg Load</span>
                                    <span className="text-sm font-bold">{showNA ? "0" : `${metrics.avgLoad}%`}</span>
                                </div>
                            </div>
                            <div className="px-2 sm:px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 flex items-center gap-1.5">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">Size</span>
                                    <span className="text-sm font-bold">{showNA ? "0" : metrics.size}</span>
                                </div>
                            </div>
                            <div className="px-2 sm:px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 flex items-center gap-1.5">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">Total Load</span>
                                    <span className="text-sm font-bold">{showNA ? "0" : Math.round(totalLoad).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {primaryCollectors.length === 0 || hasOnlyRedundancy ? (
                            <div className="col-span-1 sm:col-span-2 flex items-center justify-center p-4 bg-white rounded-lg border-2 border-dashed border-gray-200">
                                <div className="flex items-center gap-2 text-gray-500">
                                    {React.cloneElement(icon as React.ReactElement, {
                                        className: "w-5 h-5 text-gray-400"
                                    })}
                                    <span className="text-sm">
                                        {title.includes("Polling")
                                            ? "No Polling Collectors Required"
                                            : "No Logs/NetFlow Collectors Required"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            collectors.map((collector, idx) => (
                                <div
                                    key={idx}
                                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:px-4 sm:py-2 border rounded-lg ${
                                        collector.type === "N+1 Redundancy"
                                            ? "bg-blue-50 border-blue-200 text-blue-700"
                                            : getLoadColor(collector.load)
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                        <Server className="w-4 h-4" />
                                        <span className="font-medium">{collector.size} #{idx + 1}</span>
                                        <span className="text-xs opacity-90">({collector.type})</span>
                                    </div>
                                    {collector.type !== "N+1 Redundancy" && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <span className="text-xs">Load:</span>
                                            <div className="w-full sm:w-16 bg-white/80 border border-gray-200 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                                        collector.load >= 80
                                                            ? "bg-red-500"
                                                            : collector.load >= 60
                                                                ? "bg-yellow-500"
                                                                : "bg-emerald-500"
                                                    }`}
                                                    style={{ width: `${collector.load}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium">{collector.load}%</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {renderCollectorGroup(
                "Polling ABCG",
                polling.collectors,
                <Server className="w-5 sm:w-6 h-5 sm:h-6 text-blue-700" />,
                "border-blue-200",
                totalPollingLoad
            )}
            {renderCollectorGroup(
                "Logs/NetFlow Collectors",
                logs.collectors,
                <Activity className="w-5 sm:w-6 h-5 sm:h-6 text-blue-700" />,
                "border-blue-200",
                totalLogsLoad
            )}
        </div>
    );
};