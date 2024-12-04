import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import ApiDocumentationBanner from './ApiDocumentationBanner';
import { devLog } from '@/utils/debug';

const SwaggerUIComponent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use effect to set loading to false after initial render
    useEffect(() => {
        // Small delay to ensure SwaggerUI has initialized
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Define a request interceptor function
    const requestInterceptor = (req: any) => {
        // Get the original URL
        const originalUrl = req.url;

        // Check if this is a LogicMonitor API call
        if (originalUrl.includes('logicmonitor.com')) {
            devLog('Intercepting LogicMonitor API call:', originalUrl.toString());
            // Extract the path after /santaba/rest/
            const pathMatch = originalUrl.match(/\/santaba\/rest\/(.*)/);
            if (pathMatch) {
                const apiPath = pathMatch[1];
                // Rewrite the URL to use our proxy
                req.url = `/santaba/rest/${apiPath}`;

                // Forward the company domain in a custom header
                const companyMatch = originalUrl.match(/https:\/\/(.*?)\.logicmonitor\.com/);
                if (companyMatch) {
                    req.headers['x-lm-company'] = companyMatch[1];
                }

                devLog('Rewritten URL:', req.url);
                devLog('Added company header:', companyMatch ? companyMatch[1] : 'none');
            }
        }
        return req;
    };

    return (
        <Card className="bg-white border-gray-200 h-full min-h-[800px]">
            <CardHeader className="border-b border-gray-200 bg-gray-50 p-4sm:p-6">
                <div className="flex items-center gap-3">
                    <Terminal className="w-5 sm:w-6 h-5 sm:h-6 text-blue-700" />
                    <CardTitle className="text-base sm:text-lg">LogicMonitor API Explorer</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="p-2 sm:p-6">
                <ApiDocumentationBanner />

                <div className="min-h-[800px] relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-600 text-sm sm:text-base p-4">
                            {error}
                        </div>
                    ) : (
                        <SwaggerUI
                            url="/api-specs/logicmonitor-api.yaml"
                            docExpansion="list"
                            deepLinking={false}
                            defaultModelsExpandDepth={-1}
                            displayOperationId={false}
                            filter={false}
                            showExtensions={false}
                            showCommonExtensions={false}
                            tryItOutEnabled={true}
                            requestInterceptor={requestInterceptor}
                            layout="BaseLayout"
                            persistAuthorization={true}
                        />
                    )}
                </div>
            </CardContent>

            <style jsx global>{`
                /* Base responsive styles */
                .swagger-ui .wrapper {
                    padding: 0;
                    margin: 0;
                    max-width: none;
                    overflow-x: auto;
                }

                /* Mobile-first info section */
                .swagger-ui .info {
                    margin: 10px 0;
                    padding: 0 10px;
                }

                @media (min-width: 640px) {
                    .swagger-ui .info {
                        margin: 20px 0;
                        padding: 0;
                    }
                }

                /* Responsive server selection */
                .swagger-ui .servers select {
                    width: 100%;
                    max-width: 300px;
                    font-size: 14px;
                }

                /* Operation blocks responsive styling */
                .swagger-ui .opblock {
                    margin: 0 0 12px 0;
                    border-radius: 6px;
                }

                .swagger-ui .opblock .opblock-summary {
                    padding: 8px;
                }

                @media (min-width: 640px) {
                    .swagger-ui .opblock .opblock-summary {
                        padding: 8px 16px;
                    }
                }

                /* Responsive operation summary */
                .swagger-ui .opblock .opblock-summary-path {
                    font-size: 13px;
                    word-break: break-all;
                }

                @media (min-width: 640px) {
                    .swagger-ui .opblock .opblock-summary-path {
                        font-size: 14px;
                        word-break: normal;
                    }
                }

                /* Responsive description */
                .swagger-ui .opblock .opblock-summary-description {
                    font-size: 12px;
                    display: none;
                }

                @media (min-width: 640px) {
                    .swagger-ui .opblock .opblock-summary-description {
                        display: block;
                        font-size: 14px;
                    }
                }

                /* Form inputs responsive */
                .swagger-ui select,
                .swagger-ui input[type=text],
                .swagger-ui textarea {
                    max-width: 100%;
                    font-size: 14px;
                }

                /* Response section responsive */
                .swagger-ui .responses-wrapper {
                    padding: 8px;
                    overflow-x: auto;
                }

                @media (min-width: 640px) {
                    .swagger-ui .responses-wrapper {
                        padding: 16px;
                    }
                }

                /* Table responsive */
                .swagger-ui table {
                    display: block;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                /* Parameters section */
                .swagger-ui .parameters-container {
                    overflow-x: auto;
                }

                .swagger-ui .parameter__name {
                    font-size: 12px;
                }

                @media (min-width: 640px) {
                    .swagger-ui .parameter__name {
                        font-size: 14px;
                    }
                }

                /* Request body section */
                .swagger-ui .opblock-description-wrapper {
                    padding: 8px;
                }

                @media (min-width: 640px) {
                    .swagger-ui .opblock-description-wrapper {
                        padding: 15px;
                    }
                }

                /* Authorization section */
                .swagger-ui .auth-wrapper {
                    padding: 8px;
                }

                @media (min-width: 640px) {
                    .swagger-ui .auth-wrapper {
                        padding: 16px;
                    }
                }

                /* Models section */
                .swagger-ui section.models {
                    padding: 8px;
                }

                @media (min-width: 640px) {
                    .swagger-ui section.models {
                        padding: 16px;
                    }
                }

                /* Try it out button */
                .swagger-ui .try-out__btn {
                    padding: 4px 8px;
                    font-size: 12px;
                }

                @media (min-width: 640px) {
                    .swagger-ui .try-out__btn {
                        padding: 6px 12px;
                        font-size: 14px;
                    }
                }

                /* Execute button */
                .swagger-ui .btn.execute {
                    padding: 6px 12px;
                    font-size: 12px;
                }

                @media (min-width: 640px) {
                    .swagger-ui .btn.execute {
                        padding: 8px 16px;
                        font-size: 14px;
                    }
                }

                /* ... rest of your existing styles ... */
            `}</style>
        </Card>
    );
};

export default SwaggerUIComponent;