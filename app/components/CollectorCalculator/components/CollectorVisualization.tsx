import React from 'react';
import { Server, Activity, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
        const avgLoad = primaryCollectors.length > 0
            ? Math.round(primaryCollectors.reduce((sum, c) => sum + c.load, 0) / primaryCollectors.length)
            : 0;

        devLog('Calculated metrics:', {
            collectors,
            primaryCollectors,
            avgLoad,
            size: collectors[0]?.size || 'N/A'
        });

        return {
            avgLoad,
            primaryCount: primaryCollectors.length,
            size: collectors[0]?.size || 'N/A'
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
            <div className={`border rounded-lg p-6 bg-white shadow-sm ${borderColor}`}>
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        {icon}
                        {title}
                    </h3>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className={`p-4 rounded-lg ${loadColor}`}>
                            <p className="text-sm font-medium mb-1">Total Load Score</p>
                            <p className="text-2xl font-bold">{showNA ? "0" : Math.round(totalLoad).toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 border-blue-200 text-blue-700">
                            <p className="text-sm font-medium mb-1">Primary Collectors</p>
                            <p className="text-2xl font-bold">{showNA ? "N/A" : metrics.primaryCount}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border-gray-200 text-gray-700">
                            <p className="text-sm font-medium mb-1">Collector Size</p>
                            <p className="text-2xl font-bold">{showNA ? "0" : metrics.size}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${loadColor}`}>
                            <p className="text-sm font-medium mb-1">Avg Load Per Collector</p>
                            <p className="text-2xl font-bold">{showNA ? "0" : `${metrics.avgLoad}%`}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {primaryCollectors.length === 0 || hasOnlyRedundancy ? (
                        <div className="col-span-3 flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                {React.cloneElement(icon as React.ReactElement, {
                                    className: "w-6 h-6 text-gray-400"
                                })}
                            </div>
                            <p className="text-gray-600 font-medium mb-1">
                                {title.includes("Polling") 
                                    ? "No Polling Collectors Required" 
                                    : "No Logs/NetFlow Collectors Required"}
                            </p>
                            <p className="text-gray-500 text-sm text-center">
                                {title.includes("Polling") 
                                    ? "Add devices to see collector requirements" 
                                    : "Add logs/netflow to see collector requirements"}
                            </p>
                        </div>
                    ) : (
                        collectors.map((collector, idx) => (
                            <div
                                key={idx}
                                className={`border rounded-lg p-4 ${collector.type === "N+1 Redundancy"
                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                        : getLoadColor(collector.load)
                                    } transition-all duration-300 hover:shadow-sm`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Server className="w-5 h-5" />
                                    <p className="font-semibold">
                                        {collector.size} Collector {idx + 1}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm opacity-90">{collector.type}</p>
                                    {collector.type !== "N+1 Redundancy" && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Load</span>
                                                <span className="font-medium">{collector.load}%</span>
                                            </div>
                                            <div className="w-full bg-white/80 border border-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${collector.load >= 80
                                                            ? "bg-red-500"
                                                            : collector.load >= 60
                                                                ? "bg-yellow-500"
                                                                : "bg-emerald-500"
                                                        }`}
                                                    style={{ width: `${collector.load}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderCollectorGroup(
                "Polling ABCG",
                polling.collectors,
                <Server className="w-6 h-6 text-blue-700" />,
                "border-blue-200",
                totalPollingLoad
            )}
            {renderCollectorGroup(
                "Logs/NetFlow Collectors",
                logs.collectors,
                <Activity className="w-6 h-6 text-blue-700" />,
                "border-blue-200",
                totalLogsLoad
            )}
        </div>
    );
};