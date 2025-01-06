import React from 'react';
import { Cpu, MemoryStick, HardDrive, Server, Activity } from 'lucide-react';
import { collectorRequirements } from '../DeploymentAssistant/utils/constants';
import { devLog } from '../Shared/utils/debug';
import { ComputeRequirementsProps } from '../DeploymentAssistant/types/types';

interface ResourceTotals {
  cpu: number;
  memory: number;
  disk: number;
}

const ComputeRequirements: React.FC<ComputeRequirementsProps> = ({ 
  collectorsBySize, 
  className = "",
  enablePollingFailover = false,
  enableLogsFailover = false,
  forceLightMode = false
}) => {
  const withDark = (className: string) => 
    forceLightMode ? className.replace(/\sdark:[\w-/]+/g, '') : className;

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
  const netflowTotals = calculateResourcesForType(collectorsBySize.netflow, enableLogsFailover);

  const hasPollingResources = pollingTotals.cpu > 0 || pollingTotals.memory > 0;
  const hasLogsResources = logsTotals.cpu > 0 || logsTotals.memory > 0;
  const hasNetflowResources = netflowTotals.cpu > 0 || netflowTotals.memory > 0;

  const ResourceSection = ({ 
    title, 
    icon: Icon, 
    color, 
    totals 
  }: { 
    title: string;
    icon: typeof Server;
    color: "blue" | "orange" | "purple";
    totals: ResourceTotals;
  }) => (
    <div className={withDark(`bg-white dark:bg-gray-900 border border-${color}-100 dark:border-${color}-800 rounded-lg p-3 hover:bg-${color}-50/50 dark:hover:bg-${color}-900/20`)}>
      {/* Mobile Layout */}
      <div className="sm:hidden space-y-3">
        <div className={withDark(`flex items-center gap-2`)}>
          <div className={withDark(`w-6 h-6 rounded-full bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center`)}>
            <Icon className={withDark(`w-3 h-3 text-${color}-700 dark:text-${color}-400`)} />
          </div>
          <span className={withDark(`text-sm font-medium text-${color}-900 dark:text-${color}-100 truncate`)}>{title}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* CPU */}
          <div className={withDark("bg-gray-50 dark:bg-gray-800 rounded-lg p-2")}>
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3 h-3 text-gray-500" />
              <div className={withDark("text-xs text-gray-500 dark:text-gray-400")}>CPU</div>
            </div>
            <div className={withDark("text-sm font-medium text-gray-900 dark:text-gray-100")}>{totals.cpu}</div>
          </div>
          {/* Memory */}
          <div className={withDark("bg-gray-50 dark:bg-gray-800 rounded-lg p-2")}>
            <div className="flex items-center gap-1.5 mb-1">
              <MemoryStick className="w-3 h-3 text-gray-500" />
              <div className={withDark("text-xs text-gray-500 dark:text-gray-400")}>RAM</div>
            </div>
            <div className={withDark("text-sm font-medium text-gray-900 dark:text-gray-100")}>{totals.memory} GB</div>
          </div>
          {/* Disk */}
          <div className={withDark("bg-gray-50 dark:bg-gray-800 rounded-lg p-2")}>
            <div className="flex items-center gap-1.5 mb-1">
              <HardDrive className="w-3 h-3 text-gray-500" />
              <div className={withDark("text-xs text-gray-500 dark:text-gray-400")}>Disk</div>
            </div>
            <div className={withDark("text-sm font-medium text-gray-900 dark:text-gray-100")}>{totals.disk} GB</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={withDark("hidden sm:grid grid-cols-[150px_1fr_1fr_1fr] items-center gap-4")}>
        {/* Title/Icon Column */}
        <div className={withDark(`flex items-center gap-2 min-w-[150px]`)}>
          <div className={withDark(`w-6 h-6 rounded-full bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center flex-shrink-0`)}>
            <Icon className={withDark(`w-3 h-3 text-${color}-700 dark:text-${color}-400`)} />
          </div>
          <span className={withDark(`text-sm font-medium text-${color}-900 dark:text-${color}-100 truncate`)}>{title}</span>
        </div>

        {/* Resource columns */}
        <div className="flex-1">
          <div className={withDark("text-xs text-gray-500 dark:text-gray-400 mb-1")}>CPU Cores</div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-gray-500" />
            <span className={withDark("text-sm font-medium text-gray-900 dark:text-gray-100")}>{totals.cpu}</span>
          </div>
        </div>

        {/* Memory Column */}
        <div className="flex-1">
          <div className={withDark("text-xs text-gray-500 dark:text-gray-400 mb-1")}>Memory</div>
          <div className="flex items-center gap-2">
            <MemoryStick className="w-3 h-3 text-gray-500" />
            <span className={withDark("text-sm font-medium text-gray-900 dark:text-gray-100")}>{totals.memory} GB</span>
          </div>
        </div>

        {/* Disk Column */}
        <div className="flex-1">
          <div className={withDark("text-xs text-gray-500 dark:text-gray-400 mb-1")}>Disk</div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-3 h-3 text-gray-500" />
            <span className={withDark("text-sm font-medium text-gray-900 dark:text-gray-100")}>{totals.disk} GB</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={withDark(`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`)}>
      <h3 className={withDark("font-medium text-gray-900 dark:text-gray-100 mb-3")}>Compute Requirements</h3>
      
      <div className="space-y-2">
        {(!hasPollingResources && !hasLogsResources && !hasNetflowResources) ? (
          <div className={withDark("flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-sm")}>
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

            {/* NetFlow Section */}
            {hasNetflowResources && (
              <ResourceSection 
                title="NetFlow" 
                icon={Activity} 
                color="purple" 
                totals={netflowTotals}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComputeRequirements; 