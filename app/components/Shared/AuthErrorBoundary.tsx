'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';
import { devError } from '@/app/components/Shared/utils/debug';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class AuthErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { 
            hasError: true,
            error 
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        devError('Auth Error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    private handleLogout = () => {
        window.location.href = '/login';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <div className="border-b border-blue-100 dark:border-gray-700 p-4 pb-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <h2 className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                                    Authentication Error
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-blue-300">
                                There was a problem with your authentication session
                            </p>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Important Note */}
                            <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-700 rounded-lg p-2 sm:p-3">
                                <div className="flex gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="mb-2">
                                            This could be due to one of the following reasons:
                                        </p>
                                        <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-disc list-inside pl-1">
                                            <li>Your session has expired</li>
                                            <li>Invalid or missing credentials</li>
                                            <li>Network connectivity issues</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-blue-100 dark:border-gray-700 pt-4 mt-4">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={this.handleRetry}
                                        className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        onClick={this.handleLogout}
                                        variant="outline"
                                        className="gap-2 w-full bg-white sm:w-auto border-gray-200 dark:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-400 dark:hover:text-gray-800"
                                    >
                                        Return to Login
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AuthErrorBoundary; 