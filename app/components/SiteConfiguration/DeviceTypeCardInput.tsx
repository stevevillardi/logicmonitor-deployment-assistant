import { DeviceType } from '../DeploymentAssistant/types/types';
import * as Icons from 'lucide-react';
import { Component, Settings, Calculator, Weight, LucideIcon, Info, Terminal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/enhanced-components';
import { AlertTriangle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { useState } from 'react';

interface DeviceTypeCardProps {
    type: string;
    data: DeviceType;
    methodWeights: Record<string, number>;
    onUpdate: (count: number, additionalCount?: number) => void;
    showDetails: boolean;
    onMethodUpdate?: (methods: Record<string, number>) => void;
}

export const DeviceTypeCard = ({ type, data, methodWeights, onUpdate, showDetails = false, onMethodUpdate }: DeviceTypeCardProps) => {
    const [useSSH, setUseSSH] = useState(false);
    const [useWinRM, setUseWinRM] = useState(false);

    const isLinuxDevice = type.toLowerCase().includes('linux');
    const isWindowsDevice = type.toLowerCase().includes('windows');

    const updateProtocolMethods = (isLinux: boolean, useAlternative: boolean) => {
        let newMethods: Record<string, number>;
        
        if (isLinux) {
            newMethods = useAlternative 
                ? { Script: 1 }  // SSH
                : { Script: 0.20, SNMPv3: 0.8 }; // SNMP
        } else {
            newMethods = useAlternative
                ? { WinRM: 0.20, Script: 0.75, JMX: 0.05 }  // WinRM
                : { WMI: 0.20, Script: 0.75, JMX: 0.05 };   // WMI
        }

        onMethodUpdate?.(newMethods);
    };

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

    const renderProtocolToggle = () => {
        if (!isLinuxDevice && !isWindowsDevice) return null;

        return (
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    {isLinuxDevice && (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-blue-700" />
                                <Label className="text-sm text-gray-700 font-medium">Collection Protocol</Label>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                                <span className={`text-sm ${!useSSH ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>SNMP</span>
                                <Switch
                                    checked={useSSH}
                                    onCheckedChange={(checked) => {
                                        setUseSSH(checked);
                                        updateProtocolMethods(true, checked);
                                    }}
                                    className="data-[state=checked]:bg-gray-200 data-[state=checked]:border-gray-300 data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border-gray-300"
                                />
                                <span className={`text-sm ${useSSH ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>SSH</span>
                            </div>
                        </div>
                    )}
                    {isWindowsDevice && (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-blue-700" />
                                <Label className="text-sm text-gray-700 font-medium">Collection Protocol</Label>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                                <span className={`text-sm ${!useWinRM ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>WMI</span>
                                <Switch
                                    checked={useWinRM}
                                    onCheckedChange={(checked) => {
                                        setUseWinRM(checked);
                                        updateProtocolMethods(false, checked);
                                    }}
                                    className="data-[state=checked]:bg-gray-200 data-[state=checked]:border-gray-300 data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border-gray-300"
                                />
                                <span className={`text-sm ${useWinRM ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>WinRM</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    {getIcon()}
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{type}</h3>
                {type.includes("Virtual Machines") && data.count > 2000 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent className='bg-white border border-gray-200'>
                                <p>When monitoring more than 2,000 virtual machines, it&apos;s recommended to have a dedicated collector for vCenter monitoring with a dedicated failover configured.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
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
            <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label className="text-sm text-gray-700 font-medium">
                                Resource Count 
                            </Label>
                            <Input
                                type="text"
                                value={data.count}
                                onChange={(e) => onUpdate(parseInt(e.target.value) || 0, data.additional_count)}
                                className="mt-2 bg-white border-gray-200"
                                maxLength={5}
                            />
                        </div>

                        {type.includes("Virtual Machines") && (
                            <div>
                                <Label className="text-sm text-gray-700 font-medium">
                                    vCenter Count
                                </Label>
                                <Input
                                    type="text"
                                    value={data.additional_count || 0}
                                    onChange={(e) => onUpdate(data.count, parseInt(e.target.value) || 0)}
                                    className="mt-2 bg-white border-gray-200"
                                    maxLength={5}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {(isLinuxDevice || isWindowsDevice) && renderProtocolToggle()}

                {showDetails && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Component className="w-4 h-4 text-blue-700" />
                                    <span className="text-gray-700 font-medium">Base Instances</span>
                                </div>
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {data.instances}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-blue-700" />
                                    <span className="text-gray-700 font-medium">Load Score</span>
                                </div>
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {Math.round(calculateSingleDeviceLoad() * 10) / 10}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className="w-4 h-4 text-blue-700" />
                                <span className="text-gray-700 font-medium">Collection Methods</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(data.methods).map(([method, ratio]) => (
                                    <div
                                        key={method}
                                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-300"
                                    >
                                        <span className="capitalize text-gray-900 text-sm font-medium">{method}</span>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
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
                )}
            </div>
        </div>
    );
};