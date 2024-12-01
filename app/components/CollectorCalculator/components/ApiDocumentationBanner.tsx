import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ApiDocumentationBanner = () => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Info className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">API Documentation</span>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-600">
                        Explore and test LogicMonitor API endpoints. Authentication via{' '}
                        <code className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-medium my-0.5">
                            LMv1
                        </code>{' '}
                        or{' '}
                        <code className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-medium my-0.5">
                            Bearer
                        </code>{' '}
                        tokens. Include{' '}
                        <code className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-medium my-0.5">
                            X-Version: 3
                        </code>{' '}
                        header to use the latest API version.
                    </p>
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto whitespace-nowrap h-8 sm:h-9 text-blue-700 hover:text-blue-800 text-xs sm:text-sm"
                        asChild
                    >
                        <a
                            href="https://www.logicmonitor.com/support/rest-api-developers-guide/overview/using-logicmonitors-rest-api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        >
                            View Documentation
                            <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ApiDocumentationBanner;