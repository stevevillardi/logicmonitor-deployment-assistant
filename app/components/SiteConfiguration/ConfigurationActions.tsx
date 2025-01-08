import React from 'react';
import { Download, Upload, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/enhanced-components';
import { Site, Config } from '../DeploymentAssistant/types/types';
import { useState, useRef } from 'react';
import { devError, devLog } from '../Shared/utils/debug';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { defaultLogTypes, defaultTrapTypes } from '../DeploymentAssistant/utils/constants';
import { defaultFlowTypes } from '../DeploymentAssistant/utils/constants';

interface ConfigurationActionsProps {
    sites: Site[];
    config: Config;
    onUpdateSites: (sites: Site[]) => void;
    onUpdateConfig: (config: Config) => void;
    onSiteExpand: (expandedSites: Set<number>) => void;
}

interface SimplifiedSite {
    name: string;
    devices: Record<string, { 
        count: number;
        additional_count?: number;
    }>;
    logs: {
        netflow: {
            fps: number;
            collectors: Array<{
                size: string;
                type: string;
                load: number;
            }>;
        };
        events: {
            eps: number;
            collectors: Array<{
                size: string;
                type: string;
                load: number;
            }>;
        };
        devices: {
            firewalls: number;
            network: number;
            linux: number;
            storage: number;
            windows: number;
            loadbalancers: number;
            vcenter: number;
            iis: number;
            accesspoints: number;
            snmptraps: number;
            netflowdevices: number;
        };
    };
}

interface ExportData {
    deploymentName: string;
    sites: SimplifiedSite[];
    methodWeights: Record<string, number>;
    deviceDefaults: Config['deviceDefaults'];
    collectorCapacities: Config['collectorCapacities'];
    timestamp: string;
    version: string;
}

interface ValidationResult {
    isValid: boolean;
    sites: Site[];
    config: Config;
    warnings: string[];
}

const ConfigurationActions = ({ sites, config, onUpdateSites, onUpdateConfig }: ConfigurationActionsProps) => {
    const [error, setError] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportConfig = () => {
        const simplifiedSites: SimplifiedSite[] = sites.map(site => ({
            name: site.name,
            devices: Object.fromEntries(
                Object.entries(site.devices).map(([type, data]) => [
                    type,
                    { 
                        count: data.count,
                        additional_count: data.additional_count 
                    }
                ])
            ),
            logs: {
                netflow: {
                    fps: site.logs.netflow.fps,
                    collectors: site.logs.netflow.collectors
                },
                events: {
                    eps: site.logs.events.eps,
                    collectors: site.logs.events.collectors
                },
                devices: site.logs.devices
            }
        }));

        const exportData: ExportData = {
            deploymentName: config.deploymentName,
            sites: simplifiedSites,
            methodWeights: config.methodWeights,
            deviceDefaults: config.deviceDefaults,
            collectorCapacities: config.collectorCapacities,
            timestamp: new Date().toISOString(),
            version: "1.0"
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collector-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const validateImportedData = (data: any): ValidationResult => {
        const warnings: string[] = [];
        let isValid = true;

        devLog('Validating imported data:', data);

        if (!data || typeof data !== 'object') {
            return { isValid: false, sites: [], config: config, warnings: ['Invalid data format'] };
        }

        // Validate deployment name
        if (!data.deploymentName) {
            warnings.push('Deployment name missing, using default');
            data.deploymentName = 'New Deployment';
        }

        // Validate basic structure
        if (!Array.isArray(data.sites)) {
            isValid = false;
            warnings.push('Invalid sites format - expected array');
            return { isValid, sites: [], config: config, warnings };
        }

        // Validate each site has the required structure
        for (const site of data.sites) {
            if (!site.name) {
                warnings.push('Site missing name, using default');
                site.name = 'New Site';
            }
            if (!site.devices || typeof site.devices !== 'object') {
                warnings.push(`Site ${site.name}: Invalid devices format`);
                isValid = false;
            }
            if (!site.logs || typeof site.logs !== 'object') {
                warnings.push(`Site ${site.name}: Invalid logs format`);
                isValid = false;
            }
        }

        // Validate method weights
        if (data.methodWeights && typeof data.methodWeights === 'object') {
            Object.entries(data.methodWeights).forEach(([method, weight]) => {
                if (typeof weight !== 'number') {
                    warnings.push(`Invalid weight for method ${method}`);
                    isValid = false;
                }
            });
        } else {
            warnings.push('Invalid method weights format');
            isValid = false;
        }

        // Validate device defaults
        if (data.deviceDefaults && typeof data.deviceDefaults === 'object') {
            Object.entries(data.deviceDefaults).forEach(([type, settings]) => {
                if (!settings || typeof settings !== 'object') {
                    warnings.push(`Invalid settings for device type ${type}`);
                    isValid = false;
                }
            });
        } else {
            warnings.push('Invalid device defaults format');
            isValid = false;
        }

        // Validate collector capacities
        if (data.collectorCapacities && typeof data.collectorCapacities === 'object') {
            Object.entries(data.collectorCapacities).forEach(([size, limits]) => {
                if (!limits || typeof limits !== 'object') {
                    warnings.push(`Invalid limits for collector size ${size}`);
                    isValid = false;
                }
            });
        } else {
            warnings.push('Invalid collector capacities format');
            isValid = false;
        }

        if (!isValid) {
            return { isValid, sites: [], config: config, warnings };
        }

        // Build full site objects using device defaults
        const reconstructedSites: Site[] = data.sites.map((simplifiedSite: SimplifiedSite) => {
            // Create new devices object with current defaults
            const siteDevices = Object.fromEntries(
                Object.entries(data.deviceDefaults).map(([type, defaultData]) => {
                    const deviceCount = simplifiedSite.devices[type]?.count || 0;
                    const additionalCount = simplifiedSite.devices[type]?.additional_count;
                    return [
                        type,
                        {
                            ...defaultData as Record<string, unknown>,
                            count: deviceCount,
                            additional_count: additionalCount,
                        }
                    ];
                })
            );

            return {
                name: simplifiedSite.name,
                devices: siteDevices,
                logs: {
                    netflow: {
                        fps: simplifiedSite.logs.netflow?.fps || 0,
                        collectors: simplifiedSite.logs.netflow?.collectors || []
                    },
                    events: {
                        eps: simplifiedSite.logs.events?.eps || 0,
                        collectors: simplifiedSite.logs.events?.collectors || []
                    },
                    devices: simplifiedSite.logs.devices || {}
                }
            };
        });

        devLog('Reconstructed sites:', reconstructedSites);

        return {
            isValid: true,
            sites: reconstructedSites,
            config: {
                ...config,
                methodWeights: data.methodWeights,
                deviceDefaults: data.deviceDefaults
            },
            warnings
        };
    };

    const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setWarnings([]);
        setWarningDialogOpen(false);
        setErrorDialogOpen(false);

        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            devLog('Imported text:', text.substring(0, 200) + '...'); // Log first 200 chars of imported text

            const importedData = JSON.parse(text);
            devLog('Parsed data:', importedData);

            const validationResult = validateImportedData(importedData);
            devLog('Validation result:', validationResult);

            if (!validationResult.isValid) {
                throw new Error('Invalid configuration file format');
            }

            if (validationResult.warnings.length > 0) {
                setWarnings(validationResult.warnings);
                setWarningDialogOpen(true);
            }

            // Reconstruct sites with current device defaults and additional_count
            const reconstructedSites = validationResult.sites.map(site => {
                // First create the base site structure
                const newSite = {
                    name: site.name,
                    devices: Object.fromEntries(
                        Object.entries(importedData.deviceDefaults).map(([type, defaultData]) => [
                            type,
                            {
                                ...defaultData as Record<string, unknown>,
                                count: site.devices[type]?.count || 0,
                                additional_count: site.devices[type]?.additional_count,
                                methods: site.devices[type]?.methods || {},
                                instances: site.devices[type]?.instances || 0
                            }
                        ])
                    ),
                    logs: {
                        netflow: {
                            fps: 0, // Will be calculated below
                            collectors: []
                        },
                        events: {
                            eps: 0, // Will be calculated below
                            collectors: []
                        },
                        devices: site.logs.devices || {}
                    }
                };

                // Calculate the EPS and FPS based on the device counts
                const netflowFPS = (newSite.logs.devices.netflowdevices || 0) * defaultFlowTypes.NETFLOW.fps;
                const eventsEPS = Object.entries(defaultLogTypes).reduce((total, [key, value]) => {
                    const deviceCount = newSite.logs.devices[key.toLowerCase() as keyof typeof newSite.logs.devices] || 0;
                    return total + (deviceCount * value.eps);
                }, 0) + ((newSite.logs.devices.snmptraps || 0) * defaultTrapTypes.SNMP.eps);

                // Update the calculated values
                newSite.logs.netflow.fps = netflowFPS;
                newSite.logs.events.eps = eventsEPS;

                return newSite;
            });

            devLog('Final reconstructed sites:', reconstructedSites);

            // Update the configurations
            const updatedConfig = {
                ...config,
                deploymentName: importedData.deploymentName,
                methodWeights: importedData.methodWeights,
                deviceDefaults: importedData.deviceDefaults
            };

            // Update both sites and config
            onUpdateSites(reconstructedSites);
            onUpdateConfig(updatedConfig);

        } catch (err) {
            devError('Import error:', err);
            setError('Failed to import configuration. Please check the file format.');
            setErrorDialogOpen(true);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Warning Dialog */}
            <AlertDialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
                <AlertDialogContent className="bg-yellow-50 dark:bg-gray-800 border-yellow-200 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                            <Info className="h-5 w-5" />
                            Import Warnings
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <div className="mt-2 text-yellow-600 dark:text-yellow-300">
                                <ul className="list-disc list-inside space-y-1">
                                    {warnings.map((warning, index) => (
                                        <li key={index}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction 
                            onClick={() => setWarningDialogOpen(false)}
                            className="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-gray-700"
                        >
                            Dismiss
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error Dialog */}
            <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <AlertDialogContent className="bg-red-50 dark:bg-gray-800 border-red-200 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Import Error
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <div className="mt-2 text-red-600 dark:text-red-300">
                                {error}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction 
                            onClick={() => setErrorDialogOpen(false)}
                            className="bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-gray-700"
                        >
                            Dismiss
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <Button
                    onClick={handleExportConfig}
                    className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white gap-2 w-full sm:w-auto dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                    <Download className="w-4 h-4" />
                    Export Deployment
                </Button>
                <Button
                    onClick={handleImportClick}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto border-gray-200 dark:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-400 dark:hover:text-gray-800"
                >
                    <Upload className="w-4 h-4" />
                    Import Deployment
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportConfig}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ConfigurationActions;