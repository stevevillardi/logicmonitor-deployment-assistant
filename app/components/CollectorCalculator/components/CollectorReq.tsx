import { Server } from 'lucide-react';
import { Info } from 'lucide-react';
import EnhancedCard from '@/components/ui/enhanced-card';
import { defaultDeviceTypes } from '../constants';
import { useEffect, useState } from 'react';
import { Site } from '../types';

const CollectorReq = () => {
    // Get the config from localStorage
    const [hasWindowsDevices, setHasWindowsDevices] = useState(false);

    useEffect(() => {
        const checkForWindowsDevices = () => {
            const savedSites = localStorage.getItem('collectorSites');
            if (!savedSites) return false;

            const sites = JSON.parse(savedSites);
            
            return sites.some((site: Site) => {
                return Object.entries(site.devices).some(([deviceType, data]) => {
                    const isWindowsDevice = deviceType.toLowerCase().includes('windows');
                    return isWindowsDevice && data.count > 0;
                });
            });
        };

        setHasWindowsDevices(checkForWindowsDevices());

        // Add event listener for storage changes
        const handleStorageChange = () => {
            setHasWindowsDevices(checkForWindowsDevices());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const recommendation = hasWindowsDevices ? {
        recommended: 'Windows',
        reason: 'Windows Collector is required for monitoring Windows-based devices.',
        icon: <Server className="w-4 h-4 text-blue-700" />
    } : {
        recommended: 'Linux',
        reason: 'Linux Collector is recommended for better performance and resource utilization.',
        icon: <Server className="w-4 h-4 text-emerald-700" />
    };

    return (
        <div className="space-y-6">
            {/* Operating System Support Section */}
            <EnhancedCard className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 p-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-blue-700" />
                        <h2 className="text-lg font-bold text-gray-900">Collector Operating System Support</h2>
                    </div>
                </div>
                <div className="p-4">
                    <div className="space-y-6">
                        {/* OS Support Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-blue-700 mb-2">
                                <span className="font-medium">Support Policy</span>
                            </div>
                            <p className="text-sm text-blue-600 mb-4">
                                LogicMonitor follows the Microsoft Lifecycle Policy for the "Extended Support End Date" and
                                the Red Hat Enterprise Linux Life Cycle for the "End of Maintenance Support 2 (Product retirement)"
                                date to determine supported operating systems for Collector installation.
                            </p>
                        </div>

                        {/* Supported OS Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Server className="w-4 h-4 text-blue-700" />
                                    Windows Support
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Supported versions follow Microsoft's Extended Support lifecycle
                                    </p>
                                    <div className="space-y-1">
                                        {['Windows Server 2012 R2 and newer', 'Windows Server Core 2012 R2 and newer'].map((os) => (
                                            <div key={os} className="px-3 py-2 bg-white rounded border border-gray-200">
                                                <span className="text-sm font-medium text-gray-900">{os}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Server className="w-4 h-4 text-emerald-700" />
                                    Linux Support
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Supported distributions:</p>
                                    <div className="space-y-1">
                                        {['Amazon Linux', 'CentOS', 'Debian', 'RHEL', 'Ubuntu'].map((os) => (
                                            <div key={os} className="px-3 py-2 bg-white rounded border border-gray-200">
                                                <span className="text-sm font-medium text-gray-900">{os}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Section */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Collector OS Recommendation
                            </h3>
                            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    {recommendation.icon}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Recommended OS: {recommendation.recommended}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {recommendation.reason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
};

export default CollectorReq;