import { Bot } from 'lucide-react';
import EnhancedCard from '@/components/ui/enhanced-card';
import { IoLogoWindows } from "react-icons/io";
import { FaLinux } from "react-icons/fa";
import CollectorRecommendation from './CollectorRecommendation';

const CollectorReq = () => {
    return (
        <div className="space-y-6 overflow-y-auto">
            {/* Operating System Support Section */}
            <EnhancedCard className="bg-white border border-gray-200">
                <div className="border-b bg-gray border-gray-200 bg-gray-50 p-4 rounded-t-lg">
                    <div className="flex flex-wrap items-center gap-3">
                        <Bot className="w-7 h-7 text-blue-700" />
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Collector Operating System Support</h2>
                    </div>
                </div>
                <div className="p-4">
                    <div className="space-y-4">
                        {/* OS Support Info */}
                        <div className="rounded-lg p-2">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-900">Support Policy</h4>
                                <p className="text-sm text-gray-900">
                                    LogicMonitor follows the <a 
                                        href="https://learn.microsoft.com/en-us/lifecycle/" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Microsoft Lifecycle Policy
                                    </a> for the &quot;Extended Support End Date&quot; and the <a 
                                        href="https://access.redhat.com/support/policy/updates/errata" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Red Hat Enterprise Linux Life Cycle
                                    </a> for the &quot;End of Maintenance Support 2 (Product retirement)&quot; date to determine supported operating systems for Collector installation.
                                </p>
                            </div>
                        </div>

                        {/* Supported OS Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <IoLogoWindows className="w-6 h-6 text-emerald-700" />
                                    Windows Support
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Supported versions follow Microsoft&apos;s Extended Support lifecycle
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
                                    <FaLinux className="w-6 h-6 text-emerald-700" />
                                    Linux Support
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Supported distributions:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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
                        <CollectorRecommendation />
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
};

export default CollectorReq;