import React from 'react';
import { Server, Info } from 'lucide-react';
import EnhancedCard from '@/components/ui/enhanced-card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const POVReadiness = () => {
    return (
        <div className="space-y-6 overflow-y-auto mb-4">
            <EnhancedCard className="min-h-[800px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Server className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">POV Readiness Assessment</h2>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex gap-2 text-sm text-blue-700 dark:text-blue-400">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">
                                    Coming Soon
                                </p>
                                <p>
                                    The POV Readiness tool is currently under development. 
                                    This tool will help assess and prepare for LogicMonitor POVs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
};

export default POVReadiness; 