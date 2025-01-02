import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/enhanced-components';
import { Database, Weight, MessageSquare, Activity } from 'lucide-react';
import { Config } from '../DeploymentAssistant/types/types';

export const handleCapacityChange = (
    config: Config,
    onUpdate: (config: Config) => void,
    size: string,
    field: 'weight' | 'eps' | 'fps',
    value: string
) => {
    const numValue = parseInt(value) || 0;
    const updatedConfig: Config = {
        ...config,
        collectorCapacities: {
            ...config.collectorCapacities,
            [size]: {
                ...config.collectorCapacities[size],
                [field]: numValue
            }
        }
    };
    onUpdate(updatedConfig);
};

interface CollectorCapacitySectionProps {
    config: Config;
    onUpdate: (config: Config) => void;
}

export const CollectorCapacitySection: React.FC<CollectorCapacitySectionProps> = ({ config, onUpdate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.collectorCapacities).map(([size, capacity]) => (
                <div key={size} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <Database className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{size}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                                    Load Capacity
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={capacity.weight}
                                        onChange={(e) => handleCapacityChange(config, onUpdate, size, 'weight', e.target.value)}
                                        className="pl-8 bg-white dark:bg-gray-900 w-full border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        min="0"
                                    />
                                    <Weight className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-2.5 top-2.5" />
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                                    Events/Sec (EPS)
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={capacity.eps}
                                        onChange={(e) => handleCapacityChange(config, onUpdate, size, 'eps', e.target.value)}
                                        className="pl-8 bg-white dark:bg-gray-900 w-full border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        min="0"
                                    />
                                    <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-2.5 top-2.5" />
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                                    Flows/Sec (FPS)
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={capacity.fps}
                                        onChange={(e) => handleCapacityChange(config, onUpdate, size, 'fps', e.target.value)}
                                        className="pl-8 bg-white dark:bg-gray-900 w-full border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        min="0"
                                    />
                                    <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-2.5 top-2.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};