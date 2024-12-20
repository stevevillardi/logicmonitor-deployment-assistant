import React from 'react';
import { Server, Network, Cpu, HardDrive, MemoryStick, Weight, Activity } from 'lucide-react';
import { FaAws, FaGoogle, FaMicrosoft } from "react-icons/fa"; // Add cloud provider icons
import EnhancedCard from '@/components/ui/enhanced-card';
import CollectorReq from './CollectorReq';
import { Config } from '../DeploymentAssistant/types/types';
import { collectorCapacities as defaultCapacities, cloudVmSizes } from '../DeploymentAssistant/utils/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { collectorRequirements } from '../DeploymentAssistant/utils/constants';
import NetworkRequirements from './NetworkRequirements';
interface CollectorInfoProps {
    config: Config;
}

const CollectorInfo = ({ config }: CollectorInfoProps) => {
    // Check if any collector capacities differ from defaults
    const hasModifiedCapacities = Object.entries(config.collectorCapacities).some(([size, capacity]) => {
        const defaultCapacity = defaultCapacities[size as keyof typeof defaultCapacities];
        return capacity.weight !== defaultCapacity.weight || capacity.eps !== defaultCapacity.eps;
    });

    // Get list of modified collectors for detailed warning
    const modifiedCollectors = Object.entries(config.collectorCapacities)
        .filter(([size, capacity]) => {
            const defaultCapacity = defaultCapacities[size as keyof typeof defaultCapacities];
            return capacity.weight !== defaultCapacity.weight || capacity.eps !== defaultCapacity.eps;
        })
        .map(([size]) => size);

    return (
        <div className="space-y-6 overflow-y-auto">
            <CollectorReq />
            <EnhancedCard className="bg-white border border-gray-200">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Server className="w-6 h-6 text-blue-700" />
                        <h2 className="text-xl font-semibold text-gray-900">Collector Sizes</h2>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {Object.entries(collectorRequirements).map(([size, requirements]) => (
                            <div key={size} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 flex-shrink-0">
                                            <span className="font-bold text-blue-700">{size}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Cpu className="w-4 h-4 text-blue-700" />
                                                <span className="text-gray-700">{requirements.cpu} core(s)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MemoryStick className="w-4 h-4 text-blue-700" />
                                                <span className="text-gray-700">{requirements.memory}GB</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <HardDrive className="w-4 h-4 text-blue-700" />
                                                <span className="text-gray-700">{requirements.disk}GB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm lg:border-l lg:pl-4 border-gray-200">
                                        <div className="flex items-center gap-1">
                                            <Weight className="w-4 h-4 text-blue-700" />
                                            <span className="text-gray-700">
                                                {config.collectorCapacities[size as keyof typeof collectorRequirements].weight.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 pl-4 border-l border-gray-200">
                                            <Activity className="w-4 h-4 text-blue-700" />
                                            <span className="text-gray-700">
                                                {config.collectorCapacities[size as keyof typeof collectorRequirements].eps.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Cloud Provider VM Recommendations */}
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">Recommended Cloud Instance Sizes</h3>
                        </div>
                        <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Collector Size
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-1">
                                                <FaAws className="text-[#FF9900]" />
                                                AWS
                                            </div>
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-1">
                                                <FaMicrosoft className="text-[#00A4EF]" />
                                                Azure
                                            </div>
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-1">
                                                <FaGoogle className="text-[#4285F4]" />
                                                GCP
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(cloudVmSizes).map(([size, providers], index) => (
                                        <tr key={size} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {size}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                                {providers.aws}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                                {providers.azure}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                                {providers.gcp}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-gray-500">
                            Note: These are minimum recommended sizes based on collector requirements. Actual requirements may vary based on monitoring load and specific use cases. We recomend using fixed performance instances where possible.
                        </p>
                    </div>

                    {hasModifiedCapacities && (
                        <div className="mt-6">
                            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
                                <AlertTriangle className="h-4 w-4 !text-yellow-700" />
                                <AlertDescription className="text-yellow-700">
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="font-semibold mb-1">
                                                Modified Collector Capacities Detected
                                            </p>
                                            <p className="text-sm">
                                                The following collector sizes have been modified from their default values: {' '}
                                                <span className="font-medium">{modifiedCollectors.join(', ')}</span>
                                            </p>
                                            <p className="text-sm mt-2">
                                                Warning: Modifying collector capacities will affect the accuracy of deployment estimates.
                                                Only modify these values if you have specific requirements and understand the implications.
                                            </p>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
            </EnhancedCard>
            <NetworkRequirements />
        </div>
    );
};

export default CollectorInfo;

export const CollectorInfoData = {
    collectorRequirements: {
        // your requirements data here
    }
};