import { DeviceType } from '../types';
import * as Icons from 'lucide-react';
import { Component, Settings, Calculator, Weight, LucideIcon, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/enhanced-components';
import { AlertTriangle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface DeviceTypeCardProps {
    type: string;
    data: DeviceType;
    methodWeights: Record<string, number>;
    onUpdate: (count: number) => void;
    showDetails: boolean;
}

export const DeviceTypeCard = ({ type, data, methodWeights, onUpdate, showDetails = false }: DeviceTypeCardProps) => {
    const getIcon = () => {
        const IconComponent = (Icons[data.icon as keyof typeof Icons] || Icons.EthernetPort) as LucideIcon;
        return <IconComponent className="w-6 h-6 text-blue-700" />;
    };

    const calculateSingleDeviceLoad = () => {
        return Object.entries(data.methods).reduce((total, [method, ratio]) => {
            return total + (data.instances * ratio * (methodWeights[method] || 0));
        }, 0);
    };

    const singleDeviceLoad = calculateSingleDeviceLoad();

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
                {getIcon()}
                <h3 className="font-semibold text-gray-900">{type}</h3>
                {Object.values(data.methods).reduce((sum, ratio) => sum + ratio, 0) !== 1 && (
                    <div className="ml-auto">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent className='bg-white border border-gray-200'>
                                    <p>Warning: The sum of the ratios for this device type is not 100%. This may cause inaccuracies in the collector load calculation.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>
            <div className="space-y-3">
                <div>
                    <Label className="text-sm text-gray-600 flex items-center gap-1">
                        Device Count 
                        {type.includes("Virtual Machines") && data.count > 2000 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className='bg-white border border-gray-200'>
                                        <p>When monitoring more than 2,000 virtual machines, it's recommended to have a dedicated collector for vCenter monitoring with a dedicated failover configured.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            value={data.count}
                            onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
                            className="mt-1 bg-white border-gray-200"
                        />
                    </div>
                </div>
                {showDetails && (
                    <>
                        <div className="space-y-4">
                            {/* Metrics Section */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Component className="w-4 h-4 text-blue-700" />
                                        <span className="text-gray-600">Base Instances</span>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                        {data.instances}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="w-4 h-4 text-blue-700" />
                                        <span className="text-gray-600">Load Score</span>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                        {Math.round(singleDeviceLoad * 10) / 10}
                                    </div>
                                </div>
                            </div>

                            {/* Collection Methods Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings className="w-4 h-4 text-blue-700" />
                                    <span className="text-gray-900 font-medium">Collection Methods</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(data.methods).map(([method, ratio]) => (
                                        <div
                                            key={method}
                                            className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-300"
                                        >
                                            <span className="capitalize text-gray-900 text-sm">{method}</span>
                                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                {Math.round(ratio * 100)}%
                                            </span>
                                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                <Weight className="w-3 h-3" />
                                                <span className="font-medium">{methodWeights[method]}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};