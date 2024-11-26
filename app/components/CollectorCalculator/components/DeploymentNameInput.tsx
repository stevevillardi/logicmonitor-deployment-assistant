import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Building2, ListRestart, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/enhanced-components'
import { Config, Site } from '../types';
import { defaultMethodWeights, collectorCapacities, defaultDeviceTypes } from '../constants';
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
            showDetails: false
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
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-700" />
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                        <Input
                            value={value}
                            onChange={(e) => onDeploymentNameChange(e.target.value)}
                            placeholder="Enter deployment name..."
                            className="bg-white border border-gray-200 h-9 max-w-md"
                            type="text"
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showDetails"
                                checked={showDetails}
                                onChange={(e) => handleShowDetailsChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-700"
                            />
                            <label
                                htmlFor="showDetails"
                                className="text-sm text-gray-600 cursor-pointer whitespace-nowrap"
                            >
                                Show device details
                            </label>
                        </div>
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700"
                        >
                            <RxReset className="w-4 h-4 mr-2" />
                            Reset Deployment
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-lg bg-blue-50 sm:max-w-2xl">
                        <AlertDialogHeader className="border-b border-blue-100 pb-3">
                            <AlertDialogTitle className="text-xl font-bold text-[#040F4B]">
                                Reset Deployment Configuration
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                                This will reset all configuration settings to their default values. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-3">
                            <div className="bg-white border border-blue-100 rounded-lg p-3">
                                <div className="flex gap-2 text-sm text-blue-700">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm">The following will be reset:</p>
                                        <ul className="text-xs space-y-1 text-gray-600 list-disc list-inside pl-1 mt-2">
                                            <li>Deployment name</li>
                                            <li>All site configurations</li>
                                            <li>Device counts and settings</li>
                                            <li>System configurations</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <AlertDialogFooter className="border-t border-blue-100 pt-3">
                            <AlertDialogCancel className="border-[#040F4B] bg-white">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleReset}
                                className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                            >
                                Reset Configuration
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default DeploymentNameInput;