import { Config, DeviceType } from './types';

// Utility Functions
export const calculateWeightedScore = (devices: Record<string, DeviceType>, methodWeights: Record<string, number>) => {
    
    return Object.entries(devices).reduce((total, [type, data]) => {
        if (data.count === 0) return total;

        const methodScores = Object.entries(data.methods).map(([method, ratio]) => {
            const score = data.instances * ratio * methodWeights[method];
            return score;
        });

        const deviceScore = methodScores.reduce((sum, score) => sum + score, 0);
        return total + deviceScore * data.count;
    }, 0);
};

export const calculateCollectors = (totalWeight: number, totalEPS: number, maxLoad: number, config: Config) => {

    const calculateForCapacity = (total: number, isEPS: boolean) => {
        let size = "XXL";
        let minCollectors = Infinity;

        Object.entries(config.collectorCapacities).forEach(([collectorSize, limits]) => {
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
            collectors: Array(pollingConfig.count + (config.enablePollingFailover ? 1 : 0))
                .fill(null)
                .map((_, idx) => {
                    const isRedundant = idx === pollingConfig.count && config.enablePollingFailover;
                    const load = isRedundant ? 0 : Math.round(
                        (totalWeight /
                            pollingConfig.count /
                            config.collectorCapacities[pollingConfig.size].weight) *
                        100
                    );
                    return {
                        size: pollingConfig.size,
                        type: isRedundant ? "N+1 Redundancy" : "Primary",
                        load
                    };
                }),
        },
        logs: {
            collectors: Array(logsConfig.count + (config.enableLogsFailover ? 1 : 0))
                .fill(null)
                .map((_, idx) => {
                    const isRedundant = idx === logsConfig.count && config.enableLogsFailover;
                    const load = isRedundant ? 0 : Math.round(
                        (totalEPS /
                            logsConfig.count /
                            config.collectorCapacities[logsConfig.size].eps) *
                        100
                    );
                    return {
                        size: logsConfig.size,
                        type: isRedundant ? "N+1 Redundancy" : "Primary",
                        load
                    };
                }),
        },
    };
};