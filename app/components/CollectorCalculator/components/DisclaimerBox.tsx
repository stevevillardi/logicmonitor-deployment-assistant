import React from 'react';
import { AlertCircle } from 'lucide-react';

const DisclaimerBox = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
      <div className="flex gap-2 sm:gap-3 items-start">
        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm sm:text-base font-medium text-blue-900 mb-1">Disclaimer</h4>
          <p className="text-xs sm:text-sm text-blue-700">
            This overview provides estimated collector requirements based on typical deployment patterns. 
            Actual requirements may vary depending on factors such as monitoring intervals, custom configurations, 
            network conditions, and specific workload characteristics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerBox; 