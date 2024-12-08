import React from 'react';
import { Download, Upload, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/enhanced-components';
import { Site, Config } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useRef } from 'react';
import { devLog } from '@/utils/debug';
interface ConfigurationActionsProps {
    sites: Site[];
    config: Config;
    onUpdateSites: (sites: Site[]) => void;
    onUpdateConfig: (config: Config) => void;
    onSiteExpand: (expandedSites: Set<number>) => void;
}

interface SimplifiedSite {
    name: string;
    devices: Record<string, { count: number }>;
    logs: {
        netflow: number;
        syslog: number;
        traps: number;
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportConfig = () => {
        // Simplify sites data to only include essential information
        const simplifiedSites: SimplifiedSite[] = sites.map(site => ({
            name: site.name,
            devices: Object.fromEntries(
                Object.entries(site.devices).map(([type, data]) => [
                    type,
                    { count: data.count }
                ])
            ),
            logs: {
                netflow: site.logs.netflow,
                syslog: site.logs.syslog,
                traps: site.logs.traps
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
                    return [
                        type,
                        {
                            ...defaultData as Record<string, unknown>,
                            count: deviceCount
                        }
                    ];
                })
            );

            return {
                name: simplifiedSite.name,
                devices: siteDevices,
                logs: {
                    netflow: simplifiedSite.logs.netflow || 0,
                    syslog: simplifiedSite.logs.syslog || 0,
                    traps: simplifiedSite.logs.traps || 0
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
            }

            // Reconstruct sites with current device defaults
            const reconstructedSites = validationResult.sites.map(site => ({
                name: site.name,
                devices: Object.fromEntries(
                    Object.entries(importedData.deviceDefaults).map(([type, defaultData]) => [
                        type,
                        {
                            ...defaultData as Record<string, unknown>,
                            count: site.devices[type]?.count || 0,
                            methods: site.devices[type]?.methods as Record<string, number> || {},
                            instances: site.devices[type]?.instances || 0
                        }
                    ])
                ),
                logs: site.logs
            }));

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
            console.error('Import error:', err);
            setError('Failed to import configuration. Please check the file format.');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive" className="text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
            )}
            {warnings.length > 0 && (
                <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-700" />
                    <AlertTitle className="text-yellow-700 text-sm">Import Warnings</AlertTitle>
                    <AlertDescription className="text-yellow-600 text-xs sm:text-sm">
                        <ul className="list-disc list-inside space-y-1">
                            {warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <Button
                    onClick={handleExportConfig}
                    className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2 w-full sm:w-auto"
                >
                    <Download className="w-4 h-4" />
                    Export Deployment
                </Button>
                <Button
                    onClick={handleImportClick}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
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