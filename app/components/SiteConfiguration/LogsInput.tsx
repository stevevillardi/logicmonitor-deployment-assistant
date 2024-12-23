import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, AlertTriangle, MessageSquare, Server, Shield, Network, HardDrive, ChevronDown, ChevronRight } from 'lucide-react';
import { defaultLogTypes, defaultTrapTypes, defaultFlowTypes } from '../DeploymentAssistant/utils/constants';
import { useState } from 'react';

interface LogsInputProps {
    logs: {
        netflow: {
            fps: number;
            collectors: Array<{
                size: string;
                type: string;
                load: number;
            }>;
        };
        events: {  // Combined syslog and traps
            eps: number;
            collectors: Array<{
                size: string;
                type: string;
                load: number;
            }>;
        };
        devices: {
            firewalls: number;
            network: number;
            linux: number;
            storage: number;
            windows: number;
            loadbalancers: number;
            vcenter: number;
            iis: number;
            accesspoints: number;
            snmptraps: number;
            netflowdevices: number;
        };
    };
    onUpdate: (logs: any) => void;
    showDetails?: boolean;
}

export const LogsInput = ({ logs, onUpdate, showDetails = false }: LogsInputProps) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['logs', 'traps', 'netflow']));
    
    // Ensure devices object exists
    const safeDevices = logs.devices || {
        firewalls: 0,
        network: 0,
        linux: 0,
        storage: 0,
        windows: 0,
        loadbalancers: 0,
        vcenter: 0,
        iis: 0,
        accesspoints: 0,
        snmptraps: 0,
        netflowevices: 0
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'netflow':
                return <Activity className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
            case 'firewalls':
                return <Shield className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
            case 'network':
                return <Network className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
            case 'linux':
            case 'windows':
                return <Server className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
            default:
                return <MessageSquare className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
        }
    };

    const updateDeviceCount = (type: string, count: number) => {
        const newLogs = {
            ...logs,
            events: {
                ...logs.events,
                eps: type === 'snmptraps' 
                    ? (count || 0) * defaultTrapTypes.SNMP.eps 
                    : Object.entries(defaultLogTypes).reduce((total, [key, value]) => {
                        const deviceCount = type === key.toLowerCase() 
                            ? count 
                            : (logs.devices[key.toLowerCase() as keyof typeof safeDevices] || 0);
                        return total + (deviceCount * value.eps);
                    }, 0)
            },
            netflow: {
                ...logs.netflow,
                fps: type === 'netflowdevices' 
                    ? (count || 0) * defaultFlowTypes.NETFLOW.fps 
                    : logs.netflow.fps
            },
            devices: {
                ...safeDevices,
                [type]: count
            }
        };
        
        onUpdate(newLogs);
    };

    const calculateSectionEPS = (section: 'logs' | 'traps' | 'netflow') => {
        let total = 0;
        if (section === 'logs') {
            Object.entries(defaultLogTypes).forEach(([key, value]) => {
                const deviceCount = safeDevices[key.toLowerCase() as keyof typeof safeDevices] || 0;
                total += deviceCount * value.eps;
            });
        } else if (section === 'traps') {
            total = (safeDevices.snmptraps || 0) * defaultTrapTypes.SNMP.eps;
        } else if (section === 'netflow') {
            total = (safeDevices.netflowdevices || 0) * defaultFlowTypes.NETFLOW.fps;
        }
        return Math.round(total);
    };

    const calculateSectionDevices = (section: 'logs' | 'traps' | 'netflow') => {
        if (section === 'logs') {
            return Object.keys(defaultLogTypes).reduce((sum, key) => 
                sum + (safeDevices[key.toLowerCase() as keyof typeof safeDevices] || 0), 0);
        } else if (section === 'traps') {
            return safeDevices.snmptraps || 0;
        } else {
            return safeDevices.netflowdevices || 0;
        }
    };

    const toggleSection = (section: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(section)) {
            newSet.delete(section);
        } else {
            newSet.add(section);
        }
        setExpandedSections(newSet);
    };

    const renderSectionHeader = (
        title: string, 
        section: 'logs' | 'traps' | 'netflow',
        icon: JSX.Element
    ) => (
        <div 
            className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => toggleSection(section)}
        >
            <div className="flex items-center gap-3">
                {expandedSections.has(section) ? 
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : 
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                }
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
            <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900 rounded-full">
                    <span className="text-sm text-blue-700 dark:text-blue-400">{calculateSectionDevices(section)} devices</span>
                </div>
                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900 rounded-full">
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                        {calculateSectionEPS(section)} {section === 'netflow' ? 'FPS' : 'EPS'}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderDeviceCard = (key: string, value: any, icon: JSX.Element) => (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                    {icon}
                </div>
                <Label className="font-medium text-base text-gray-900 dark:text-gray-100">
                    {value.name}
                </Label>
            </div>
            <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <Label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Resource Count
                    </Label>
                    <Input
                        type="text"
                        value={safeDevices[key.toLowerCase() as keyof typeof safeDevices] || 0}
                        onChange={(e) => updateDeviceCount(key.toLowerCase(), parseInt(e.target.value) || 0)}
                        className="mt-2 dark:text-gray-100 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        placeholder="Enter count..."
                    />
                </div>

                {showDetails && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {key === 'netflowDevices' ? 'FPS per Device' : 'EPS per Device'}
                                </span>
                            </div>
                            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                                {value.eps || value.fps}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Average Size</span>
                            </div>
                            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                                {value.bytes} bytes
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );


    return (
        <div className="space-y-4">
            {/* System Logs Section */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {renderSectionHeader('System Logs', 'logs', <MessageSquare className="w-5 h-5 text-blue-700 dark:text-blue-400" />)}
                {expandedSections.has('logs') && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(defaultLogTypes).map(([key, value]) => 
                                <div key={key}>
                                    {renderDeviceCard(key, value, getIcon(key.toLowerCase()))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* SNMP Traps Section */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {renderSectionHeader('SNMP Traps', 'traps', <AlertTriangle className="w-5 h-5 text-blue-700 dark:text-blue-400" />)}
                {expandedSections.has('traps') && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div key="snmptraps">
                                {renderDeviceCard('snmptraps', defaultTrapTypes.SNMP, <AlertTriangle className="w-5 h-5 text-blue-700 dark:text-blue-400" />)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NetFlow Section */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {renderSectionHeader('NetFlow', 'netflow', <Activity className="w-5 h-5 text-blue-700 dark:text-blue-400" />)}
                {expandedSections.has('netflow') && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div key="netflowdevices">
                                {renderDeviceCard('netflowdevices', defaultFlowTypes.NETFLOW, <Activity className="w-5 h-5 text-blue-700 dark:text-blue-400" />)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};