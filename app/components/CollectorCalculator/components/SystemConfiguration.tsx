import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button, Input } from '@/components/ui/enhanced-components'
import { Config } from '../types';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { defaultDeviceTypes } from '../constants';
import { useEffect } from 'react';
import EnhancedCard from '@/components/ui/enhanced-card';
interface SystemConfigurationProps {
    config: Config;
    onUpdate: (config: Config) => void;
}

export const SystemConfiguration = ({ config, onUpdate }: SystemConfigurationProps) => {
    const [selectedDeviceType, setSelectedDeviceType] = useState(Object.keys(defaultDeviceTypes)[0]);
    const [newDeviceType, setNewDeviceType] = useState('');
    const [newMethodName, setNewMethodName] = useState('');
    const [newMethodWeightName, setNewMethodWeightName] = useState('');
    const [newMethodWeight, setNewMethodWeight] = useState('');
    const [errors, setErrors] = useState<{
        methodRatios?: string;
        deviceType?: string;
        methodName?: string;
    }>({});

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

        const newDefaults = {
            ...config.deviceDefaults,
            [newDeviceType]: {
                instances: 0,
                count: 0,
                methods: { script: 1 } // Default to script with 100%
            }
        };
        onUpdate({ ...config, deviceDefaults: newDefaults });
        setNewDeviceType('');
        setErrors(prev => ({ ...prev, deviceType: undefined }));
        setSelectedDeviceType(newDeviceType);
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
        const newWeights = {
            ...config.methodWeights,
            [newMethodWeightName]: weight
        };

        onUpdate({ ...config, methodWeights: newWeights });
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
        // Don't allow deletion if it's the last device type
        if (Object.keys(config.deviceDefaults).length <= 1) {
            setErrors(prev => ({
                ...prev,
                deviceType: 'Cannot delete the last device type'
            }));
            return;
        }

        const newDefaults = { ...config.deviceDefaults };
        delete newDefaults[type];

        // If we're deleting the currently selected type, select another one
        if (type === selectedDeviceType) {
            const newSelectedType = Object.keys(newDefaults)[0];
            setSelectedDeviceType(newSelectedType);
        }

        onUpdate({ ...config, deviceDefaults: newDefaults });
        setErrors(prev => ({ ...prev, deviceType: undefined }));
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

        const newDefaults = {
            ...config.deviceDefaults,
            [deviceType]: {
                ...config.deviceDefaults[deviceType],
                methods: newMethods
            }
        };

        onUpdate({ ...config, deviceDefaults: newDefaults });
        setNewMethodName('');
        setErrors(prev => ({ ...prev, methodName: undefined }));
    };

    const removeCollectionMethod = (deviceType: string, method: string) => {
        const currentMethods = config.deviceDefaults[deviceType].methods;
        const removedRatio = currentMethods[method];
        const remainingMethods = { ...currentMethods };
        delete remainingMethods[method];

        // Redistribute the removed ratio among remaining methods
        const methodCount = Object.keys(remainingMethods).length;
        if (methodCount > 0) {
            const redistributeAmount = removedRatio / methodCount;
            Object.keys(remainingMethods).forEach(key => {
                remainingMethods[key] += redistributeAmount;
            });
        }

        const newDefaults = {
            ...config.deviceDefaults,
            [deviceType]: {
                ...config.deviceDefaults[deviceType],
                methods: remainingMethods
            }
        };

        onUpdate({ ...config, deviceDefaults: newDefaults });
    };

    const updateMethodRatio = (deviceType: string, method: string, value: number) => {
        const newMethods = {
            ...config.deviceDefaults[deviceType].methods,
            [method]: value
        };

        if (!validateMethodRatios(newMethods)) {
            setErrors(prev => ({
                ...prev,
                methodRatios: 'Collection method ratios must sum to 1'
            }));
        } else {
            setErrors(prev => ({ ...prev, methodRatios: undefined }));
        }

        const newDefaults = {
            ...config.deviceDefaults,
            [deviceType]: {
                ...config.deviceDefaults[deviceType],
                methods: newMethods
            }
        };

        onUpdate({ ...config, deviceDefaults: newDefaults });
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="general">
                <TabsList className="mb-4 bg-white border border-gray-200">
                    <TabsTrigger value="general" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">General Settings</TabsTrigger>
                    <TabsTrigger value="devices" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Device Defaults</TabsTrigger>
                    <TabsTrigger value="weights" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Protocol Weights</TabsTrigger>
                    <TabsTrigger value="formula" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Load Formula</TabsTrigger>
                </TabsList>

                <TabsContent value="weights">
                    <EnhancedCard className="bg-white h-[900px] overflow-y-auto shadow-sm border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-gray-900">Protocol Weights</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            {/* Add new protocol weight */}
                            <div className="mb-6">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New protocol name..."
                                        value={newMethodWeightName}
                                        onChange={(e) => setNewMethodWeightName(e.target.value)}
                                        className="w-64 bg-white border-gray-200 focus:border-blue-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Weight..."
                                        className="w-32 bg-white border-gray-200 focus:border-blue-700"
                                        value={newMethodWeight}
                                        onChange={(e) => setNewMethodWeight(e.target.value)}
                                    />
                                    <Button
                                        onClick={addProtocolWeight}
                                        className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                                    >
                                        Add Protocol
                                    </Button>
                                </div>
                                {errors.methodName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.methodName}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {Object.entries(config.methodWeights).map(([method, weight]) => (
                                    <div key={method} className="flex items-center gap-2 group">
                                        <Label className="w-24 capitalize text-gray-700">{method}</Label>
                                        <Input
                                            type="text"
                                            value={weight.toString()}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^-?\d*\.?\d*$/.test(value)) {
                                                    const newWeights = {
                                                        ...config.methodWeights,
                                                        [method]: value === '' ? 0 :  Number(value)
                                                    };
                                                    onUpdate({ ...config, methodWeights: newWeights });
                                                }
                                            }}
                                            className="bg-white border-gray-200 focus:border-blue-700"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeProtocolWeight(method)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </EnhancedCard>
                </TabsContent>

                <TabsContent value="devices">
                    <EnhancedCard className="bg-white h-[900px] overflow-y-auto shadow-sm border border-gray-200">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="text-gray-900">Device Defaults</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1 border-r pr-4">
                                    <div className="mb-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="New device type..."
                                                value={newDeviceType}
                                                onChange={(e) => setNewDeviceType(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={addDeviceType}
                                                size="icon"
                                                className="shrink-0"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.deviceType && (
                                            <p className="text-red-500 text-sm mt-1">{errors.deviceType}</p>
                                        )}
                                    </div>

                                    <Label className="mb-2 block">Device Types</Label>
                                    <ScrollArea className="h-[600px] overflow-y-auto pr-4">
                                        <div className="space-y-2 pr-2">
                                            {Object.keys(config.deviceDefaults || {}).map((type) => (
                                                <div
                                                    key={type}
                                                    className={`p-2 rounded cursor-pointer group flex items-center justify-between ${selectedDeviceType === type
                                                        ? 'bg-blue-100 text-blue-900'
                                                        : 'hover:bg-slate-50 text-gray-900 hover:text-slate-900'
                                                        }`}
                                                >
                                                    <div
                                                        onClick={() => setSelectedDeviceType(type)}
                                                        className="flex-1"
                                                    >
                                                        {type}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeDeviceType(type);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>

                                <div className="col-span-3 pl-4">
                                    {selectedDeviceType && config.deviceDefaults && config.deviceDefaults[selectedDeviceType] && (
                                        <div className="space-y-6">
                                            <div>
                                                <Label>Base Instances</Label>
                                                <Input
                                                    type="number"
                                                    value={config.deviceDefaults[selectedDeviceType].instances}
                                                    onChange={(e) => {
                                                        const newDefaults = {
                                                            ...config.deviceDefaults,
                                                            [selectedDeviceType]: {
                                                                ...config.deviceDefaults[selectedDeviceType],
                                                                instances: parseInt(e.target.value) || 0
                                                            }
                                                        };
                                                        onUpdate({ ...config, deviceDefaults: newDefaults });
                                                    }}
                                                    className="w-32"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <Label>Collection Methods</Label>
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={newMethodName}
                                                            onChange={(e) => setNewMethodName(e.target.value)}
                                                            className="w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                            size="icon"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {errors.methodName && (
                                                    <p className="text-red-500 text-sm mb-2">{errors.methodName}</p>
                                                )}
                                                {errors.methodRatios && (
                                                    <Alert variant="destructive" className="mb-4">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription>{errors.methodRatios}</AlertDescription>
                                                    </Alert>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    {Object.entries(
                                                        config.deviceDefaults[selectedDeviceType].methods
                                                    ).map(([method, ratio]) => (
                                                        <div key={method} className="flex items-center gap-2">
                                                            <Label className="w-24 capitalize">{method}</Label>
                                                            <Input
                                                                type="text"
                                                                value={ratio.toString()}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^-?\d*\.?\d*$/.test(value)) {
                                                                        updateMethodRatio(
                                                                            selectedDeviceType,
                                                                            method,
                                                                            value === '' ? 0 : Number(value)
                                                                        );
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    const value = parseFloat(e.target.value) || 0;
                                                                    updateMethodRatio(
                                                                        selectedDeviceType,
                                                                        method,
                                                                        value
                                                                    );
                                                                }}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => selectedDeviceType && removeCollectionMethod(selectedDeviceType, method)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </EnhancedCard>
                </TabsContent>

                <TabsContent value="general">
                    <EnhancedCard className="bg-white h-[900px] overflow-y-auto shadow-sm border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-gray-900">General Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-gray-900 font-medium">Maximum Collector Load (%)</Label>
                                    <div className="mt-2">
                                        <Input
                                            type="number"
                                            value={config.maxLoad}
                                            onChange={(e) =>
                                                onUpdate({ ...config, maxLoad: parseInt(e.target.value) || 85 })
                                            }
                                            className="w-32"
                                            min="1"
                                            max="100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-gray-900 font-medium">Redundancy Settings</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="pollingFailover"
                                                checked={config.enablePollingFailover}
                                                onChange={(e) =>
                                                    onUpdate({ ...config, enablePollingFailover: e.target.checked })
                                                }
                                                className="h-4 w-4"
                                            />
                                            <Label className="text-gray-900" htmlFor="pollingFailover">
                                                Enable Redundancy for Polling
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="logsFailover"
                                                checked={config.enableLogsFailover}
                                                onChange={(e) =>
                                                    onUpdate({ ...config, enableLogsFailover: e.target.checked })
                                                }
                                                className="h-4 w-4"
                                            />
                                            <Label className="text-gray-900" htmlFor="logsFailover">
                                                Enable Redundancy for Logs/NetFlow
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </EnhancedCard>
                </TabsContent>
                <TabsContent value="formula">
                    <EnhancedCard className="bg-white h-[900px] overflow-y-auto shadow-sm border border-gray-200">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="text-gray-900">Load Formula Calculation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                        <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="h-5 w-5 text-blue-700" />
                                        <p className="text-lg text-gray-900 font-medium">Formula Overview</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white rounded-lg p-6 font-mono text-lg border border-blue-100 shadow-sm">
                                            <p className="text-gray-900 mb-1">
                                                Device Load = Instances × Method Weight × Method Ratio
                                            </p>
                                            <p className="text-gray-900 mb-1">
                                                Total Load = Σ(Device Load × Device Count)
                                            </p>
                                            <p className="text-gray-900">
                                                Collector Load % = (Total Load / (Collector Capacity × Max Load %)) × 100
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            <p className="text-gray-900 mb-3 font-medium">Variables Explained:</p>
                                            <div className="grid gap-2">
                                                {[
                                                    {
                                                        term: "Instances",
                                                        def: "Base average number of monitoring instances for the device type"
                                                    },
                                                    {
                                                        term: "Method Weight",
                                                        def: "The relative weight of each collection method in terms of collector load impact (SNMP, WMI, etc.)"
                                                    },
                                                    {
                                                        term: "Method Ratio",
                                                        def: "The proportion of instances using each collection method"
                                                    },
                                                    {
                                                        term: "Device Count",
                                                        def: "Number of devices of each type"
                                                    },
                                                    {
                                                        term: "Collector Capacity",
                                                        def: "Maximum weight capacity for the collector size"
                                                    },
                                                    {
                                                        term: "Max Load %",
                                                        def: "Maximum desired load percentage (default 85%)"
                                                    }
                                                ].map(({ term, def }) => (
                                                    <div key={term} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                                        <span className="text-blue-700 font-semibold">{term}:</span>
                                                        <span className="ml-2 text-gray-700">{def}</span>
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