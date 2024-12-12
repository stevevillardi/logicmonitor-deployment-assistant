import { Site, Config } from '../types';
import { calculateWeightedScore, calculateCollectors } from '../utils';

interface PDFTemplateProps {
    sites: Site[];
    config: Config;
    currentDate: string;
}

const PDFTemplate = ({ sites, config, currentDate }: PDFTemplateProps) => {
    return (
        <div className="pdf-content hidden print:block">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-blue-900">Deployment Assistant Report</h1>
                <div className="flex items-center justify-between mt-4">
                    <img src="/lmlogo.webp" alt="LogicMonitor" className="h-12" />
                    <div className="text-sm text-gray-600">
                        <p>Generated on {currentDate}</p>
                        <p>{config.deploymentName || "Deployment Configuration"}</p>
                    </div>
                </div>
            </header>

            {/* Summary Section */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Deployment Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                        <h3 className="font-medium">Total Sites</h3>
                        <p className="text-2xl font-bold">{sites.length}</p>
                    </div>
                    <div className="p-4 border rounded">
                        <h3 className="font-medium">Total Devices</h3>
                        <p className="text-2xl font-bold">
                            {sites.reduce((sum, site) => 
                                sum + Object.values(site.devices).reduce((devSum, dev) => devSum + dev.count, 0), 0
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* Sites Breakdown */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Site Details</h2>
                {sites.map((site, index) => {
                    const totalWeight = calculateWeightedScore(site.devices, config.methodWeights);
                    const totalEPS = Object.values(site.logs).reduce((sum, eps) => sum + eps, 0);
                    const results = calculateCollectors(totalWeight, totalEPS, config.maxLoad, config);

                    return (
                        <div key={index} className="mb-8 break-inside-avoid">
                            <h3 className="text-lg font-medium mb-4">{site.name || `Site ${index + 1}`}</h3>
                            
                            {/* Site Metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-gray-50 rounded">
                                    <p className="font-medium">Polling Collectors</p>
                                    <ul className="mt-2">
                                        {results.polling.collectors.map((collector, i) => (
                                            <li key={i}>
                                                {collector.size} ({collector.type}) - Load: {collector.load}%
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                    <p className="font-medium">Logs Collectors</p>
                                    <ul className="mt-2">
                                        {results.logs.collectors.map((collector, i) => (
                                            <li key={i}>
                                                {collector.size} ({collector.type}) - Load: {collector.load}%
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Device Breakdown */}
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Device Distribution</h4>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="p-2">Device Type</th>
                                            <th className="p-2">Count</th>
                                            <th className="p-2">Load Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(site.devices)
                                            .filter(([_, data]) => data.count > 0)
                                            .map(([type, data]) => (
                                                <tr key={type} className="border-t">
                                                    <td className="p-2">{type}</td>
                                                    <td className="p-2">{data.count}</td>
                                                    <td className="p-2">
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
            </section>
        </div>
    );
};

export default PDFTemplate; 