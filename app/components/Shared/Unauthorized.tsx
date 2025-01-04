import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-[#040F4B] w-full flex items-center justify-center py-4 sm:p-8 antialiased">
            <Card className="w-full max-w-[600px] bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-blue-200 dark:border-blue-800 antialiased overflow-hidden">
                <CardHeader className="border-b border-blue-100 dark:border-blue-800 bg-gradient-to-r from-white dark:from-gray-900 to-blue-50/50 dark:to-blue-900/10">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Access Restricted
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            This section is only accessible to authorized LogicMonitor employees.
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => {
                                    window.location.href = '/home';
                                }}
                                className="bg-[#040F4B] hover:bg-[#0A1B6F] dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors"
                            >
                                Return Home
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Unauthorized; 