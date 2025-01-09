'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Button } from '@/components/ui/button';
import { Save, Send, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function POVHeader() {
  const { state } = usePOV();
  const { pov } = state;
  const router = useRouter();

  const handleCancel = () => {
    router.push('/pov');
  };

  const handleBack = () => {
    router.push('/pov');
  };

  return (
    <header className="border-b border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to POV List
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
              {pov ? pov.title : 'New POV'}
            </h1>
            {pov && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pov.customer_name} • {pov.customer_industry}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium
            ${getStatusColor(pov?.status)}`}>
            {pov?.status?.replace(/_/g, ' ') || 'DRAFT'}
          </span>
          {!pov ? (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                Submit POV
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'COMPLETE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
    case 'TECHNICALLY_SELECTED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400';
    case 'NOT_SELECTED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
  }
} 