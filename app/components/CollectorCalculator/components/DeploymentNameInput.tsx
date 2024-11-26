import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ListRestart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Config, Site } from '../types';
import { defaultMethodWeights, collectorCapacities } from '../constants';
interface DeploymentNameInputProps {
    value: string;
    onChange: (name: string) => void;
    config: Config;
    onUpdateConfig: (config: Config) => void;
    onUpdateSites: (sites: Site[]) => void;
    onSiteExpand: (expandedSites: Set<number>) => void;
}

const DeploymentNameInput = ({ value, onChange, config, onUpdateConfig, onUpdateSites, onSiteExpand }: DeploymentNameInputProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                        <Label className="text-lg font-medium text-gray-900 block">
                            Deployment Name
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                            Customer or deployment name for this configuration
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        const defaultConfig = {
                            deploymentName: 'New Deployment',
                            methodWeights: { ...config.methodWeights },
                            maxLoad: 85,
                            enablePollingFailover: true,
                            enableLogsFailover: false,
                            deviceDefaults: { ...config.deviceDefaults },
                            collectorCapacities: { ...collectorCapacities },
                        };

                        const defaultSite = {
                            name: "Site 1",
                            devices: Object.fromEntries(
                                Object.entries(config.deviceDefaults).map(([type, data]) => [
                                    type,
                                    { ...data, count: 0 },
                                ])
                            ),
                            logs: {
                                netflow: 0,
                                syslog: 0,
                                traps: 0,
                            },
                        };

                        onUpdateConfig(defaultConfig);
                        onUpdateSites([defaultSite]);
                        onSiteExpand(new Set([0]));
                    }}
                    variant="destructive"
                    className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                >
                    <ListRestart className="w-4 h-4" />
                    Reset Deployment
                </Button>
            </div>
            <div className="relative">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter deployment name..."
                    className="bg-white border-gray-200 focus:border-blue-700 h-11 text-base"
                />
            </div>
        </div>
    );
};

export default DeploymentNameInput;