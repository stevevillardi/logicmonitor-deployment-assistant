import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LoadingPlaceholder = () => {
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    // Show refresh button after 10 seconds
    const timer = setTimeout(() => {
      setShowRefresh(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#040F4B] w-full flex items-center justify-center py-4 sm:p-8">
      <Card className="w-full max-w-[1700px] bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-blue-200 dark:border-blue-800 antialiased overflow-hidden">
        <CardHeader className="border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white dark:from-gray-900 to-blue-50/50 dark:to-blue-900/10 no-print">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 py-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="flex items-center">
                <Rocket className="w-10 h-10 text-[#040F4B] dark:text-blue-400" />
              </div>
              <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
              <CardTitle className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#040F4B] to-blue-600 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent antialiased">
                Deployment Assistant
              </CardTitle>
            </div>
            <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 antialiased"></div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pl-3 pr-3 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-6">
            {/* Navigation Placeholder */}
            <div className="hidden lg:block rounded-lg w-full bg-[#040F4B] dark:bg-gray-800 px-4 py-2">
              <div className="flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="animate-pulse h-10 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg w-32"></div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Placeholder */}
            <div className="lg:hidden w-full bg-[#040F4B] dark:bg-gray-800 px-4 py-2">
              <div className="animate-pulse h-10 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg w-full"></div>
            </div>

            {/* Content Area */}
            <div className="mt-6 min-h-[700px]">
              <div className="grid gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {showRefresh && (
        <div className="absolute bottom-8 w-full flex justify-center">
          <Button
            onClick={handleRefresh}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Refresh Page
          </Button>
        </div>
      )}
    </div>
  );
};
export default LoadingPlaceholder;
