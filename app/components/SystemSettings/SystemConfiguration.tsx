import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button, Input } from '@/components/ui/enhanced-components'
import { Config, DeviceType } from '../DeploymentAssistant/types/types';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Plus, Trash2, AlertTriangle, Pencil, Check } from 'lucide-react';
import { defaultDeviceTypes } from '../DeploymentAssistant/utils/constants';
import { useEffect } from 'react';
import EnhancedCard from '@/components/ui/enhanced-card';
import { Dumbbell, Settings, Shield, Server, Activity, Variable } from 'lucide-react';
import { Calculator, SquareFunction, ArrowRight, Box, Weight, PieChart, Layers, Database, Gauge } from 'lucide-react';
import sliderStyles from './styles/styles';
import { CollectorCapacitySection } from './CollectorCapacity';
import { RiAdminLine } from "react-icons/ri";
import { Switch } from "@/components/ui/switch"
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';


interface SystemConfigurationProps {
    config: Config;
    onUpdate: (config: Config) => void;
    sites: any[];
    onUpdateSites: (sites: any[]) => void;
}

export const SystemConfiguration = ({ config, onUpdate, sites, onUpdateSites }: SystemConfigurationProps) => {
    const [selectedDeviceType, setSelectedDeviceType] = useState(Object.keys(defaultDeviceTypes)[0]);
    const [newDeviceType, setNewDeviceType] = useState('');
    const [newMethodName, setNewMethodName] = useState('');
    const [newMethodWeightName, setNewMethodWeightName] = useState('');
    const [newMethodWeight, setNewMethodWeight] = useState('3');
    const [errors, setErrors] = useState<{
        methodRatios?: string;
        deviceType?: string;
        methodName?: string;
    }>({});
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>('');

    // Initialize selectedDeviceType when component mounts or config changes
    useEffect(() => {
        if (!selectedDeviceType && config.deviceDefaults) {
            const deviceTypes = Object.keys(config.deviceDefaults);
            if (deviceTypes.length > 0) {
                setSelectedDeviceType(deviceTypes[0]);
            }
        }
    }, [config.deviceDefaults, selectedDeviceType]);

    // Reset selected device type if it no longer exists in config
    useEffect(() => {
        if (selectedDeviceType && !config.deviceDefaults[selectedDeviceType]) {
            const deviceTypes = Object.keys(config.deviceDefaults);
            setSelectedDeviceType(deviceTypes.length > 0 ? deviceTypes[0] : '');
        }
    }, [config.deviceDefaults, selectedDeviceType]);

    const validateMethodRatios = (methods: Record<string, number>): boolean => {
        const total = Object.values(methods).reduce((sum, ratio) => sum + ratio, 0);
        return Math.abs(total - 1) < 0.001; // Allow for small floating point errors
    };

    const addDeviceType = () => {
        if (!newDeviceType.trim()) {
            setErrors(prev => ({ ...prev, deviceType: 'Device type name is required' }));
            return;
        }
        if (config.deviceDefaults?.[newDeviceType]) {
            setErrors(prev => ({ ...prev, deviceType: 'Device type already exists' }));
            return;
        }

        // First update the config
        const updatedConfig: Config = {
            ...config,
            deviceDefaults: {
                ...config.deviceDefaults,
                [newDeviceType]: {
                    instances: 0,
                    count: 0,
                    methods: {}
                }
            }
        };

        // Update all existing sites to include the new device type
        const updatedSites = sites.map(site => ({
            ...site,
            devices: {
                ...site.devices,
                [newDeviceType]: {
                    instances: 0,
                    count: 0,
                    methods: {}
                }
            }
        }));

        // Update both config and sites
        onUpdate(updatedConfig);
        onUpdateSites(updatedSites);

        setNewDeviceType('');
        setErrors(prev => ({ ...prev, deviceType: undefined }));
        setSelectedDeviceType(newDeviceType);
    };

    const handleDeviceDefaultUpdate = (deviceType: string, newData: any) => {
        // Create a single update for both config and sites
        const updatedConfig = {
            ...config,
            deviceDefaults: {
                ...config.deviceDefaults,
                [deviceType]: {
                    ...config.deviceDefaults[deviceType],
                    ...newData
                }
            }
        };

        // Update sites in a single operation
        const updatedSites = sites.map(site => ({
            ...site,
            devices: {
                ...site.devices,
                [deviceType]: {
                    ...site.devices[deviceType],
                    instances: newData.instances,
                    methods: newData.methods,
                    // Preserve the count from the site
                    count: site.devices[deviceType].count
                }
            }
        }));

        // Batch the updates together
        onUpdate(updatedConfig);
        onUpdateSites(updatedSites);
    };

    const addProtocolWeight = () => {
        if (!newMethodWeightName.trim()) {
            setErrors(prev => ({ ...prev, methodName: 'Protocol name is required' }));
            return;
        }

        if (config.methodWeights[newMethodWeightName]) {
            setErrors(prev => ({ ...prev, methodName: 'Protocol already exists' }));
            return;
        }

        const weight = parseFloat(newMethodWeight) || 1;
        const updatedConfig: Config = {
            ...config,
            methodWeights: {
                ...config.methodWeights,
                [newMethodWeightName]: weight
            }
        };
        onUpdate(updatedConfig);
        setNewMethodWeightName('');
        setNewMethodWeight('');
        setErrors(prev => ({ ...prev, methodName: undefined }));
    };

    const removeProtocolWeight = (method: string) => {
        // Don't allow deletion if it's the last protocol
        if (Object.keys(config.methodWeights).length <= 1) {
            setErrors(prev => ({
                ...prev,
                methodName: 'Cannot delete the last protocol'
            }));
            return;
        }

        // Create new weights object without the deleted method
        const newWeights = { ...config.methodWeights };
        delete newWeights[method];

        // Create new device defaults with the method removed from all device types
        const newDeviceDefaults = { ...config.deviceDefaults };

        // Iterate through each device type and remove the deleted method
        for (const deviceType of Object.keys(newDeviceDefaults)) {
            if (newDeviceDefaults[deviceType].methods[method]) {
                const newMethods = { ...newDeviceDefaults[deviceType].methods };
                delete newMethods[method];

                newDeviceDefaults[deviceType] = {
                    ...newDeviceDefaults[deviceType],
                    methods: newMethods
                };
            }
        }

        // Update both weights and device defaults
        onUpdate({
            ...config,
            methodWeights: newWeights,
            deviceDefaults: newDeviceDefaults
        });
    };

    const removeDeviceType = (type: string) => {
        // Create new deviceDefaults without the removed type
        const { [type]: removed, ...remainingDefaults } = config.deviceDefaults;
        
        // Update config
        const newConfig = {
            ...config,
            deviceDefaults: remainingDefaults
        };

        // Update all sites to remove this device type
        const updatedSites = sites.map(site => {
            const { [type]: removed, ...remainingDevices } = site.devices;
            return {
                ...site,
                devices: remainingDevices
            };
        });

        // Update state
        onUpdate(newConfig);
        onUpdateSites(updatedSites);

        // If the removed type was selected, select another type
        if (selectedDeviceType === type) {
            const deviceTypes = Object.keys(remainingDefaults);
            setSelectedDeviceType(deviceTypes.length > 0 ? deviceTypes[0] : '');
        }
    };

    const addCollectionMethod = (deviceType: string) => {
        if (!newMethodName || !config.methodWeights[newMethodName]) {
            setErrors(prev => ({ ...prev, methodName: 'Please select a valid protocol' }));
            return;
        }

        const currentMethods = config.deviceDefaults[deviceType].methods;
        if (currentMethods[newMethodName]) {
            setErrors(prev => ({ ...prev, methodName: 'Protocol already exists for this device type' }));
            return;
        }

        // Add new method with 0 ratio (user will need to adjust ratios to sum to 1)
        const newMethods = {
            ...currentMethods,
            [newMethodName]: 0
        };

        const updatedConfig: Config = {
            ...config,
            deviceDefaults: {
                ...config.deviceDefaults,
                [deviceType]: {
                    ...config.deviceDefaults[deviceType],
                    methods: newMethods
                }
            }
        };
        onUpdate(updatedConfig);
        setNewMethodName('');
        setErrors(prev => ({ ...prev, methodName: undefined }));
    };

    const removeCollectionMethod = (deviceType: string, method: string) => {
        const remainingMethods = { ...config.deviceDefaults[deviceType].methods };
        delete remainingMethods[method];

        const updatedConfig: Config = {
            ...config,
            deviceDefaults: {
                ...config.deviceDefaults,
                [deviceType]: {
                    ...config.deviceDefaults[deviceType],
                    methods: remainingMethods
                }
            }
        };
        onUpdate(updatedConfig);
    };

    const updateMethodRatio = (deviceType: string, method: string, value: number) => {
        const newMethods = {
            ...config.deviceDefaults[deviceType].methods,
            [method]: value
        };

        // Update the methods regardless of validation
        handleDeviceDefaultUpdate(deviceType, {
            ...config.deviceDefaults[deviceType],
            methods: newMethods
        });

        // Show warning if ratios don't sum to 1, but don't block the update
        if (!validateMethodRatios(newMethods)) {
            setErrors(prev => ({
                ...prev,
                methodRatios: 'Collection method ratios must sum to 1'
            }));
        } else {
            setErrors(prev => ({ ...prev, methodRatios: undefined }));
        }
    };

    const handleInstancesChange = (deviceType: string, value: number) => {
        handleDeviceDefaultUpdate(deviceType, {
            ...config.deviceDefaults[deviceType],
            instances: value
        });
    };

    return (
        <div className="space-y-6 overflow-y-auto mb-4">
            <Tabs defaultValue="general" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="grid grid-cols-1 sm:flex w-full h-full bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        <TabsTrigger
                            value="general"
                            className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                                data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20
                                data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400
                                data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800
                                data-[state=active]:shadow-sm
                                hover:bg-gray-50 dark:hover:bg-gray-800
                                text-gray-600 dark:text-gray-400
                                font-medium
                                transition-all
                                border border-transparent
                                mb-2 sm:mb-0 sm:mr-2"
                        >
                            <Settings className="w-4 h-4" />
                            General Settings
                        </TabsTrigger>
                        <TabsTrigger
                            value="formula"
                            className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                                data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20
                                data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400
                                data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800
                                data-[state=active]:shadow-sm
                                hover:bg-gray-50 dark:hover:bg-gray-800
                                text-gray-600 dark:text-gray-400
                                font-medium
                                transition-all
                                border border-transparent
                                mb-2 sm:mb-0 sm:mr-2"
                        >
                            <Calculator className="w-4 h-4" />
                            Load Calculation Formula
                        </TabsTrigger>
                        {config.showAdvancedSettings && (
                            <>
                                <TabsTrigger
                                    value="devices"
                                    className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                                        data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20
                                        data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400
                                        data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800
                                        data-[state=active]:shadow-sm
                                        hover:bg-gray-50 dark:hover:bg-gray-800
                                        text-gray-600 dark:text-gray-400
                                        font-medium
                                        transition-all
                                        border border-transparent
                                        mb-2 sm:mb-0 sm:mr-2"
                                >
                                    <Server className="w-4 h-4" />
                                    Device Defaults
                                </TabsTrigger>
                                <TabsTrigger
                                    value="weights"
                                    className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                                        data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20
                                        data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400
                                        data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800
                                        data-[state=active]:shadow-sm
                                        hover:bg-gray-50 dark:hover:bg-gray-800
                                        text-gray-600 dark:text-gray-400
                                        font-medium
                                        transition-all
                                        border border-transparent
                                        mb-2 sm:mb-0 sm:mr-2"
                                >
                                    <Dumbbell className="w-4 h-4" />
                                    Protocol Weights
                                </TabsTrigger>
                                <TabsTrigger
                                    value="collector-capacities"
                                    className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                                        data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20
                                        data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400
                                        data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800
                                        data-[state=active]:shadow-sm
                                        hover:bg-gray-50 dark:hover:bg-gray-800
                                        text-gray-600 dark:text-gray-400
                                        font-medium
                                        transition-all
                                        border border-transparent"
                                >
                                    <Database className="w-4 h-4" />
                                    Collector Capacities
                                </TabsTrigger>
                            </>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="general">
                    <EnhancedCard className="bg-white dark:bg-gray-900 min-h-[900px] border border-gray-200 dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <Settings className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                <CardTitle className="text-gray-900 dark:text-gray-100">General Settings</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">Configuration Impact</span>
                                    </div>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        These settings affect how collectors are sized and distributed. Adjust the maximum load to balance performance and resource utilization. Use advanced settings to configure device/collector defaults and protocol weights if needed.
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                                                <Label className="text-gray-900 dark:text-gray-100 font-medium">Maximum Collector Load (%)</Label>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                                                <span className="text-gray-900 dark:text-gray-100 font-medium">{config.maxLoad}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="relative h-2">
                                                <style>{sliderStyles}</style>
                                                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100 rounded-full overflow-hidden pointer-events-none">
                                                    <div
                                                        className={`h-full ${config.maxLoad >= 80 ? 'bg-red-500' :
                                                            config.maxLoad >= 60 ? 'bg-yellow-500' :
                                                                'bg-green-500'
                                                            }`}
                                                        style={{ width: `${config.maxLoad}%` }}
                                                    />
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="100"
                                                    value={config.maxLoad}
                                                    onChange={(e) => {
                                                        const updatedConfig: Config = {
                                                            ...config,
                                                            maxLoad: parseInt(e.target.value) || 85
                                                        };
                                                        onUpdate(updatedConfig);
                                                    }}
                                                    className="absolute top-0 left-0 right-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-blue-700"
                                                    style={{ WebkitAppearance: 'none', appearance: 'none' }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500 pt-1">
                                                <span>1%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                                            <Label className="text-gray-900 dark:text-gray-100 font-medium">Additional Settings</Label>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Server className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                                                    <div>
                                                        <Label className="text-gray-900 dark:text-gray-100" htmlFor="pollingFailover">
                                                            Enable Redundancy for Polling
                                                        </Label>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Add N+1 redundancy for polling collectors</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id="pollingFailover"
                                                    checked={config.enablePollingFailover}
                                                    onCheckedChange={(checked) => {
                                                        const updatedConfig: Config = {
                                                            ...config,
                                                            enablePollingFailover: checked
                                                        };
                                                        onUpdate(updatedConfig);
                                                    }}
                                                    className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-600 border-2 border-gray-300 dark:border-gray-600 transition-colors duration-200"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Activity className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                                                    <div>
                                                        <Label className="text-gray-900 dark:text-gray-100" htmlFor="logsFailover">
                                                            Enable Redundancy for Logs/NetFlow
                                                        </Label>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Add N+1 redundancy for log collectors</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id="logsFailover"
                                                    checked={config.enableLogsFailover}
                                                    onCheckedChange={(checked) => {
                                                        const updatedConfig: Config = {
                                                            ...config,
                                                            enableLogsFailover: checked
                                                        };
                                                        onUpdate(updatedConfig);
                                                    }}
                                                    className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-600 border-2 border-gray-300 dark:border-gray-600 transition-colors duration-200"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <RiAdminLine className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                                                    <div>
                                                        <Label className="text-gray-900 dark:text-gray-100" htmlFor="advanced-settings">
                                                            Show Advanced Settings
                                                        </Label>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Show additional settings for device/collector defaults and protocol weights</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id="advanced-settings"
                                                    checked={config.showAdvancedSettings}
                                                    onCheckedChange={(checked) => {
                                                        const updatedConfig: Config = {
                                                            ...config,
                                                            showAdvancedSettings: checked
                                                        };
                                                        onUpdate(updatedConfig);
                                                    }}
                                                    className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-600 border-2 border-gray-300 dark:border-gray-600 transition-colors duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </EnhancedCard>
                </TabsContent>

                {config.showAdvancedSettings && (
                    <>
                        <TabsContent value="devices">
                            <EnhancedCard className="bg-white dark:bg-gray-900 min-h-[900px] border border-gray-200 dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <Server className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                        <CardTitle className="text-gray-900 dark:text-gray-100">Device Defaults</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                                            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="font-medium text-sm sm:text-base">Device Configuration</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                                            Configure base instances and collection methods for each device type. These settings will be used as defaults when adding devices to sites.
                                        </p>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-6">
                                        <div className="w-full lg:w-[350px] lg:shrink-0">
                                            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="New device type..."
                                                        value={newDeviceType}
                                                        onChange={(e) => setNewDeviceType(e.target.value)}
                                                        className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                    />
                                                    <Button
                                                        onClick={addDeviceType}
                                                        size="icon"
                                                        className="shrink-0 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {errors.deviceType && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <p>{errors.deviceType}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                                <Label className="text-sm text-gray-600 dark:text-gray-400 mb-3 block">Device Types</Label>
                                                <ScrollArea className="h-[600px] pr-4">
                                                    <div className="space-y-2">
                                                        {Object.entries(config.deviceDefaults || {}).map(([type, data]) => {
                                                            const IconComponent = (Icons[data.icon as keyof typeof Icons] || Icons.EthernetPort) as LucideIcon;
                                                            return (
                                                                <div
                                                                    key={type}
                                                                    className={`p-3 rounded-lg cursor-pointer group flex items-center gap-3 transition-all ${
                                                                        selectedDeviceType === type
                                                                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                                                                            : 'hover:bg-slate-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 hover:text-slate-900 dark:hover:text-gray-50 border border-transparent'
                                                                    }`}
                                                                    onClick={() => setSelectedDeviceType(type)}
                                                                >
                                                                    <IconComponent className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                                                    {isEditing === type ? (
                                                                        <Input
                                                                            value={editingName}
                                                                            onChange={(e) => setEditingName(e.target.value)}
                                                                            onBlur={() => {
                                                                                if (editingName && editingName !== type) {
                                                                                    const newDeviceDefaults = Object.entries(config.deviceDefaults)
                                                                                        .map(([key, value]): [string, DeviceType] => [key, value as unknown as DeviceType])
                                                                                        .reduce((acc, [key, value]) => {
                                                                                            const newKey = key === type ? editingName : key;
                                                                                            acc[newKey] = value;
                                                                                            return acc;
                                                                                        }, {} as Record<string, DeviceType>);

                                                                                    const newConfig = {
                                                                                        ...config,
                                                                                        deviceDefaults: newDeviceDefaults
                                                                                    };

                                                                                    const updatedSites = sites.map(site => ({
                                                                                        ...site,
                                                                                        devices: Object.entries(site.devices)
                                                                                            .map(([key, value]): [string, DeviceType] => [key, value as unknown as DeviceType])
                                                                                            .reduce((acc, [key, value]) => {
                                                                                                const newKey = key === type ? editingName : key;
                                                                                                acc[newKey] = value;
                                                                                                return acc;
                                                                                            }, {} as Record<string, DeviceType>)
                                                                                    }));

                                                                                    onUpdate(newConfig);
                                                                                    onUpdateSites(updatedSites);
                                                                                }
                                                                                setIsEditing(null);
                                                                                setEditingName('');
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.currentTarget.blur();
                                                                                }
                                                                                if (e.key === 'Escape') {
                                                                                    setIsEditing(null);
                                                                                    setEditingName('');
                                                                                }
                                                                            }}
                                                                            autoFocus
                                                                            className="flex-1"
                                                                        />
                                                                    ) : (
                                                                        <span className="flex-1">{type}</span>
                                                                    )}
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                                        {isEditing === type ? (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    const input = document.activeElement as HTMLInputElement;
                                                                                    input?.blur();
                                                                                    setTimeout(() => {
                                                                                        setIsEditing(null);
                                                                                        setEditingName('');
                                                                                    }, 0);
                                                                                }}
                                                                                className="h-8 w-8"
                                                                            >
                                                                                <Check className="h-4 w-4 text-green-500" />
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    setEditingName(type);
                                                                                    setIsEditing(type);
                                                                                }}
                                                                                className="h-8 w-8"
                                                                            >
                                                                                <Pencil className="h-4 w-4 text-blue-500" />
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                removeDeviceType(type);
                                                                            }}
                                                                            className="h-8 w-8"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </div>

                                        <div className="col-span-3 w-full">
                                            {selectedDeviceType && config.deviceDefaults && config.deviceDefaults[selectedDeviceType] && (
                                                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <Label className="text-gray-600 dark:text-gray-400 mb-2 block">Base Instances</Label>
                                                                <div className="flex items-center gap-3">
                                                                    <Input
                                                                        type="text"
                                                                        value={config.deviceDefaults[selectedDeviceType].instances}
                                                                        onChange={(e) => handleInstancesChange(selectedDeviceType, parseInt(e.target.value) || 0)}
                                                                        className="w-32 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                                        maxLength={4}
                                                                    />
                                                                    <div className="ml-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
                                                                        <Calculator className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                                        <span className="text-sm text-blue-700 dark:text-blue-400">
                                                                            Load Score per Device: <span className="font-medium">
                                                                                {Math.round(Object.entries(config.deviceDefaults[selectedDeviceType].methods)
                                                                                    .reduce((total, [method, ratio]) =>
                                                                                        total + (config.deviceDefaults[selectedDeviceType].instances * ratio * (config.methodWeights[method] || 0)), 0) * 10) / 10}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Settings className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                                                                    <Label className="text-gray-900 dark:text-gray-100">Collection Methods</Label>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <select
                                                                        value={newMethodName}
                                                                        onChange={(e) => setNewMethodName(e.target.value)}
                                                                        className="w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    >
                                                                        <option value="">Select protocol...</option>
                                                                        {Object.keys(config.methodWeights).map((method) => (
                                                                            <option key={method} value={method}>
                                                                                {method}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <Button
                                                                        onClick={() => selectedDeviceType && addCollectionMethod(selectedDeviceType)}
                                                                        className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Add Method
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            {errors.methodName && (
                                                                <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
                                                                    <AlertTriangle className="h-4 w-4" />
                                                                    <p>{errors.methodName}</p>
                                                                </div>
                                                            )}
                                                            {errors.methodRatios && (
                                                                <Alert variant="destructive" className="mb-4">
                                                                    <AlertTriangle className="h-4 w-4" />
                                                                    <AlertDescription>{errors.methodRatios}</AlertDescription>
                                                                </Alert>
                                                            )}
                                                            <div className="space-y-4">
                                                                {Object.keys(config.deviceDefaults[selectedDeviceType].methods).length > 0 ? (
                                                                    Object.entries(config.deviceDefaults[selectedDeviceType].methods).map(([method, ratio]) => (
                                                                        <div
                                                                            key={method}
                                                                            className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                                                        >
                                                                            <div className="flex items-center justify-between mb-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                                                        <Settings className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                                                    </div>
                                                                                    <Label className="capitalize text-gray-900 dark:text-gray-100">{method}</Label>
                                                                                </div>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => selectedDeviceType && removeCollectionMethod(selectedDeviceType, method)}
                                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                                                </Button>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <style>{sliderStyles}</style>
                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 block">Ratio: {(ratio * 100).toFixed(1)}%</Label>
                                                                                <input
                                                                                    type="range"
                                                                                    min="0"
                                                                                    max="1"
                                                                                    step="0.05"
                                                                                    value={ratio}
                                                                                    onChange={(e) => {
                                                                                        updateMethodRatio(
                                                                                            selectedDeviceType,
                                                                                            method,
                                                                                            parseFloat(e.target.value)
                                                                                        );
                                                                                    }}
                                                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-700"
                                                                                />
                                                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                    <span>0%</span>
                                                                                    <span>50%</span>
                                                                                    <span>100%</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                                                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                                                            <Variable className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                                        </div>
                                                                        <div className="text-center space-y-1">
                                                                            <p className="font-medium text-gray-600 dark:text-gray-300">No Collection Methods Defined</p>
                                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                You must define at least one collection method for load calculations to work correctly.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </EnhancedCard>
                        </TabsContent>

                        <TabsContent value="weights">
                            <EnhancedCard className="bg-white dark:bg-gray-900 min-h-[900px] border border-gray-200 dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <Dumbbell className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                        <CardTitle className="text-gray-900 dark:text-gray-100">Protocol Weights</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 bg-white dark:bg-gray-900">
                                    <div className="mb-8">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                                                <Info className="w-5 h-5" />
                                                <span className="font-medium">Protocol Weight Impact</span>
                                            </div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                                Higher weights indicate protocols that require more collector resources. These values directly affect the calculated load score for each device.
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    placeholder="New protocol name..."
                                                    value={newMethodWeightName}
                                                    onChange={(e) => setNewMethodWeightName(e.target.value)}
                                                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-700 pl-10"
                                                />
                                                <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" />
                                            </div>
                                            <div className="relative w-48">
                                                <style>{sliderStyles}</style>
                                                <Label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Weight: {newMethodWeight}</Label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    step="0.1"
                                                    value={newMethodWeight}
                                                    onChange={(e) => setNewMethodWeight(e.target.value)}
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-700"
                                                />
                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <span>1</span>
                                                    <span>3</span>
                                                    <span>5</span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={addProtocolWeight}
                                                className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Protocol
                                            </Button>
                                        </div>
                                        {errors.methodName && (
                                            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm mt-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                <p>{errors.methodName}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.entries(config.methodWeights).map(([method, weight]) => (
                                            <div
                                                key={method}
                                                className="flex flex-col gap-2 group bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                        <Settings className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-xs text-gray-500 dark:text-gray-400 block">Protocol</Label>
                                                        <span className="capitalize text-gray-700 dark:text-gray-200 font-medium">{method}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeProtocolWeight(method)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove protocol"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                    </Button>
                                                </div>
                                                <div className="w-full">
                                                    <style>{sliderStyles}</style>
                                                    <Label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Weight: {weight}</Label>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="5"
                                                        step="0.1"
                                                        value={weight}
                                                        onChange={(e) => {
                                                            const updatedConfig: Config = {
                                                                ...config,
                                                                methodWeights: {
                                                                    ...config.methodWeights,
                                                                    [method]: Number(e.target.value)
                                                                }
                                                            };
                                                            onUpdate(updatedConfig);
                                                        }}
                                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-700"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <span>1</span>
                                                        <span>3</span>
                                                        <span>5</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </EnhancedCard>
                        </TabsContent>

                        <TabsContent value="collector-capacities">
                            <EnhancedCard className="bg-white dark:bg-gray-900 min-h-[900px] border border-gray-200 dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <Database className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                        <CardTitle className="text-gray-900 dark:text-gray-100">Collector Capacities</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 bg-white dark:bg-gray-900">
                                    <CollectorCapacitySection config={config} onUpdate={onUpdate} />
                                </CardContent>
                            </EnhancedCard>
                        </TabsContent>

                    </>
                )}
                <TabsContent value="formula">
                    <EnhancedCard className="bg-white dark:bg-gray-900 min-h-[900px] border border-gray-200 dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <Calculator className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                <CardTitle className="text-gray-900 dark:text-gray-100">Load Calculation Formula</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-8">
                                {/* Formula Overview Section */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <SquareFunction className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                        <p className="text-lg text-gray-900 dark:text-gray-100 font-medium">Formula Breakdown</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 font-mono text-sm sm:text-lg border border-blue-100 dark:border-blue-800 shadow-sm space-y-4">
                                            <div className="flex items-start sm:items-center gap-3 text-gray-900 dark:text-gray-100">
                                                <ArrowRight className="w-5 h-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-1 sm:mt-0" />
                                                <p className="flex-1">
                                                    Device Load = <span className="text-blue-700 dark:text-blue-400">Instances</span> × 
                                                    <span className="text-green-600 dark:text-green-400">Method Weight</span> × 
                                                    <span className="text-purple-600 dark:text-purple-400">Method Ratio</span>
                                                </p>
                                            </div>
                                            <div className="flex items-start sm:items-center gap-3 text-gray-900 dark:text-gray-100">
                                                <ArrowRight className="w-5 h-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-1 sm:mt-0" />
                                                <p className="flex-1">
                                                    Total Load = Σ(<span className="text-orange-600 dark:text-orange-400">Device Load</span> × <span className="text-red-600 dark:text-red-400">Device Count</span>)
                                                </p>
                                            </div>
                                            <div className="flex items-start sm:items-center gap-3 text-gray-900 dark:text-gray-100">
                                                <ArrowRight className="w-5 h-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-1 sm:mt-0" />
                                                <p className="flex-1">
                                                    Collector Load % = (<span className="text-blue-600 dark:text-blue-400">Total Load</span> ÷ (<span className="text-green-600 dark:text-green-400">Collector Capacity</span> × <span className="text-purple-600 dark:text-purple-400">Max Load %</span>)) × 100
                                                </p>
                                            </div>
                                        </div>

                                        {/* Variables Section */}
                                        <div className="mt-8">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Variable className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                                <p className="text-lg text-gray-900 dark:text-gray-100 font-medium">Variables Explained</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    {
                                                        term: "Instances",
                                                        def: "Base average number of monitoring instances for the device type",
                                                        icon: <Box className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    },
                                                    {
                                                        term: "Method Weight",
                                                        def: "The relative weight of each collection method in terms of collector load impact",
                                                        icon: <Weight className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    },
                                                    {
                                                        term: "Method Ratio",
                                                        def: "The proportion of instances using each collection method",
                                                        icon: <PieChart className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    },
                                                    {
                                                        term: "Device Count",
                                                        def: "Number of devices of each type",
                                                        icon: <Layers className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    },
                                                    {
                                                        term: "Collector Capacity",
                                                        def: "Maximum weight capacity for the collector size",
                                                        icon: <Database className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    },
                                                    {
                                                        term: "Max Load %",
                                                        def: "Maximum desired load percentage (default 85%)",
                                                        icon: <Gauge className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    }
                                                ].map(({ term, def, icon }) => (
                                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {icon}
                                                            <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{term}</span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-6">{def}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </EnhancedCard>
                </TabsContent>
            </Tabs>
        </div>
    );
};