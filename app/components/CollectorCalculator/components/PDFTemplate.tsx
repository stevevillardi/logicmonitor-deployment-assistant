import { Site, Config } from '../types';

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
        <div className="pdf-content max-w-[1000px] mx-auto p-8 bg-white text-gray-900">
            {/* Header */}
            <header className="mb-12 border-b pb-6">
                <div className="flex items-center justify-between">
                    <img 
                        src="/lmlogo.webp" 
                        alt="LogicMonitor" 
                        width={230} 
                        height={43} 
                        className="object-contain" 
                    />
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Generated on {currentDate}</p>
                        <h1 className="text-xl font-bold mt-1">Deployment Assistant</h1>
                    </div>
                </div>
            </header>


            {/* Overview Cards */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold mt-1">Overview: {config.deploymentName || "Deployment Configuration"}</h2>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sites</h3>
                    <p className="text-3xl font-bold">{sites.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Devices</h3>
                    <p className="text-3xl font-bold">{sites.reduce((sum, site) => 
                        sum + Object.values(site.devices).reduce((devSum, dev) => devSum + dev.count, 0), 0
                    ).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Instances</h3>
                    <p className="text-3xl font-bold">{collectorSummary.estimatedInstances.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Load Score</h3>
                    <p className="text-3xl font-bold">{Math.round(collectorSummary.totalWeight).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Events Per Second</h3>
                    <p className="text-3xl font-bold">{Math.round(collectorSummary.totalEPS).toLocaleString()}</p>
                </div>
            </div>

            {/* Global Collector Distribution */}
            <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-gray-50 rounded-lg border p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Global Polling Collectors</h3>
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
                            <div key={size} className="flex justify-between items-center mb-1">
                                <span>{size}</span>
                                <span className="font-medium">{count}x</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-sm text-center">No polling collectors required based on current configuration</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 rounded-lg border p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Logs Collectors</h3>
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
                            <div key={size} className="flex justify-between items-center mb-1">
                                <span>{size}</span>
                                <span className="font-medium">{count}x</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-sm text-center">No log collectors required based on current configuration</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sites */}
            {sites.map((site, index) => {
                const metrics = siteMetrics[index];
                
                return (
                    <div key={index} className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Site: {site.name || `Site ${index + 1}`}</h2>
                        </div>

                        {/* Site Metrics Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg border p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Devices</h3>
                                <p className="text-xl font-bold">{Object.values(site.devices).reduce((sum, dev) => sum + dev.count, 0)}</p>
                            </div>
                            <div className="bg-white rounded-lg border p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Load Score</h3>
                                <p className="text-xl font-bold">{Math.round(metrics.totalWeight)}</p>
                            </div>
                            <div className="bg-white rounded-lg border p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">EPS</h3>
                                <p className="text-xl font-bold">{Math.round(metrics.totalEPS)}</p>
                            </div>
                            <div className="bg-white rounded-lg border p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Instances</h3>
                                <p className="text-xl font-bold">{metrics.estimatedInstances}</p>
                            </div>
                        </div>

                        {/* Collectors Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-50 rounded-lg border p-6">
                                <h3 className="text-base font-semibold text-gray-900 mb-4">Polling Collectors</h3>
                                {Object.keys(metrics.collectorsBySize.polling).length > 0 ? (
                                    <>
                                        {Object.entries(metrics.collectorsBySize.polling).map(([size, count]) => (
                                            <div key={size} className="flex justify-between items-center mb-1">
                                                <span>{size}</span>
                                                <span className="font-medium">{count}x</span>
                                            </div>
                                        ))}
                                        <div className="mt-2 pt-2 border-t">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Average Load</span>
                                                <span className={`font-medium ${
                                                    metrics.avgPollingLoad >= 80 ? 'text-red-600' :
                                                    metrics.avgPollingLoad >= 60 ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>{metrics.avgPollingLoad}%</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200">
                                        <p className="text-gray-500 text-sm text-center">No polling collectors required for this site</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-lg border p-6">
                                <h3 className="text-base font-semibold text-gray-900 mb-4">Logs Collectors</h3>
                                {Object.keys(metrics.collectorsBySize.logs).length > 0 ? (
                                    <>
                                        {Object.entries(metrics.collectorsBySize.logs).map(([size, count]) => (
                                            <div key={size} className="flex justify-between items-center mb-1">
                                                <span>{size}</span>
                                                <span className="font-medium">{count}x</span>
                                            </div>
                                        ))}
                                        <div className="mt-2 pt-2 border-t">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Average Load</span>
                                                <span className={`font-medium ${
                                                    metrics.avgLogsLoad >= 80 ? 'text-red-600' :
                                                    metrics.avgLogsLoad >= 60 ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>{metrics.avgLogsLoad}%</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200">
                                        <p className="text-gray-500 text-sm text-center">No log collectors required for this site</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Device Table */}
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Device Type</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Count</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Load Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {Object.entries(site.devices)
                                        .filter(([_, data]) => data.count > 0)
                                        .map(([type, data]) => (
                                            <tr key={type} className="border-b last:border-0">
                                                <td className="p-3">{type}</td>
                                                <td className="p-3 text-right">{data.count}</td>
                                                <td className="p-3 text-right">
                                                    {Math.round(
                                                        Object.entries(data.methods).reduce(
                                                            (total, [method, ratio]) => 
                                                                total + (data.instances * (ratio as number) * config.methodWeights[method] * data.count),
                                                            0
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PDFTemplate; 