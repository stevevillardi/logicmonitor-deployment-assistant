import { Config, DeviceType } from '../types/types';
import { collectorCapacities } from './constants';

// At the start of the file, add this type
type CollectorSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XL' | 'XXL';

// Utility Functions
export const calculateWeightedScore = (devices: Record<string, DeviceType>, methodWeights: Record<string, number>, config: Config) => {
    return Object.entries(devices).reduce((total, [type, data]) => {
        if (data.count === 0) return total;
        
        // Special handling for Virtual Machines
        if (type.includes("Virtual Machines")) {
            // Get vCenter count (default to 1 if not set or 0)
            const vCenterCount = (data.additional_count && data.additional_count > 0) ? data.additional_count : 1;
            // Calculate average VMs per vCenter
            const avgVMsPerVCenter = Math.ceil(data.count / vCenterCount);
            
            let vCenterScore = 0;
            switch (true) {
                case avgVMsPerVCenter >= 5000:
                    vCenterScore = config.collectorCapacities.XXL.weight * (config.maxLoad / 100);
                    break;
                case avgVMsPerVCenter >= 3000:
                    vCenterScore = config.collectorCapacities.XL.weight * (config.maxLoad / 100);
                    break;
                case avgVMsPerVCenter >= 2000:
                    vCenterScore = config.collectorCapacities.LARGE.weight * (config.maxLoad / 100);
                    break;
                default:
                    // Calculate normal score for smaller VM counts, but per vCenter
                    const methodScores = Object.entries(data.methods).map(([method, ratio]) => {
                        // Calculate score based on average VMs per vCenter
                        const score = (avgVMsPerVCenter * data.instances * ratio * methodWeights[method]);
                        return score;
                    });
                    vCenterScore = methodScores.reduce((sum, score) => sum + score, 0);
            }
            
            // Multiply by vCenter count to get total score
            return total + (vCenterScore * vCenterCount);
        }

        // Normal calculation for non-VM devices
        const methodScores = Object.entries(data.methods).map(([method, ratio]) => {
            const score = data.instances * ratio * methodWeights[method];
            return score;
        });

        const deviceScore = methodScores.reduce((sum, score) => sum + score, 0);
        return total + deviceScore * data.count;
    }, 0);
};

export const calculateCollectors = (totalWeight: number, logs: { events: number; netflow: number }, maxLoad: number, config: Config) => {
    // Helper function to calculate collectors for either polling (weight) or logs (EPS/FPS)
    const calculateForCapacity = (total: number, metric: 'weight' | 'eps' | 'fps') => {
        // If there's no load or invalid input, return minimal configuration
        if (!total || total <= 0 || !isFinite(total)) {
            return { size: 'SMALL', count: 0 };
        }

        // For polling weight and non-auto mode, use the fixed collector size
        if (metric === 'weight' && config.collectorCalcMethod !== 'auto') {
            const size = config.collectorCalcMethod;
            const capacity = config.collectorCapacities[size]?.[metric] || 0; // Add null check here
            const maxLoadPercent = Math.max(1, maxLoad);
            const collectors = Math.ceil(total / (capacity * (maxLoadPercent / 100)));
            
            return {
                size,
                count: Math.max(1, Math.min(100, isFinite(collectors) ? collectors : 1))
            };
        }

        // For all other cases, find the size that requires the minimum number of collectors
        let bestSize: CollectorSize = 'XXL';
        let minCollectors = Infinity;

        // Iterate through each collector size to find the most efficient configuration
        Object.entries(config.collectorCapacities).forEach(([size, capacities]) => {
            const capacity = capacities[metric] || 0; // Add null check here
            if (!capacity || capacity <= 0) return;

            const needed = Math.ceil(total / (capacity * (maxLoad / 100)));
            
            // If this size requires fewer or equal collectors, update our choice
            if (needed > 0 && needed <= 100 && needed <= minCollectors) {
                minCollectors = needed;
                bestSize = size as CollectorSize;
            }
        });

        // If we found a valid configuration, return it
        if (minCollectors !== Infinity) {
            return {
                size: bestSize,
                count: minCollectors
            };
        }

        // Fallback to XXL with maximum collectors if no valid configuration found
        const xxlCapacity = config.collectorCapacities.XXL?.[metric] || 0; // Add null check here
        const safeCollectors = Math.min(100, Math.ceil(total / xxlCapacity));
        
        return {
            size: 'XXL',
            count: Math.max(1, Math.min(100, isFinite(safeCollectors) ? safeCollectors : 1))
        };
    };

    // Calculate collectors needed for each type
    const pollingConfig = calculateForCapacity(totalWeight, 'weight');
    const eventsConfig = calculateForCapacity(logs.events, 'eps');
    const netflowConfig = calculateForCapacity(logs.netflow, 'fps');

    return {
        polling: {
            collectors: Array(pollingConfig.count + (config.enablePollingFailover ? 1 : 0))
                .fill(null)
                .map((_, idx) => {
                    const isRedundant = idx === pollingConfig.count && config.enablePollingFailover;
                    let load = 0;
                    
                    if (!isRedundant && pollingConfig.count > 0) {
                        const capacity = config.collectorCapacities[pollingConfig.size].weight;
                        load = Math.round((totalWeight / pollingConfig.count / capacity) * 100);
                    }

                    return {
                        size: pollingConfig.size,
                        type: isRedundant ? "N+1 Redundancy" : "Primary",
                        load: Math.min(100, Math.max(0, isFinite(load) ? load : 0))
                    };
                }),
        },
        logs: {
            eventCollectors: Array(eventsConfig.count + (config.enableLogsFailover ? 1 : 0))
                .fill(null)
                .map((_, idx) => {
                    const isRedundant = idx === eventsConfig.count && config.enableLogsFailover;
                    let load = 0;
                    
                    if (!isRedundant && eventsConfig.count > 0) {
                        const capacity = config.collectorCapacities[eventsConfig.size].eps;
                        load = Math.round((logs.events / eventsConfig.count / capacity) * 100);
                    }

                    return {
                        size: eventsConfig.size,
                        type: isRedundant ? "N+1 Redundancy" : "Primary",
                        load: Math.min(100, Math.max(0, isFinite(load) ? load : 0))
                    };
                }),
            netflowCollectors: Array(netflowConfig.count + (config.enableLogsFailover ? 1 : 0))
                .fill(null)
                .map((_, idx) => {
                    const isRedundant = idx === netflowConfig.count && config.enableLogsFailover;
                    let load = 0;
                    
                    if (!isRedundant && netflowConfig.count > 0) {
                        const capacity = config.collectorCapacities[netflowConfig.size].fps;
                        load = Math.round((logs.netflow / netflowConfig.count / capacity) * 100);
                    }

                    return {
                        size: netflowConfig.size,
                        type: isRedundant ? "N+1 Redundancy" : "Primary",
                        load: Math.min(100, Math.max(0, isFinite(load) ? load : 0))
                    };
                }),
        }
    };
};