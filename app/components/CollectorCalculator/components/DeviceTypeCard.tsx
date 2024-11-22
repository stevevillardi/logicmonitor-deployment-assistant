import { DeviceType } from '../types';
import { Server, Database, Router, Network, Settings, Activity, Wifi, HardDrive, Monitor, Cpu, Calculator, Dumbbell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

interface DeviceTypeCardProps {
    type: string;
    data: DeviceType;
    methodWeights: Record<string, number>;
    onUpdate: (count: number) => void;
}

export const DeviceTypeCard = ({ type, data, methodWeights, onUpdate }: DeviceTypeCardProps) => {
    const getIcon = () => {
        switch (type) {
            case "Linux Servers":
            case "Windows Servers":
                return <Server className="w-6 h-6 text-blue-700" />;
            case "SQL Servers (Linux)":
            case "SQL Servers (Windows)":
                return <Database className="w-6 h-6 text-blue-700" />;
            case "Routers":
                return <Router className="w-6 h-6 text-blue-700" />;
            case "Switches":
                return <Network className="w-6 h-6 text-blue-700" />;
            case "Firewalls":
                return <Settings className="w-6 h-6 text-blue-700" />;
            case "SD-WAN Edges":
                return <Activity className="w-6 h-6 text-blue-700" />;
            case "Access Points":
                return <Wifi className="w-6 h-6 text-blue-700" />;
            case "Storage Arrays":
                return <HardDrive className="w-6 h-6 text-blue-700" />;
            case "vCenter VMs":
            case "ESXi Hosts":
                return <Monitor className="w-6 h-6 text-blue-700" />;
            default:
                return <Cpu className="w-6 h-6 text-blue-700" />;
        }
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
                    <div className="ml-auto" title="Collection method ratios do not sum to 100%">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                )}
            </div>
            <div className="space-y-3">
                <div>
                    <Label className="text-sm text-gray-600">Device Count</Label>
                    <Input
                        type="text"
                        value={data.count}
                        onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
                        className="mt-1 bg-white border-gray-200 focus:border-blue-700 focus:ring-blue-700"
                    />
                </div>
                <div className="text-sm">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Base Instances:</span>
                        <span className="font-medium text-gray-900">
                            {data.instances}
                        </span>
                    </div>
                    <div className="flex justify-between items-center ">
                        <span className="text-gray-600">Load Score per Device:</span>
                        <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-blue-700" />
                            <span className="font-medium text-blue-700">
                                {Math.round(singleDeviceLoad * 10) / 10}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 text-sm">
                        <span className="text-gray-600 font-medium">Collection Methods:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(data.methods).map(([method, ratio]) => (
                                <div
                                    key={method}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all duration-300 shadow-sm hover:shadow"
                                >
                                    <span className="capitalize">{method}</span>
                                    <span className="px-1.5 py-0.5 bg-blue-100 rounded-md">
                                        {Math.round(ratio * 100)}%
                                    </span>
                                    <div className="flex items-center gap-1 text-blue-500">
                                        <span>×</span>
                                        <Dumbbell className="w-3.5 h-3.5" />
                                        <span className="font-semibold">{methodWeights[method]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};