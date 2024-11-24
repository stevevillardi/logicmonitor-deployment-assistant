import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ApiDocumentationBanner = () => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">API Documentation</span>
                    </div>
                    <p className="text-sm text-blue-600">
                        Explore and test LogicMonitor API endpoints. Authentication via{' '}
                        <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-medium">
                            LMv1
                        </code>{' '}
                        or{' '}
                        <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-medium">
                            Bearer
                        </code>{' '}
                        tokens. Include{' '}
                        <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-medium">
                            X-Version: 3
                        </code>{' '}
                        header to use the latest API version.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Button
                        variant="outline"
                        className="whitespace-nowrap h-9 text-blue-700 hover:text-blue-800"
                        asChild
                    >
                        <a
                            href="https://www.logicmonitor.com/support/rest-api-developers-guide/overview/using-rest-api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        >
                            View Documentation
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ApiDocumentationBanner;