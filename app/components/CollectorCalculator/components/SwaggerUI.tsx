import React, { useEffect, useRef, useState } from 'react';
import { Info, ExternalLink, Terminal } from 'lucide-react';
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
        }, 1000);

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
        <Card className="bg-white border-gray-200 h-full">
            <CardHeader className="border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Terminal className="w-6 h-6 text-blue-700" />
                    <CardTitle className="text-gray-900">LogicMonitor API Explorer</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="p-6">
            <ApiDocumentationBanner />

                <div className="min-h-[600px] relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-600">
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
                /* Base wrapper styles */
                .swagger-ui .wrapper {
                padding: 0;
                margin: 0;
                max-width: none;
                }

                /* Info section alignment */
                .swagger-ui .info {
                margin: 20px 0;
                }

                .swagger-ui .info > div {
                margin: 0 !important;
                padding: 0 !important;
                }

                .swagger-ui .info .main > div {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                gap: 2rem;
                }

                .swagger-ui .info .main .info__tos {
                order: 1;
                }

                code[class*="language-"], pre[class*="language-"] {
                    color: white !important;
                }

                .swagger-ui .info .main .info__contact {
                order: 2;
                }

                .swagger-ui .info .main .info__license {
                order: 3;
                }

                /* Scheme container */
                .swagger-ui .scheme-container {
                background: transparent;
                box-shadow: none;
                padding: 0;
                margin: 0;
                position: sticky;
                top: 0;
                z-index: 10;
                }

                /* Improve server dropdown styling */
                .swagger-ui .servers-title {
                margin-bottom: 8px;
                color: #1e293b;
                font-size: 14px;
                }


                .swagger-ui .servers-title {
                margin: 0 0 8px 0;
                text-align: left;
                }

                .swagger-ui .servers > label {
                margin: 0;
                }

                .swagger-ui .servers select {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 6px 12px;
                font-size: 14px;
                color: #1e293b;
                width: 300px;
                }

                .swagger-ui .servers select:focus {
                outline: none;
                border-color: #2563eb;
                box-shadow: 0 0 0 1px #2563eb;
                }


                /* Operation blocks */
                .swagger-ui .opblock {
                border-radius: 8px;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                margin: 0 0 16px 0;
                }

                /* Operation summary row */
                .swagger-ui .opblock .opblock-summary {
                padding: 8px 16px;
                gap: 1rem;
                align-items: center;
                }

                .swagger-ui .opblock .opblock-summary > * {
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                }

                .swagger-ui .opblock .opblock-summary-path {
                flex-grow: 0;
                flex-shrink: 0;
                max-width: none;
                padding: 0;
                white-space: nowrap;
                overflow: visible;
                color: #1a365d;
                font-weight: 500;
                }

                .swagger-ui .opblock .opblock-summary-description {
                text-align: left;
                flex-grow: 1;
                font-size: 0.875rem;
                color: #4a5568;
                padding: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                }

                .swagger-ui .opblock .opblock-summary-operation-id {
                flex-grow: 0;
                flex-shrink: 0;
                font-size: 0.875rem;
                color: #718096;
                padding: 0;
                }

                /* Form inputs */
                .swagger-ui select,
                .swagger-ui input[type=text],
                .swagger-ui textarea {
                background-color: white;
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
                }

                /* Tags and headings */
                .swagger-ui .opblock-tag {
                color: #1a365d;
                font-weight: 600;
                border: none;
                margin-top: 24px;
                }

                /* Method colors */
                .swagger-ui .opblock-get {
                background: rgba(97, 175, 254, .1);
                border-color: #61affe;
                }

                .swagger-ui .opblock-post {
                background: rgba(73, 204, 144, .1);
                border-color: #49cc90;
                }

                .swagger-ui .opblock-put {
                background: rgba(252, 161, 48, .1);
                border-color: #fca130;
                }

                .swagger-ui .opblock-delete {
                background: rgba(249, 62, 62, .1);
                border-color: #f93e3e;
                }

                .swagger-ui .servers .computed-url {
                    margin: 1em 0;
                }

                .swagger-ui .opblock-patch {
                background: rgba(80, 227, 194, .1);
                border-color: #50e3c2;
                }

                /* Hide top bar */
                .swagger-ui .topbar {
                display: none;
                }

                /* Layout fixes */
                .swagger-ui {
                height: 100%;
                overflow: auto;
                }


                /* Font overrides */
                .swagger-ui,
                .swagger-ui .opblock-tag,
                .swagger-ui .opblock-description-wrapper p,
                .swagger-ui .opblock-external-docs-wrapper p,
                .swagger-ui .opblock-title_normal p {
                font-family: inherit;
                }

                /* Clean up margins and paddings */
                .swagger-ui .wrapper > .block {
                padding: 0;
                }

                .swagger-ui .info .title {
                margin: 0;
                color: #1a365d;
                }

                .swagger-ui .info .title small {
                background: #e2e8f0;
                }

                /* Response section */
                .swagger-ui .responses-wrapper {
                padding: 16px;
                }

                .swagger-ui table.responses-table {
                margin: 0;
                }

                .swagger-ui .response-col_status {
                width: 100px;
                }
            `}</style>
        </Card>
    );
};

export default SwaggerUIComponent;