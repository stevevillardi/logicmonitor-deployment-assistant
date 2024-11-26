import { collectorCapacities } from './constants';
import { Config, DeviceType } from './types';

// Utility Functions
export const calculateWeightedScore = (devices: Record<string, DeviceType>, methodWeights: Record<string, number>) => {
    console.log('Calculating weighted score with weights:', methodWeights);
    
    return Object.entries(devices).reduce((total, [type, data]) => {
        if (data.count === 0) return total;

        const methodScores = Object.entries(data.methods).map(([method, ratio]) => {
            const score = data.instances * ratio * methodWeights[method];
            console.log(`Device: ${type}, Method: ${method}, Instances: ${data.instances}, Ratio: ${ratio}, Weight: ${methodWeights[method]}, Score: ${score}`);
            return score;
        });

        const deviceScore = methodScores.reduce((sum, score) => sum + score, 0);
        console.log(`Total score for ${type}: ${deviceScore * data.count} (base score: ${deviceScore} × count: ${data.count})`);
        return total + deviceScore * data.count;
    }, 0);
};

export const calculateCollectors = (totalWeight: number, totalEPS: number, maxLoad: number, config: Config) => {
    console.log('Calculating collectors with:', {
        totalWeight,
        totalEPS,
        maxLoad,
        collectorCapacities: config.collectorCapacities
    });

    const calculateForCapacity = (total: number, isEPS: boolean) => {
        console.log(`Calculating ${isEPS ? 'EPS' : 'Weight'} capacity for total: ${total}`);
        let size = "XXL";
        let minCollectors = Infinity;

        Object.entries(config.collectorCapacities).forEach(([collectorSize, limits]) => {
            const limit = isEPS ? limits.eps : limits.weight;
            const needed = Math.ceil(total / (limit * (maxLoad / 100)));
            console.log(`Size ${collectorSize}: limit ${limit}, needed ${needed} collectors at ${maxLoad}% max load`);
            if (needed <= minCollectors) {
                minCollectors = needed;
                size = collectorSize;
            }
        });

        console.log(`Selected ${size} with ${minCollectors} collectors`);
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
                    console.log(`Polling collector ${idx + 1}: ${pollingConfig.size}, ${isRedundant ? 'Redundant' : `${load}% load`}`);
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
                    console.log(`Logs collector ${idx + 1}: ${logsConfig.size}, ${isRedundant ? 'Redundant' : `${load}% load`}`);
                    return {
                        size: logsConfig.size,
                        type: isRedundant ? "N+1 Redundancy" : "Primary",
                        load
                    };
                }),
        },
    };
};
