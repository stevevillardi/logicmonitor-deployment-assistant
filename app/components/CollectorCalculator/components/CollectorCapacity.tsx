import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/enhanced-components';
import { Database, Activity, Weight } from 'lucide-react';
import { Config } from '../types';

export const handleCapacityChange = (
    config: Config,
    onUpdate: (config: Config) => void,
    size: string,
    field: 'weight' | 'eps',
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
                <div key={size} className="bg-gray-50 rounded-lg p-4 space-y-4 hover:bg-gray-100 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Database className="w-4 h-4 text-blue-700" />
                            </div>
                            <span className="font-medium text-gray-900">{size}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-gray-600 mb-2 block">
                                    Weighted Capacity
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={capacity.weight}
                                        onChange={(e) => handleCapacityChange(config, onUpdate, size, 'weight', e.target.value)}
                                        className="pl-8 bg-white w-full"
                                        min="0"
                                    />
                                    <Weight className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-600 mb-2 block">
                                    Events Per Second (EPS)
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={capacity.eps}
                                        onChange={(e) => handleCapacityChange(config, onUpdate, size, 'eps', e.target.value)}
                                        className="pl-8 bg-white w-full"
                                        min="0"
                                    />
                                    <Activity className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};