import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const LoadingPlaceholder = () => {
  return (
    <div className="min-h-screen bg-[#040F4B] w-full flex items-center justify-center py-4 sm:p-8">
      <Card className="w-full max-w-[1700px] bg-white shadow-lg">
        <CardHeader className="border-gray-200 bg-gradient-to-r from-white to-blue-50/50 no-print">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 py-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="flex items-center">
                <Image
                  src="lmlogo.webp"
                  alt="LogicMonitor"
                  width={250}
                  height={47}
                  className="w-[150px] h-auto sm:w-[200px] lg:w-[250px]"
                  priority
                />
              </div>
              <div className="hidden sm:block h-10 w-px bg-gray-200"></div>
              <CardTitle className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#040F4B] to-blue-600 bg-clip-text text-transparent">
                Deployment Assistant
              </CardTitle>
            </div>
            <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-10 bg-gray-200 rounded-lg w-32"></div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pl-3 pr-3 bg-gray-50">
          <div className="space-y-6">
            {/* Navigation Placeholder */}
            <div className="hidden lg:block rounded-lg w-full bg-[#040F4B] px-4 py-2">
              <div className="flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="animate-pulse h-10 bg-gray-200/20 rounded-lg w-32"></div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Placeholder */}
            <div className="lg:hidden w-full bg-[#040F4B] px-4 py-2">
              <div className="animate-pulse h-10 bg-gray-200/20 rounded-lg w-full"></div>
            </div>

            {/* Content Area */}
            <div className="mt-6 min-h-[700px]">
              <div className="grid gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="animate-pulse h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingPlaceholder;