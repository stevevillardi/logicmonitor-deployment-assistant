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
import { Dumbbell, Settings, Shield, Server, Activity, Variable } from 'lucide-react';
import { PcCase, Calculator, SquareFunction, ArrowRight, Box, Weight, PieChart, Layers, Database, Gauge } from 'lucide-react';

interface SystemConfigurationProps {
    config: Config;
    onUpdate: (config: Config) => void;
}

export const SystemConfiguration = ({ config, onUpdate }: SystemConfigurationProps) => {
    const [selectedDeviceType, setSelectedDeviceType] = useState(Object.keys(defaultDeviceTypes)[0]);
    const [newDeviceType, setNewDeviceType] = useState('');
    const [newMethodName, setNewMethodName] = useState('');
    const [newMethodWeightName, setNewMethodWeightName] = useState('');
    const [newMethodWeight, setNewMethodWeight] = useState('2.5');
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
                    <div className="flex items-center gap-3">
                        <Dumbbell className="w-6 h-6 text-blue-700" />
                        <CardTitle className="text-gray-900">Protocol Weights</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                    <div className="mb-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-blue-700 mb-2">
                                <Info className="w-5 h-5" />
                                <span className="font-medium">Protocol Weight Impact</span>
                            </div>
                            <p className="text-sm text-blue-600">
                                Higher weights indicate protocols that require more collector resources. These values directly affect the calculated load score for each device.
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="New protocol name..."
                                    value={newMethodWeightName}
                                    onChange={(e) => setNewMethodWeightName(e.target.value)}
                                    className="w-full bg-white border-gray-200 focus:border-blue-700 pl-10"
                                />
                                <Settings className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                            <div className="relative w-48">
                                <Label className="text-xs text-gray-500 block mb-1">Weight: {newMethodWeight}</Label>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={newMethodWeight}
                                    onChange={(e) => setNewMethodWeight(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0</span>
                                    <span>2.5</span>
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
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                                <AlertTriangle className="w-4 h-4" />
                                <p>{errors.methodName}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(config.methodWeights).map(([method, weight]) => (
                            <div 
                                key={method} 
                                className="flex flex-col gap-2 group bg-gray-50 hover:bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Settings className="w-4 h-4 text-blue-700" />
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs text-gray-500 block">Protocol</Label>
                                        <span className="capitalize text-gray-700 font-medium">{method}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeProtocolWeight(method)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove protocol"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="w-full">
                                    <Label className="text-xs text-gray-500 block mb-1">Weight: {weight}</Label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={weight}
                                        onChange={(e) => {
                                            const newWeights = {
                                                ...config.methodWeights,
                                                [method]: Number(e.target.value)
                                            };
                                            onUpdate({ ...config, methodWeights: newWeights });
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0</span>
                                        <span>2.5</span>
                                        <span>5</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </EnhancedCard>
        </TabsContent>

                <TabsContent value="devices">
                    <EnhancedCard className="bg-white h-[900px] overflow-hidden shadow-sm border border-gray-200">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <div className="flex items-center gap-3">
                                <Server className="w-6 h-6 text-blue-700" />
                                <CardTitle className="text-gray-900">Device Defaults</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 text-blue-700 mb-2">
                                    <Info className="w-5 h-5" />
                                    <span className="font-medium">Device Configuration</span>
                                </div>
                                <p className="text-sm text-blue-600">
                                    Configure base instances and collection methods for each device type. These settings will be used as defaults when adding devices to sites.
                                </p>
                            </div>

                            <div className="flex gap-6">
                                <div className="w-[350px] shrink-0">
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="New device type..."
                                                value={newDeviceType}
                                                onChange={(e) => setNewDeviceType(e.target.value)}
                                                className="flex-1 bg-white"
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

                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <Label className="text-sm text-gray-600 mb-3 block">Device Types</Label>
                                        <ScrollArea className="h-[600px] pr-4">
                                            <div className="space-y-2">
                                                {Object.keys(config.deviceDefaults || {}).map((type) => (
                                                    <div
                                                        key={type}
                                                        className={`p-3 rounded-lg cursor-pointer group flex items-center gap-3 transition-all ${
                                                            selectedDeviceType === type
                                                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                                                : 'hover:bg-slate-50 text-gray-900 hover:text-slate-900 border border-transparent'
                                                        }`}
                                                        onClick={() => setSelectedDeviceType(type)}
                                                    >
                                                        <PcCase className="h-4 w-4 text-blue-700" />
                                                        <span className="flex-1">{type}</span>
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
                                </div>

                                <div className="col-span-3 w-full">
                                    {selectedDeviceType && config.deviceDefaults && config.deviceDefaults[selectedDeviceType] && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <Label className="text-gray-600 mb-2 block">Base Instances</Label>
                                                        <div className="flex items-center gap-3">
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
                                                            <div className="ml-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                                                                <Calculator className="w-4 h-4 text-blue-700" />
                                                                <span className="text-sm text-blue-700">
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
                                                            <Settings className="w-5 h-5 text-blue-700" />
                                                            <Label className="text-gray-900">Collection Methods</Label>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={newMethodName}
                                                                onChange={(e) => setNewMethodName(e.target.value)}
                                                                className="w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {Object.entries(
                                                            config.deviceDefaults[selectedDeviceType].methods
                                                        ).map(([method, ratio]) => (
                                                            <div 
                                                                key={method} 
                                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <Settings className="w-4 h-4 text-blue-700" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Label className="capitalize text-gray-900">{method}</Label>
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
                                                                        className="mt-1 bg-white"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => selectedDeviceType && removeCollectionMethod(selectedDeviceType, method)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        ))}
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

                <TabsContent value="general">
                    <EnhancedCard className="bg-white h-[900px] overflow-y-auto shadow-sm border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <Settings className="w-6 h-6 text-blue-700" />
                                <CardTitle className="text-gray-900">General Settings</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-8">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">Configuration Impact</span>
                                    </div>
                                    <p className="text-sm text-blue-600">
                                        These settings affect how collectors are sized and distributed. Adjust the maximum load to balance performance and resource utilization.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                                    <div>
                                    <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="w-5 h-5 text-blue-700" />
                                                <Label className="text-gray-900 font-medium">Maximum Collector Load (%)</Label>
                                            </div>
                                            <div className="bg-gray-100 px-3 py-1 rounded-lg">
                                                <span className="text-gray-900 font-medium">{config.maxLoad}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="relative h-2">
                                                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100 rounded-full overflow-hidden pointer-events-none">
                                                    <div 
                                                        className={`h-full ${
                                                            config.maxLoad >= 80 ? 'bg-red-500' :
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
                                                    onChange={(e) =>
                                                        onUpdate({ ...config, maxLoad: parseInt(e.target.value) || 85 })
                                                    }
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
                                            <Shield className="w-5 h-5 text-blue-700" />
                                            <Label className="text-gray-900 font-medium">Redundancy Settings</Label>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Server className="w-5 h-5 text-blue-700" />
                                                    <div>
                                                        <Label className="text-gray-900" htmlFor="pollingFailover">
                                                            Enable Redundancy for Polling
                                                        </Label>
                                                        <p className="text-sm text-gray-500">Add N+1 redundancy for polling collectors</p>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id="pollingFailover"
                                                        checked={config.enablePollingFailover}
                                                        onChange={(e) =>
                                                            onUpdate({ ...config, enablePollingFailover: e.target.checked })
                                                        }
                                                        className="h-6 w-6 rounded border-gray-300 text-blue-700 focus:ring-blue-700"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Activity className="w-5 h-5 text-blue-700" />
                                                    <div>
                                                        <Label className="text-gray-900" htmlFor="logsFailover">
                                                            Enable Redundancy for Logs/NetFlow
                                                        </Label>
                                                        <p className="text-sm text-gray-500">Add N+1 redundancy for log collectors</p>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id="logsFailover"
                                                        checked={config.enableLogsFailover}
                                                        onChange={(e) =>
                                                            onUpdate({ ...config, enableLogsFailover: e.target.checked })
                                                        }
                                                        className="h-6 w-6 rounded border-gray-300 text-blue-700 focus:ring-blue-700"
                                                    />
                                                </div>
                                            </div>
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
                            <div className="flex items-center gap-3">
                                <Calculator className="w-6 h-6 text-blue-700" />
                                <CardTitle className="text-gray-900">Load Formula Calculation</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-8">
                                {/* Formula Overview Section */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <SquareFunction className="h-5 w-5 text-blue-700" />
                                        <p className="text-lg text-gray-900 font-medium">Formula Breakdown</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white rounded-xl p-6 font-mono text-lg border border-blue-100 shadow-sm space-y-4">
                                            <div className="flex items-center gap-3 text-gray-900">
                                                <ArrowRight className="w-5 h-5 text-blue-700 flex-shrink-0" />
                                                <p>Device Load = <span className="text-blue-700">Instances</span> × <span className="text-green-600">Method Weight</span> × <span className="text-purple-600">Method Ratio</span></p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-900">
                                                <ArrowRight className="w-5 h-5 text-blue-700 flex-shrink-0" />
                                                <p>Total Load = Σ(<span className="text-orange-600">Device Load</span> × <span className="text-red-600">Device Count</span>)</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-900">
                                                <ArrowRight className="w-5 h-5 text-blue-700 flex-shrink-0" />
                                                <p>Collector Load % = (<span className="text-blue-600">Total Load</span> ÷ (<span className="text-green-600">Collector Capacity</span> × <span className="text-purple-600">Max Load %</span>)) × 100</p>
                                            </div>
                                        </div>

                                        {/* Variables Section */}
                                        <div className="mt-8">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Variable className="h-5 w-5 text-blue-700" />
                                                <p className="text-lg text-gray-900 font-medium">Variables Explained</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    {
                                                        term: "Instances",
                                                        def: "Base average number of monitoring instances for the device type",
                                                        icon: <Box className="w-4 h-4 text-blue-700" />
                                                    },
                                                    {
                                                        term: "Method Weight",
                                                        def: "The relative weight of each collection method in terms of collector load impact",
                                                        icon: <Weight className="w-4 h-4 text-blue-700" />
                                                    },
                                                    {
                                                        term: "Method Ratio",
                                                        def: "The proportion of instances using each collection method",
                                                        icon: <PieChart className="w-4 h-4 text-blue-700" />
                                                    },
                                                    {
                                                        term: "Device Count",
                                                        def: "Number of devices of each type",
                                                        icon: <Layers className="w-4 h-4 text-blue-700" />
                                                    },
                                                    {
                                                        term: "Collector Capacity",
                                                        def: "Maximum weight capacity for the collector size",
                                                        icon: <Database className="w-4 h-4 text-blue-700" />
                                                    },
                                                    {
                                                        term: "Max Load %",
                                                        def: "Maximum desired load percentage (default 85%)",
                                                        icon: <Gauge className="w-4 h-4 text-blue-700" />
                                                    }
                                                ].map(({ term, def, icon }) => (
                                                    <div key={term} 
                                                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex gap-3">
                                                        <div className="mt-0.5">
                                                            {icon}
                                                        </div>
                                                        <div>
                                                            <span className="text-blue-700 font-semibold block mb-1">{term}</span>
                                                            <span className="text-gray-600 text-sm">{def}</span>
                                                        </div>
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