import React from 'react';
import { Server, Network, Cpu, HardDrive, MemoryStick, Weight, Activity, Info } from 'lucide-react';
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
        <div className="space-y-6  mb-4 overflow-y-auto">
            <CollectorReq />
            <EnhancedCard className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Server className="w-6 h-6 text-blue-700 dark:text-blue-500" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Collector Sizes & Estimated Capacities</h2>
                    </div>
                    <div className="overflow-x-auto bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Cpu className="w-4 h-4 text-blue-700" />
                                            CPU
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <MemoryStick className="w-4 h-4 text-blue-700" />
                                            Memory
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <HardDrive className="w-4 h-4 text-blue-700" />
                                            Disk
                                        </div>
                                    </th>
                                    <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Weight className="w-4 h-4 text-blue-700" />
                                            Load
                                        </div>
                                    </th>
                                    <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Activity className="w-4 h-4 text-blue-700" />
                                            EPS
                                        </div>
                                    </th>
                                    <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Network className="w-4 h-4 text-blue-700" />
                                            FPS
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {Object.entries(collectorRequirements).map(([size, requirements], index) => (
                                    <tr key={size} className='bg-white dark:bg-gray-800'>
                                        <td className="px-4 py-3 text-sm font-medium text-blue-700 dark:text-blue-400">
                                            {size}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {requirements.cpu}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {requirements.memory} GB
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {requirements.disk} GB
                                        </td>
                                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {config.collectorCapacities[size as keyof typeof collectorRequirements].weight.toLocaleString()}
                                        </td>
                                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {config.collectorCapacities[size as keyof typeof collectorRequirements].eps.toLocaleString()}
                                        </td>
                                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {config.collectorCapacities[size as keyof typeof collectorRequirements].fps?.toLocaleString() || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend - Only show on large screens */}
                    <div className="hidden lg:block mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="flex items-center gap-1">
                            <Weight className="w-3.5 h-3.5 text-blue-700" />
                            <span>Load: Maximum load per collector, see settings for more details on how this is calculated</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-blue-700" />
                            <span>EPS: Maximum events per second</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Network className="w-3.5 h-3.5 text-blue-700" />
                            <span>FPS: Maximum flows per second.</span>
                        </div>
                    </div>

                    {/* Add Cloud Provider VM Recommendations */}
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recommended Cloud Instance Sizes</h3>
                        </div>
                        <div className="relative -mx-4 sm:mx-0">
                            {/* Left shadow overlay with solid background - update for dark mode */}
                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-800 via-white dark:via-gray-800 via-80% to-transparent sm:hidden pointer-events-none z-30" />
                            {/* Right shadow - update for dark mode */}
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-800 to-transparent sm:hidden pointer-events-none z-10" />
                            
                            <div className="overflow-x-auto scrollbar-none">
                                <div className="min-w-[640px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap bg-gray-50 dark:bg-gray-900 sticky left-0 z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)] border-r border-gray-200 dark:border-gray-700">
                                                    Size
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1 whitespace-nowrap">
                                                        <FaAws className="text-[#FF9900]" />
                                                        <span>AWS</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1 whitespace-nowrap">
                                                        <FaMicrosoft className="text-[#00A4EF]" />
                                                        <span>Azure</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1 whitespace-nowrap">
                                                        <FaGoogle className="text-[#4285F4]" />
                                                        <span>GCP</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {Object.entries(cloudVmSizes).map(([size, providers], index) => (
                                                <tr key={size} className="bg-white dark:bg-gray-800">
                                                    <td className="px-4 py-3 text-sm font-medium text-blue-700 dark:text-blue-400 whitespace-nowrap sticky left-0 z-20 bg-white dark:bg-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)] border-r border-gray-200 dark:border-gray-700">
                                                        {size}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap dark:text-gray-100">
                                                        {providers.aws}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap dark:text-gray-100">
                                                        {providers.azure}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap dark:text-gray-100">
                                                        {providers.gcp}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 px-4">
                            <Info className="w-3.5 h-3.5 text-blue-700" />
                            <p>Swipe left to view Azure and GCP instances</p>
                        </div>
                        <div className="hidden sm:flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                            <p>
                                These are minimum recommended sizes based on collector requirements. Actual requirements may vary based on monitoring load and specific use cases. We recommend using fixed performance instances where possible.
                            </p>
                        </div>
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