'use client'

import { Card } from '@/components/ui/card';
import { usePOV } from '@/app/contexts/POVContext';

export default function Challenges() {
  const { state } = usePOV();
  const { pov } = state;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
          Challenges
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Manage challenges for {pov?.title}
        </p>
      </Card>

      <Card className="p-6">
        {/* Content will go here */}
      </Card>
    </div>
  );
} 