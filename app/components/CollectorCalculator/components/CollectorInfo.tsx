import React from 'react';
import { Server, Network, Cpu, HardDrive, MemoryStick } from 'lucide-react';
import EnhancedCard from '@/components/ui/enhanced-card';
import { collectorCapacities } from '../constants';

const CollectorInfo = () => {
    const collectorRequirements = {
        XXL: {
            cpu: '16 cores',
            memory: '32GB',
            disk: '35GB',
        },
        XL: {
            cpu: '8 cores',
            memory: '16GB',
            disk: '35GB',
        },
        LARGE: {
            cpu: '4 cores',
            memory: '8GB',
            disk: '35GB',
        },
        MEDIUM: {
            cpu: '2 cores',
            memory: '4GB',
            disk: '35GB',
        },
        SMALL: {
            cpu: '1 core',
            memory: '2GB',
            disk: '35GB',
        }
    };

    const networkPorts = [
        { port: 443, direction: 'Outbound-External', description: 'HTTPS connection to LogicMonitor Platform',protocol: 'TCP/TLS' },
        { port: 162, direction: 'Inbound-Internal', description: 'SNMP Traps',protocol: 'UDP' },
        { port: 514, direction: 'Inbound-Internal', description: 'Syslog',protocol: 'UDP' },
        { port: 2055, direction: 'Inbound-Internal', description: 'Netflow/IPFIX',protocol: 'UDP' },
        { port: 6343, direction: 'Inbound-Internal', description: 'SFlow/JFlow',protocol: 'UDP' },
        { port: 7214, direction: 'Inbound-Internal', description: 'Optional: Communication from custom JobMonitors to Collector',protocol: 'TCP' },
        { port: 161, direction: 'Outbound-Internal', description: 'SNMP monitoring',protocol: 'UDP' },
        { port: 22, direction: 'Outbound-Internal', description: 'SSH monitoring',protocol: 'TCP' },
        { port: 135, direction: 'Outbound-Internal', description: 'WMI/Powershell monitoring',protocol: 'TCP' },
        { port: "49152-65635", direction: 'Outbound-Internal', description: 'RPC Dynamic Ports for WMI/DCOM',protocol: 'TCP' },
        { port: "80,443", direction: 'Outbound-Internal', description: 'HTTP/S server/web/api monitoring',protocol: 'TCP' },
        { port: "5985,5986", direction: 'Outbound-Internal  ', description: 'WinRM',protocol: 'TCP' },
        { port: "1433,1434", direction: 'Outbound-Internal  ', description: 'SQL Server monitoring',protocol: 'TCP' },
        { port: 623, direction: 'Outbound-Internal  ', description: 'IPMI monitoring',protocol: 'UDP' }

    ];

    return (
        <div className="space-y-6">
            {/* Collector Sizes */}
            <EnhancedCard className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 p-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-blue-700" />
                        <h2 className="text-lg font-bold text-gray-900">Collector Sizes</h2>
                    </div>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(collectorRequirements).map(([size, requirements]) => (
                            <div key={size} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16">
                                            <span className="font-bold text-blue-700">{size}</span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Cpu className="w-4 h-4 text-blue-700" />
                                                <span className="text-gray-700">{requirements.cpu}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MemoryStick className="w-4 h-4 text-blue-700" />
                                                <span className="text-gray-700">{requirements.memory}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <HardDrive className="w-4 h-4 text-blue-700" />
                                                <span className="text-gray-700">{requirements.disk}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>Max Weight: {collectorCapacities[size as keyof typeof collectorCapacities].weight.toLocaleString()}</span>
                                        <span className="mx-2">|</span>
                                        <span>EPS: {collectorCapacities[size as keyof typeof collectorCapacities].eps.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </EnhancedCard>

            {/* Network Requirements */}
            <EnhancedCard className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 p-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <Network className="w-5 h-5 text-blue-700" />
                        <h2 className="text-lg font-bold text-gray-900">Network Requirements</h2>
                    </div>
                </div>
                <div className="p-4">
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded-t-lg border-b border-gray-200">
                            <div className="font-medium text-gray-900">Port</div>
                            <div className="font-medium text-gray-900">Direction</div>
                            <div className="col-span-2 font-medium text-gray-900">Description</div>
                            <div className="font-medium text-gray-900">Protocol</div>
                        </div>
                        {networkPorts.map((port, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-3 border-b last:border-b-0 border-gray-200">
                                <div className="text-blue-700 font-medium">{port.port}</div>
                                <div className="text-gray-600">{port.direction}</div>
                                <div className="col-span-2 text-gray-600">{port.description}</div>
                                <div className="text-gray-600">{port.protocol}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
};

export default CollectorInfo;
