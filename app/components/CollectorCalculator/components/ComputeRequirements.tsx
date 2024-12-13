import React from 'react';
import { Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { collectorRequirements } from '../constants';
import { devLog } from '@/utils/debug';

interface CollectorSizes {
  polling: Record<string, number>;
  logs: Record<string, number>;
}

interface ComputeRequirementsProps {
  collectorsBySize: CollectorSizes;
  className?: string;
}

const ComputeRequirements: React.FC<ComputeRequirementsProps> = ({ collectorsBySize, className = "" }) => {
  const calculateTotalResources = () => {
    devLog('Calculating resources for collectors:', collectorsBySize);
    
    const calculateForType = (collectors: Record<string, number>) => {
      return Object.entries(collectors).reduce(
        (typeTotals, [size, count]) => {
          const sizeKey = size as keyof typeof collectorRequirements;
          const requirements = collectorRequirements[sizeKey];
          
          const cpuForSize = Number(requirements.cpu) * count;
          const memoryForSize = Number(requirements.memory) * count;
          const diskForSize = Number(requirements.disk) * count;

          devLog(`${size} collectors (${count}x):`, {
            cpu: `${requirements.cpu} * ${count} = ${cpuForSize}`,
            memory: `${requirements.memory} * ${count} = ${memoryForSize}`,
            disk: `${requirements.disk} * ${count} = ${diskForSize}`
          });

          return {
            cpu: typeTotals.cpu + cpuForSize,
            memory: typeTotals.memory + memoryForSize,
            disk: typeTotals.disk + diskForSize,
          };
        },
        { cpu: 0, memory: 0, disk: 0 }
      );
    };

    const pollingTotals = calculateForType(collectorsBySize.polling);
    const logsTotals = calculateForType(collectorsBySize.logs);

    devLog('Polling totals:', pollingTotals);
    devLog('Logs totals:', logsTotals);

    return {
      cpu: pollingTotals.cpu + logsTotals.cpu,
      memory: pollingTotals.memory + logsTotals.memory,
      disk: pollingTotals.disk + logsTotals.disk,
    };
  };

  const totals = calculateTotalResources();

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="w-4 h-4 text-gray-700" />
        <h3 className="font-medium text-gray-900">Required Compute</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
            <Cpu className="w-3 h-3 text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500">CPU Cores</p>
            <p className="text-sm font-medium text-gray-900">{totals.cpu}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
            <MemoryStick className="w-3 h-3 text-purple-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Memory (GB)</p>
            <p className="text-sm font-medium text-gray-900">{totals.memory}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
            <HardDrive className="w-3 h-3 text-orange-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Disk (GB)</p>
            <p className="text-sm font-medium text-gray-900">{totals.disk}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputeRequirements; 