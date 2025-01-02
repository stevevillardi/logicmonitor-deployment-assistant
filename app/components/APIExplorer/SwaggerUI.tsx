import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import ApiDocumentationBanner from './ApiDocumentationBanner';
import { devLog } from '../Shared/utils/debug';

const SwaggerLoadingPlaceholder = () => (
  <div className="space-y-6 p-4">
    {/* API Method Blocks */}
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="border border-gray-200 rounded-lg">
        {/* Method Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-6 w-96 bg-gray-200 rounded"></div>
          </div>
        </div>
        {/* Method Content */}
        <div className="p-4">
          <div className="space-y-4">
            <div className="animate-pulse h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SwaggerUIComponent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);
    
    const SwaggerYAML = process.env.NEXT_PUBLIC_SWAGGER_YAML
    
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
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full min-h-[800px]">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <Terminal className="w6 h-6 text-blue-700 dark:text-blue-400" />
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                        LogicMonitor API Explorer
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="p-2 sm:p-6">
                <ApiDocumentationBanner />

                <div className="min-h-[800px]">
                    {isLoading ? (
                        <div className="space-y-6 p-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="animate-pulse h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-900">
                                        <div className="space-y-4">
                                            <div className="animate-pulse h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="animate-pulse h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center text-red-600 dark:text-red-400 text-sm sm:text-base p-4">
                            {error}
                        </div>
                    ) : (
                        <SwaggerUI
                            url={SwaggerYAML}
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
                            requestSnippetsEnabled={true}
                            displayRequestDuration={true}
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

                /* Dark mode colors - updated */
                :root[class~="dark"] .swagger-ui,
                :root[class~="dark"] .swagger-ui .info .title,
                :root[class~="dark"] .swagger-ui .info li, 
                :root[class~="dark"] .swagger-ui .info p, 
                :root[class~="dark"] .swagger-ui .info table {
                    color: #e5e7eb;
                }

                :root[class~="dark"] .swagger-ui .opblock {
                    background: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(75, 85, 99, 0.4);
                }

                :root[class~="dark"] .swagger-ui .opblock .opblock-summary-description {
                    color: #9ca3af;
                }

                :root[class~="dark"] .swagger-ui .opblock .opblock-section-header {
                    background: rgba(31, 41, 55, 0.7);
                    border: 1px solid rgba(75, 85, 99, 0.4);
                    color: #e5e7eb;
                }

                :root[class~="dark"] .swagger-ui .opblock-description-wrapper,
                :root[class~="dark"] .swagger-ui .opblock-external-docs-wrapper,
                :root[class~="dark"] .swagger-ui .opblock-title_normal {
                    color: #e5e7eb;
                    background: rgba(17, 24, 39, 0.7);
                }

                :root[class~="dark"] .swagger-ui .opblock-body {
                    background: rgba(17, 24, 39, 0.7);
                }

                :root[class~="dark"] .swagger-ui .scheme-container {
                    background: rgba(17, 24, 39, 0.7);
                    border-bottom: 1px solid rgba(75, 85, 99, 0.4);
                }

                :root[class~="dark"] .swagger-ui section.models {
                    background: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(75, 85, 99, 0.4);
                }

                :root[class~="dark"] .swagger-ui section.models.is-open h4 {
                    border-bottom: 1px solid rgba(75, 85, 99, 0.4);
                    color: #e5e7eb;
                }

                :root[class~="dark"] .swagger-ui .model-container {
                    background: rgba(31, 41, 55, 0.7);
                    border: 1px solid rgba(75, 85, 99, 0.4);
                }

                :root[class~="dark"] .swagger-ui .parameter__name,
                :root[class~="dark"] .swagger-ui .parameter__type,
                :root[class~="dark"] .swagger-ui table.model tr.property-row td {
                    color: #e5e7eb;
                }

                :root[class~="dark"] .swagger-ui .parameter__in {
                    color: #9ca3af;
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

                code[class*=language-], pre[class*=language-] {
                    color: white;
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

                /* Dark mode colors - updated */
                :root[class~="dark"] .swagger-ui select,
                :root[class~="dark"] .swagger-ui input[type=text],
                :root[class~="dark"] .swagger-ui .parameters-col_description input[type=text],
                :root[class~="dark"] .swagger-ui .parameters-col_description select {
                    background-color: rgba(31, 41, 55, 0.9);
                    border: 1px solid rgba(75, 85, 99, 0.4);
                    color: #e5e7eb;
                }

                :root[class~="dark"] .swagger-ui .servers-title,
                :root[class~="dark"] .swagger-ui .servers > label select {
                    color: #e5e7eb;
                }

                :root[class~="dark"] .swagger-ui .servers > label {
                    color: #9ca3af;
                }

                :root[class~="dark"] .swagger-ui .btn {
                    background: rgba(31, 41, 55, 0.9);
                    border: 1px solid rgba(75, 85, 99, 0.4);
                    color: #e5e7eb;
                }

                :root[class~="dark"] .swagger-ui .btn:hover {
                    background: rgba(55, 65, 81, 0.9);
                }

                :root[class~="dark"] .swagger-ui .execute-wrapper {
                    background: rgba(17, 24, 39, 0.7);
                }

                :root[class~="dark"] .swagger-ui .btn.execute {
                    background: #1d4ed8;
                    border-color: #1e40af;
                    color: white;
                }

                :root[class~="dark"] .swagger-ui .btn.execute:hover {
                    background: #1e40af;
                }

                :root[class~="dark"] .swagger-ui .servers > label select:focus {
                    outline: none;
                    border-color: #60a5fa;
                }

                /* Dark mode text colors - enhanced */
                :root[class~="dark"] .swagger-ui,
                :root[class~="dark"] .swagger-ui .info .title,
                :root[class~="dark"] .swagger-ui .info li, 
                :root[class~="dark"] .swagger-ui .info p, 
                :root[class~="dark"] .swagger-ui .info table,
                :root[class~="dark"] .swagger-ui .model,
                :root[class~="dark"] .swagger-ui .model-title,
                :root[class~="dark"] .swagger-ui table thead tr th,
                :root[class~="dark"] .swagger-ui table thead tr td,
                :root[class~="dark"] .swagger-ui .response-col_status,
                :root[class~="dark"] .swagger-ui .response-col_description,
                :root[class~="dark"] .swagger-ui .opblock-description,
                :root[class~="dark"] .swagger-ui .opblock-external-docs-wrapper,
                :root[class~="dark"] .swagger-ui .opblock .opblock-section-header h4,
                :root[class~="dark"] .swagger-ui .tab li,
                :root[class~="dark"] .swagger-ui .opblock-tag {
                    color: #e5e7eb;
                }

                /* Headers and titles */
                :root[class~="dark"] .swagger-ui .opblock .opblock-summary-operation-id,
                :root[class~="dark"] .swagger-ui .opblock .opblock-summary-path,
                :root[class~="dark"] .swagger-ui .opblock .opblock-summary-path__deprecated {
                    color: #d1d5db;
                }

                /* Method names and small text */
                :root[class~="dark"] .swagger-ui .opblock .opblock-summary-method,
                :root[class~="dark"] .swagger-ui .parameter__name,
                :root[class~="dark"] .swagger-ui .parameter__type,
                :root[class~="dark"] .swagger-ui .parameter__deprecated,
                :root[class~="dark"] .swagger-ui .parameter__in,
                :root[class~="dark"] .swagger-ui table.headers td {
                    color: #9ca3af;
                }

                /* Response codes */
                :root[class~="dark"] .swagger-ui .response-col_status {
                    color: #93c5fd;
                }

                /* Response content */
                :root[class~="dark"] .swagger-ui .microlight {
                    color: #e5e7eb;
                    background-color: rgba(17, 24, 39, 0.7);
                }

                /* Code blocks and examples */
                :root[class~="dark"] .swagger-ui .highlight-code {
                    background-color: rgba(17, 24, 39, 0.7);
                }

                /* Schema properties */
                :root[class~="dark"] .swagger-ui .prop-type {
                    color: #93c5fd;
                }

                :root[class~="dark"] .swagger-ui .prop-format {
                    color: #9ca3af;
                }

                /* Table cells */
                :root[class~="dark"] .swagger-ui td {
                    color: #e5e7eb;
                }

                /* Links */
                :root[class~="dark"] .swagger-ui a {
                    color: #60a5fa;
                }

                :root[class~="dark"] .swagger-ui a:hover {
                    color: #93c5fd;
                }

                /* Model property colors */
                :root[class~="dark"] .swagger-ui .model-box {
                    background-color: rgba(31, 41, 55, 0.7);
                }

                :root[class~="dark"] .swagger-ui .model .property.primitive {
                    color: #93c5fd;
                }

                /* Required field asterisk */
                :root[class~="dark"] .swagger-ui .required {
                    color: #ef4444;
                }

                /* Model toggle arrows */
                :root[class~="dark"] .swagger-ui .model-toggle:after {
                    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(229, 231, 235)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>") center no-repeat;
                }

                /* Response examples */
                :root[class~="dark"] .swagger-ui .example {
                    color: #d1d5db;
                    background-color: rgba(31, 41, 55, 0.7);
                }

                /* Markdown content */
                :root[class~="dark"] .swagger-ui .markdown p,
                :root[class~="dark"] .swagger-ui .markdown li {
                    color: #e5e7eb;
                }

                /* Operation description */
                :root[class~="dark"] .swagger-ui .opblock-description-wrapper p {
                    color: #d1d5db;
                }

                /* HTTP Method labels styling for dark mode */
                :root[class~="dark"] .swagger-ui .opblock-summary-method {
                    min-width: 80px;
                    text-align: center;
                    font-weight: bold;
                    border-radius: 4px;
                }

                /* GET method */
                :root[class~="dark"] .swagger-ui .opblock-get .opblock-summary-method {
                    background-color: #2563eb;
                    color: white;
                }

                /* POST method */
                :root[class~="dark"] .swagger-ui .opblock-post .opblock-summary-method {
                    background-color: #16a34a;
                    color: white;
                }

                /* PUT method */
                :root[class~="dark"] .swagger-ui .opblock-put .opblock-summary-method {
                    background-color: #ea580c;
                    color: white;
                }

                /* DELETE method */
                :root[class~="dark"] .swagger-ui .opblock-delete .opblock-summary-method {
                    background-color: #dc2626;
                    color: white;
                }

                /* PATCH method */
                :root[class~="dark"] .swagger-ui .opblock-patch .opblock-summary-method {
                    background-color: #059669;
                    color: white;
                }

                /* ... rest of your existing styles ... */
            `}</style>
        </Card>
    );
};

export default SwaggerUIComponent;