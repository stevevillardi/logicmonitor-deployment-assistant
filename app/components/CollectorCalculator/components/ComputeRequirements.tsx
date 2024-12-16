import React from 'react';
import { Cpu, MemoryStick, HardDrive, Server, Activity } from 'lucide-react';
import { collectorRequirements } from '../constants';
import { devLog } from '@/utils/debug';

interface CollectorSizes {
  polling: Record<string, number>;
  logs: Record<string, number>;
}

interface ComputeRequirementsProps {
  collectorsBySize: CollectorSizes;
  className?: string;
  enablePollingFailover?: boolean;
  enableLogsFailover?: boolean;
}

interface ResourceTotals {
  cpu: number;
  memory: number;
  disk: number;
}

const ComputeRequirements: React.FC<ComputeRequirementsProps> = ({ 
  collectorsBySize, 
  className = "",
  enablePollingFailover = false,
  enableLogsFailover = false
}) => {
  // Check if we have any non-N+1 collectors
  const hasActiveCollectors = () => {
    const pollingCollectorCount = Object.values(collectorsBySize.polling).reduce((sum, count) => sum + count, 0);
    const logsCollectorCount = Object.values(collectorsBySize.logs).reduce((sum, count) => sum + count, 0);

    // If failover is enabled and we only have 1 collector, it's just the N+1
    const hasPollingCollectors = !enablePollingFailover || pollingCollectorCount > 1;
    const hasLogsCollectors = !enableLogsFailover || logsCollectorCount > 1;

    return hasPollingCollectors || hasLogsCollectors;
  };

  const calculateResourcesForType = (
    collectors: Record<string, number>, 
    isFailoverEnabled: boolean
  ): ResourceTotals => {
    // If failover is enabled and we only have 1 collector, return 0 resources
    const collectorCount = Object.values(collectors).reduce((sum, count) => sum + count, 0);
    if (isFailoverEnabled && collectorCount <= 1) {
      return { cpu: 0, memory: 0, disk: 0 };
    }

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

  const pollingTotals = calculateResourcesForType(collectorsBySize.polling, enablePollingFailover);
  const logsTotals = calculateResourcesForType(collectorsBySize.logs, enableLogsFailover);

  const hasPollingResources = pollingTotals.cpu > 0 || pollingTotals.memory > 0;
  const hasLogsResources = logsTotals.cpu > 0 || logsTotals.memory > 0;

  const ResourceSection = ({ 
    title, 
    icon: Icon, 
    color, 
    totals 
  }: { 
    title: string;
    icon: typeof Server;
    color: "blue" | "orange";
    totals: ResourceTotals;
  }) => (
    <div className={`bg-white border border-${color}-100 rounded-lg p-3 hover:bg-${color}-50/50`}>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-4">
        {/* Title/Icon Column */}
        <div className={`flex items-center gap-2`}>
          <div className={`w-6 h-6 rounded-full bg-${color}-50 flex items-center justify-center`}>
            <Icon className={`w-3 h-3 text-${color}-700`} />
          </div>
          <span className={`text-sm font-medium text-${color}-900`}>{title}</span>
        </div>

        {/* CPU Column */}
        <div>
          <div className="text-xs text-gray-500 mb-1">CPU Cores</div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{totals.cpu}</span>
          </div>
        </div>

        {/* Memory Column */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Memory</div>
          <div className="flex items-center gap-2">
            <MemoryStick className="w-3 h-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{totals.memory} GB</span>
          </div>
        </div>

        {/* Disk Column */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Disk</div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-3 h-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{totals.disk} GB</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="font-medium text-gray-900 mb-3">Compute Requirements</h3>
      
      <div className="space-y-2">
        {(!hasPollingResources && !hasLogsResources) ? (
          <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg text-gray-500 text-sm">
            <HardDrive className="w-4 h-4" />
            <span>No compute resources required</span>
          </div>
        ) : (
          <>
            {/* Polling Section */}
            {hasPollingResources && (
              <ResourceSection 
                title="Polling" 
                icon={Server} 
                color="blue" 
                totals={pollingTotals}
              />
            )}

            {/* Logs Section */}
            {hasLogsResources && (
              <ResourceSection 
                title="Logs" 
                icon={Activity} 
                color="orange" 
                totals={logsTotals}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComputeRequirements; 