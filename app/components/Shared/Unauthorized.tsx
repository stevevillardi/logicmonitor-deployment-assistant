import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Unauthorized = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#040F4B] w-full flex items-center justify-center py-4 sm:p-8 antialiased">
            <Card className="w-full max-w-[600px] bg-white shadow-lg rounded-2xl border border-blue-200 antialiased overflow-hidden">
                <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            Access Restricted
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            This section is only accessible to authorized LogicMonitor employees.
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => router.push('/home')}
                                className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white transition-colors"
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