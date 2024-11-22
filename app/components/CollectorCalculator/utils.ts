import { collectorCapacities } from './constants';
import { Config, DeviceType } from './types';

// Utility Functions
export const calculateWeightedScore = (devices: Record<string, DeviceType>, methodWeights: Record<string, number>) => {
    return Object.entries(devices).reduce((total, [type,data]) => {
        if (data.count === 0) return total;

        const methodScores = Object.entries(data.methods).map(([method, ratio]) => {
            return data.instances * ratio * methodWeights[method];
        });

        const deviceScore = methodScores.reduce((sum, score) => sum + score, 0);
        return total + deviceScore * data.count;
    }, 0);
};

export const calculateCollectors = (totalWeight: number, totalEPS: number, maxLoad: number, config: Config) => {
    // Add config parameter
    const calculateForCapacity = (total: number, isEPS: boolean) => {
        let size = "XXL";
        let minCollectors = Infinity;

        Object.entries(collectorCapacities).forEach(([collectorSize, limits]) => {
            const limit = isEPS ? limits.eps : limits.weight;
            const needed = Math.ceil(total / (limit * (maxLoad / 100)));
            if (needed <= minCollectors) {
                minCollectors = needed;
                size = collectorSize;
            }
        });

        return { size, count: minCollectors };
    };

    const pollingConfig = calculateForCapacity(totalWeight, false);
    const logsConfig = calculateForCapacity(totalEPS, true);

    return {
        polling: {
            collectors: Array(
                pollingConfig.count + (config.enablePollingFailover ? 1 : 0),
            ) // Modified
                .fill(null)
                .map((_, idx) => ({
                    size: pollingConfig.size,
                    type:
                        idx === pollingConfig.count && config.enablePollingFailover
                            ? "N+1 Redundancy"
                            : "Primary",
                    load:
                        idx === pollingConfig.count && config.enablePollingFailover
                            ? 0
                            : Math.round(
                                (totalWeight /
                                    pollingConfig.count /
                                    collectorCapacities[pollingConfig.size as keyof typeof collectorCapacities].weight) *
                                100,
                            ),
                })),
        },
        logs: {
            collectors: Array(logsConfig.count + (config.enableLogsFailover ? 1 : 0)) // Modified
                .fill(null)
                .map((_, idx) => ({
                    size: logsConfig.size,
                    type:
                        idx === logsConfig.count && config.enableLogsFailover
                            ? "N+1 Redundancy"
                            : "Primary",
                    load:
                        idx === logsConfig.count && config.enableLogsFailover
                            ? 0
                            : Math.round(
                                (totalEPS /
                                    logsConfig.count /
                                    collectorCapacities[logsConfig.size as keyof typeof collectorCapacities].eps) *
                                100,
                            ),
                })),
        },
    };
};
