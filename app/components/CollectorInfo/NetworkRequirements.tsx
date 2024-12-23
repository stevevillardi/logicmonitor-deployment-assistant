import { Network, ArrowRightLeft, Server, Globe, Database, Monitor, Cpu, Wrench } from "lucide-react";
import EnhancedCard from '@/components/ui/enhanced-card';
import React from 'react';
export const NetworkRequirements = () => {
    const networkPorts = [
        {
            icon: <Globe className="w-4 h-4 text-blue-700" />,
            port: 443,
            protocol: "TCP/TLS",
            direction: "Outbound-External",
            description: "HTTPS connection to LogicMonitor Platform",
            category: "Platform Communication"
        },
        {
            icon: <Database className="w-4 h-4 text-blue-700" />,
            port: "1433,1434",
            protocol: "TCP",
            direction: "Outbound-Internal",
            description: "SQL Server monitoring",
            category: "Database Monitoring"
        },
        {
            icon: <Cpu className="w-4 h-4 text-blue-700" />,
            port: 623,
            protocol: "UDP",
            direction: "Outbound-Internal",
            description: "IPMI monitoring",
            category: "Hardware Monitoring"
        },
        {
            icon: <Server className="w-4 h-4 text-blue-700" />,
            port: 161,
            protocol: "UDP",
            direction: "Outbound-Internal",
            description: "SNMP monitoring",
            category: "Linux/Network Monitoring"
        },
        {
            icon: <Server className="w-4 h-4 text-blue-700" />,
            port: 22,
            protocol: "TCP",
            direction: "Outbound-Internal",
            description: "SSH monitoring",
            category: "Linux/Network Monitoring"
        },
        {
            icon: <Globe className="w-4 h-4 text-blue-700" />,
            port: "80,443",
            protocol: "TCP",
            direction: "Outbound-Internal",
            description: "HTTP/S server/web/api monitoring",
            category: "Web/API Monitoring"
        },
        {
            icon: <Monitor className="w-4 h-4 text-blue-700" />,
            port: 135,
            protocol: "TCP",
            direction: "Outbound-Internal",
            description: "WMI/Powershell monitoring",
            category: "Windows Monitoring"
        },
        {
            icon: <Monitor className="w-4 h-4 text-blue-700" />,
            port: "49152-65635",
            protocol: "TCP",
            direction: "Outbound-Internal",
            description: "RPC Dynamic Ports for WMI/DCOM",
            category: "Windows Monitoring"
        },
        {
            icon: <Monitor className="w-4 h-4 text-blue-700" />,
            port: "5985,5986",
            protocol: "TCP",
            direction: "Outbound-Internal",
            description: "WinRM",
            category: "Windows Monitoring"
        },
        {
            icon: <Network className="w-4 h-4 text-blue-700" />,
            port: 2055,
            protocol: "UDP",
            direction: "Inbound-Internal",
            description: "Netflow/IPFIX",
            category: "Flow Collection"
        },
        {
            icon: <Network className="w-4 h-4 text-blue-700" />,
            port: 6343,
            protocol: "UDP",
            direction: "Inbound-Internal",
            description: "SFlow/JFlow",
            category: "Flow Collection"
        },
        {
            icon: <ArrowRightLeft className="w-4 h-4 text-blue-700" />,
            port: 514,
            protocol: "UDP",
            direction: "Inbound-Internal",
            description: "Syslog",
            category: "Log Collection"
        },
        {
            icon: <Server className="w-4 h-4 text-blue-700" />,
            port: 162,
            protocol: "UDP",
            direction: "Inbound-Internal",
            description: "SNMP Traps",
            category: "Linux/Network Monitoring"
        },
        {
            icon: <Wrench className="w-4 h-4 text-blue-700" />,
            port: 7214,
            protocol: "TCP",
            direction: "Inbound-Internal",
            description: "Communication from custom JobMonitors to Collector",
            category: "Custom Monitoring"
        }
    ];

    const sortedNetworkPorts = [...networkPorts].sort((a, b) => {
        // First sort by direction (Outbound before Inbound)
        if (b.direction !== a.direction) {
            return b.direction < a.direction ? -1 : 1;
        }
        // Then sort by category
        if (a.category !== b.category) {
            return a.category < b.category ? -1 : 1;
        }
        // Finally sort by port number
        return String(a.port).localeCompare(String(b.port), undefined, { numeric: true });
    });

    return (
        <EnhancedCard className="bg-white border border-gray-200">
            <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Network className="w-6 h-6 text-blue-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Network Requirements (Ports)</h2>
                </div>
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                    <div className="hidden md:grid md:grid-cols-6 gap-4 p-3 bg-gray-50 rounded-t-lg border-b border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Port</div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Protocol</div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</div>
                        <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</div>
                    </div>
                    {sortedNetworkPorts.map((port, index, array) => {
                        const isNewDirection = index === 0 || port.direction !== array[index - 1].direction;
                        const isNewCategory = index === 0 ||
                            port.category !== array[index - 1].category ||
                            port.direction !== array[index - 1].direction;

                        return (
                            <React.Fragment key={index}>
                                {isNewDirection && (
                                    <div className="bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                                        {port.direction}
                                    </div>
                                )}
                                <div className="md:hidden p-4 bg-white border-b border-gray-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {port.icon}
                                            <span className="text-sm font-medium text-gray-900">{port.category}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            port.direction.includes('Inbound')
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {port.direction}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <div className="text-gray-600 mb-1">Port</div>
                                            <code className="px-2 py-1 bg-blue-50 rounded text-blue-700">
                                                {port.port}
                                            </code>
                                        </div>
                                        <div>
                                            <div className="text-gray-600 mb-1">Protocol</div>
                                            <div className="font-mono">{port.protocol}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 text-sm mb-1">Description</div>
                                        <div className="text-gray-900">{port.description}</div>
                                    </div>
                                </div>
                                <div className="hidden md:grid md:grid-cols-6 gap-4 p-3 bg-white border-b last:border-b-0 border-gray-200 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        {port.icon}
                                        <span className="text-sm text-gray-600">{port.category}</span>
                                    </div>
                                    <div className="text-blue-700 font-medium">
                                        <code className="px-2 py-1 bg-blue-50 rounded text-sm">
                                            {port.port}
                                        </code>
                                    </div>
                                    <div className="text-gray-600 font-mono text-sm">{port.protocol}</div>
                                    <div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            port.direction.includes('Inbound')
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {port.direction}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-gray-600">{port.description}</div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </EnhancedCard>
    );
};

export default NetworkRequirements; 