import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Building2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/enhanced-components'
import { Config, Site } from '../DeploymentAssistant/types/types';
import { defaultMethodWeights, collectorCapacities, defaultDeviceTypes } from '../DeploymentAssistant/utils/constants';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RxReset } from "react-icons/rx";
import { Switch } from "@/components/ui/switch"
import { CollectorCalcMethodSelect } from './CollectorCalcMethodSelect';
interface DeploymentNameInputProps {
    value: string;
    onDeploymentNameChange: (name: string) => void;
    config: Config;
    onUpdateConfig: (config: Config) => void;
    onUpdateSites: (sites: Site[]) => void;
    onSiteExpand: (expandedSites: Set<number>) => void;
    showDetails?: boolean;
    onShowDetailsChange?: (show: boolean) => void;
    onShowAdvancedSettingsChange: (show: boolean) => void;
}

const DeploymentNameInput = ({ value, onDeploymentNameChange, config, onUpdateConfig, onUpdateSites, onSiteExpand, showDetails, onShowDetailsChange, onShowAdvancedSettingsChange }: DeploymentNameInputProps) => {
    const handleReset = () => {
        console.log('Reset initiated');

        const defaultConfig: Config = {
            deploymentName: '',
            methodWeights: defaultMethodWeights,
            maxLoad: 85,
            enablePollingFailover: true,
            enableLogsFailover: false,
            deviceDefaults: defaultDeviceTypes,
            collectorCapacities: collectorCapacities,
            showAdvancedSettings: false,
            showDetails: false,
            collectorCalcMethod: 'auto'
        };

        // First update sites and expansion as they don't affect config
        onUpdateSites([]);
        onSiteExpand(new Set());

        // Now update the config once with all changes
        onUpdateConfig(defaultConfig);
    };

    // Handle show details change
    const handleShowDetailsChange = (show: boolean) => {
        onUpdateConfig({
            ...config,
            showDetails: show,
            deploymentName: config.deploymentName // Preserve deployment name
        });
    };

    // Add a useEffect to monitor value changes
    React.useEffect(() => {
        console.log('Deployment name value changed to:', value);
    }, [value]);

    // Add this effect to track prop changes
    useEffect(() => {
        console.log('DeploymentNameInput props updated:', {
            value,
            config: config.deploymentName,
            showDetails,
            showAdvancedSettings: config.showAdvancedSettings
        });
    }, [value, config, showDetails]);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex flex-col gap-4">
                {/* Top Section - Icon and Input */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Icon and Input Row */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 flex-shrink-0 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        </div>
                        <Input
                            value={value}
                            onChange={(e) => onDeploymentNameChange(e.target.value)}
                            placeholder="Enter deployment name..."
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-9 w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            type="text"
                        />
                    </div>

                    {/* Controls Section - Now centered on mobile */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pl-10">
                        {/* Collector Calc Method */}
                        <div className="flex items-center justify-center h-9 w-full sm:w-auto">
                            <CollectorCalcMethodSelect
                                value={config.collectorCalcMethod}
                                onChange={(value) => onUpdateConfig({
                                    ...config,
                                    collectorCalcMethod: value as 'auto' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'XL' | 'XXL'
                                })}
                            />
                        </div>

                        {/* Show Details Switch */}
                        <div className="flex items-center justify-center h-9 gap-2">
                            <Switch
                                id="showDetails"
                                checked={showDetails}
                                onCheckedChange={handleShowDetailsChange}
                                className="data-[state=checked]:bg-gray-200 dark:data-[state=checked]:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 transition-colors duration-200"
                            />
                            <Label
                                htmlFor="showDetails"
                                className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                            >
                                <span className={`text-sm ${showDetails ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                    Show method details
                                </span>
                            </Label>
                        </div>

                        {/* Reset Button */}
                        <div className="flex justify-center w-full sm:w-auto sm:ml-auto">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 truncate hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 w-full sm:w-auto h-9"
                                    >
                                        <RxReset className="w-4 h-4 mr-2" />
                                        Reset Deployment
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-[95vw] mx-4 bg-blue-50 dark:bg-gray-900 sm:max-w-2xl">
                                    <AlertDialogHeader className="border-b border-blue-100 dark:border-gray-800 pb-3">
                                        <AlertDialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                                            Reset Deployment Configuration
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                                            This will reset all configuration settings to their default values. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-3">
                                        <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-lg p-3">
                                            <div className="flex gap-2 text-sm text-blue-700 dark:text-blue-400">
                                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm">The following will be reset:</p>
                                                    <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-disc list-inside pl-1 mt-2">
                                                        <li>Deployment name</li>
                                                        <li>All site configurations</li>
                                                        <li>Device counts and settings</li>
                                                        <li>System configurations</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <AlertDialogFooter className="border-t border-blue-100 dark:border-gray-800 pt-3 flex-col sm:flex-row gap-2">
                                        <AlertDialogCancel className="border-[#040F4B] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 mt-0 w-full sm:w-auto">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleReset}
                                            className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200 w-full sm:w-auto"
                                        >
                                            Reset Configuration
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeploymentNameInput;