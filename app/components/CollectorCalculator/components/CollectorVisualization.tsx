import React from 'react';
import { Server, Activity } from 'lucide-react';

interface CollectorVisualizationProps {
    polling: { collectors: Array<any> };
    logs: { collectors: Array<any> };
}

export const CollectorVisualization = ({ polling, logs }: CollectorVisualizationProps) => {
    const getLoadColor = (load: number  ) => {
        if (load >= 80) return "bg-red-50 border-red-200 text-red-700";
        if (load >= 60) return "bg-yellow-50 border-yellow-200 text-yellow-700";
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
    };

    const renderCollectorGroup = (title: string, collectors: Array<any>, icon: React.ReactNode, borderColor: string) => (
        <div className={`border rounded-lg p-6 bg-white shadow-sm ${borderColor}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <div className="grid grid-cols-3 gap-4">
                {collectors.map((collector, idx) => (
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
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {renderCollectorGroup(
                "Polling ABCG",
                polling.collectors,
                <Server className="w-6 h-6 text-blue-700" />,
                "border-blue-200"
            )}
            {renderCollectorGroup(
                "Logs/NetFlow Collectors",
                logs.collectors,
                <Activity className="w-6 h-6 text-blue-700" />,
                "border-blue-200"
            )}
        </div>
    );
};