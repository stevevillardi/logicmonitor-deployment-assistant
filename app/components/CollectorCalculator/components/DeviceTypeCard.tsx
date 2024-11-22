import { DeviceType } from '../types';
import { Server, Database, Router, Network, Settings, Activity, Wifi, HardDrive, Monitor, Cpu } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

interface DeviceTypeCardProps {
    type: string;
    data: DeviceType;
    onUpdate: (count: number) => void;
}

export const DeviceTypeCard = ({ type, data, onUpdate }: DeviceTypeCardProps) => {
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
                    <span className="text-gray-600">Base Instances:</span>
                    <span className="ml-2 font-medium text-gray-900">
                        {data.instances}
                    </span>
                </div>
                <div className="text-sm">
                    <span className="text-gray-600">Collection Methods:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(data.methods).map(([method, ratio]) => (
                            <span
                                key={method}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors duration-300"
                            >
                                {method} ({Math.round(ratio * 100)}%)
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};