import { IoLogoWindows } from "react-icons/io";
import { FaLinux } from "react-icons/fa";
import { Info } from 'lucide-react';
import { Site } from '../DeploymentAssistant/types/types';
import { useState, useEffect } from 'react';

interface RecommendationType {
    recommended: 'Windows' | 'Linux';
    reason: string;
    icon: JSX.Element;
}

const CollectorRecommendation = () => {
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

    const recommendation: RecommendationType = hasWindowsDevices ? {
        recommended: 'Windows',
        reason: 'Since you are monitoring Windows workloads, a Windows Collector is required for monitoring those devices. For sites that contain no Windows based workloads or for Netflow/Logs collectors, a Linux Collector is recommended for better performance and resource utilization ',
        icon: <IoLogoWindows className="w-4 h-4 text-blue-700" />
    } : {
        recommended: 'Linux',
        reason: 'Since you are not monitoring any Windows workloads, a Linux Collector is recommended for better performance and resource utilization.',
        icon: <FaLinux className="w-4 h-4 text-emerald-700" />
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Collector OS Recommendation
            </h3>
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {recommendation.icon}
                </div>
                <div>
                    <p className="font-medium text-gray-900">
                        Recommended OS based on your configuration: {recommendation.recommended}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        {recommendation.reason}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CollectorRecommendation; 