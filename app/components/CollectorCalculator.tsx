"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Server,
  Database,
  Network,
  Settings,
  Activity,
  Router,
  Cpu,
  HardDrive,
  Monitor,
  Wifi,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Constants
const defaultDeviceTypes = {
  "Linux Servers": {
    count: 0,
    instances: 75,
    methods: { snmpv3: 0.5, script: 0.5 },
  },
  "SQL Servers (Linux)": {
    count: 0,
    instances: 5,
    methods: { jdbc: 0.75, script: 0.25 },
  },
  "Windows Servers": {
    count: 0,
    instances: 75,
    methods: { wmi: 0.5, script: 0.5 },
  },
  "SQL Servers (Windows)": {
    count: 0,
    instances: 5,
    methods: { script: 0.25, jdbc: 0.25, wmi: 0.5 },
  },
  Routers: { count: 0, instances: 120, methods: { snmpv2: 0.5, snmpv3: 0.5 } },
  Switches: { count: 0, instances: 120, methods: { snmpv2: 0.5, snmpv3: 0.5 } },
  Firewalls: {
    count: 0,
    instances: 120,
    methods: { script: 0.5, snmpv2: 0.25, snmpv3: 0.25 },
  },
  "SD-WAN Edges": { count: 0, instances: 15, methods: { script: 1 } },
  "Access Points": { count: 0, instances: 10, methods: { script: 1 } },
  "Storage Arrays": {
    count: 0,
    instances: 150,
    methods: { snmpv2: 0.5, script: 0.5 },
  },
  "vCenter VMs": { count: 0, instances: 18, methods: { script: 1 } },
  "ESXi Hosts": {
    count: 0,
    instances: 18,
    methods: { script: 1 },
  },
};

const defaultMethodWeights = {
  snmpv2: 0.8,
  snmpv3: 1,
  wmi: 2,
  winrm: 2,
  jdbc: 1.5,
  script: 5,
};

const collectorCapacities = {
  XXL: { weight: 100000, eps: 52817 },
  XL: { weight: 35000, eps: 37418 },
  LARGE: { weight: 25000, eps: 23166 },
  MEDIUM: { weight: 12500, eps: 13797 },
  SMALL: { weight: 10000, eps: 7800 },
};

// Utility Functions
const calculateWeightedScore = (devices, methodWeights) => {
  return Object.entries(devices).reduce((total, [type, data]) => {
    if (data.count === 0) return total;

    const methodScores = Object.entries(data.methods).map(([method, ratio]) => {
      return data.instances * ratio * methodWeights[method];
    });

    const deviceScore = methodScores.reduce((sum, score) => sum + score, 0);
    return total + deviceScore * data.count;
  }, 0);
};

const calculateCollectors = (totalWeight, totalEPS, maxLoad, config) => {
  // Add config parameter
  const calculateForCapacity = (total, isEPS) => {
    let size = "XXL";
    let minCollectors = Infinity;

    Object.entries(collectorCapacities).forEach(([collectorSize, limits]) => {
      const limit = isEPS ? limits.eps : limits.weight;
      const needed = Math.ceil(total / (limit * (maxLoad / 100)));
      if (needed <= minCollectors) {
        minCollectors = needed;
        size = collectorSize;
      }
    });

    return { size, count: minCollectors };
  };

  const pollingConfig = calculateForCapacity(totalWeight, false);
  const logsConfig = calculateForCapacity(totalEPS, true);

  return {
    polling: {
      collectors: Array(
        pollingConfig.count + (config.enablePollingFailover ? 1 : 0)
      ) // Modified
        .fill(null)
        .map((_, idx) => ({
          size: pollingConfig.size,
          type:
            idx === pollingConfig.count && config.enablePollingFailover
              ? "N+1 Redundancy"
              : "Primary",
          load:
            idx === pollingConfig.count && config.enablePollingFailover
              ? 0
              : Math.round(
                  (totalWeight /
                    pollingConfig.count /
                    collectorCapacities[pollingConfig.size].weight) *
                    100
                ),
        })),
    },
    logs: {
      collectors: Array(logsConfig.count + (config.enableLogsFailover ? 1 : 0)) // Modified
        .fill(null)
        .map((_, idx) => ({
          size: logsConfig.size,
          type:
            idx === logsConfig.count && config.enableLogsFailover
              ? "N+1 Redundancy"
              : "Primary",
          load:
            idx === logsConfig.count && config.enableLogsFailover
              ? 0
              : Math.round(
                  (totalEPS /
                    logsConfig.count /
                    collectorCapacities[logsConfig.size].eps) *
                    100
                ),
        })),
    },
  };
};

// Component Definitions
const DeviceTypeCard = ({ type, data, onUpdate }) => {
  const getIcon = () => {
    switch (type) {
      case "Linux Servers":
      case "Windows Servers":
        return <Server className="w-6 h-6 text-blue-600" />;
      case "SQL Servers (Linux)":
      case "SQL Servers (Windows)":
        return <Database className="w-6 h-6 text-purple-600" />;
      case "Routers":
        return <Router className="w-6 h-6 text-orange-600" />;
      case "Switches":
        return <Network className="w-6 h-6 text-green-600" />;
      case "Firewalls":
        return <Settings className="w-6 h-6 text-red-600" />;
      case "SD-WAN Edges":
        return <Activity className="w-6 h-6 text-yellow-600" />;
      case "Access Points":
        return <Wifi className="w-6 h-6 text-cyan-600" />;
      case "Storage Arrays":
        return <HardDrive className="w-6 h-6 text-indigo-600" />;
      case "vCenter VMs":
      case "ESXi Hosts":
        return <Monitor className="w-6 h-6 text-violet-600" />;
      default:
        return <Cpu className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        {getIcon()}
        <h3 className="font-semibold text-slate-700">{type}</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-sm text-slate-500">Device Count</Label>
          <Input
            type="text"
            value={data.count}
            onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div className="text-sm">
          <span className="text-slate-500">Base Instances:</span>
          <span className="ml-2 font-medium text-slate-700">
            {data.instances}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-slate-500">Collection Methods:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {Object.entries(data.methods).map(([method, ratio]) => (
              <span
                key={method}
                className="px-2 py-1 bg-slate-100 rounded-full text-xs"
              >
                {method} ({ratio * 100}%)
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LogsInput = ({ logs, onUpdate }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(logs).map(([type, eps]) => (
        <div key={type} className="p-4 bg-white rounded-lg shadow">
          <Label className="font-medium capitalize">{type} EPS</Label>
          <Input
            type="text"
            value={eps}
            onChange={(e) => {
              const newLogs = {
                ...logs,
                [type]: parseInt(e.target.value) || 0,
              };
              onUpdate(newLogs);
            }}
            className="mt-2"
          />
        </div>
      ))}
    </div>
  );
};

const CollectorVisualization = ({ polling, logs }) => {
  const getLoadColor = (load) => {
    if (load >= 80) return "bg-red-100 border-red-300 text-red-700";
    if (load >= 60) return "bg-yellow-100 border-yellow-300 text-yellow-700";
    return "bg-green-100 border-green-300 text-green-700";
  };

  return (
    <div className="space-y-6">
      <div className="border-2 rounded-lg p-6 bg-slate-50 border-blue-600">
        <h3 className="text-xl font-bold text-blue-800 mb-4">Polling ABCG</h3>
        <div className="grid grid-cols-3 gap-4">
          {polling.collectors.map((collector, idx) => (
            <div
              key={idx}
              className={`border-2 rounded-lg p-4 ${
                collector.type === "N+1 Redundancy"
                  ? "bg-blue-50 border-blue-200"
                  : getLoadColor(collector.load)
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5" />
                <p className="font-semibold">
                  {collector.size} Collector {idx + 1}
                </p>
              </div>
              <div className="space-y-2">
                <p>{collector.type}</p>
                {collector.type !== "N+1 Redundancy" && (
                  <div className="space-y-2">
                    <p>
                      {collector.type}{" "}
                      <span
                        className={`${
                          collector.load >= 80
                            ? "text-red-600"
                            : collector.load >= 60
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        ({collector.load}%)
                      </span>
                    </p>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${collector.load}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-2 rounded-lg p-6 bg-slate-50 border-green-600">
        <h3 className="text-xl font-bold text-green-800 mb-4">
          Logs/NetFlow Collectors
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {logs.collectors.map((collector, idx) => (
            <div
              key={idx}
              className={`border-2 rounded-lg p-4 ${
                collector.type === "N+1 Redundancy"
                  ? "bg-blue-50 border-blue-200"
                  : getLoadColor(collector.load)
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5" />
                <p className="font-semibold">
                  {collector.size} Collector {idx + 1}
                </p>
              </div>
              <div className="space-y-2">
                <p>{collector.type}</p>
                {collector.type !== "N+1 Redundancy" && (
                  <div className="space-y-2">
                    <p>
                      {collector.type}{" "}
                      <span
                        className={`${
                          collector.load >= 80
                            ? "text-red-600"
                            : collector.load >= 60
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        ({collector.load}%)
                      </span>
                    </p>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${collector.load}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SystemConfiguration = ({ config, onUpdate }) => {
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Protocol Weights</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(config.methodWeights).map(([method, weight]) => (
            <div key={method} className="flex items-center gap-2">
              <Label className="w-24 capitalize">{method}</Label>
              <Input
                type="text"
                value={weight}
                step="0.1"
                onChange={(e) => {
                  const newWeights = {
                    ...config.methodWeights,
                    [method]: parseFloat(e.target.value) || 0,
                  };
                  onUpdate({ ...config, methodWeights: newWeights });
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Maximum Collector Load (%)</h3>
        <Input
          type="text"
          value={config.maxLoad}
          onChange={(e) =>
            onUpdate({ ...config, maxLoad: parseInt(e.target.value) || 85 })
          }
          className="w-32"
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Failover Settings</h3>
        <div className="flex flex-col gap-4">
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
            <Label htmlFor="pollingFailover">
              Enable Polling Failover Collector
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
            <Label htmlFor="logsFailover">
              Enable Logs/NetFlow Failover Collector
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

const SiteConfiguration = ({ sites, onUpdateSites, config }) => {
  const resetSite = (index, type) => {
    const newSites = [...sites];
    if (type === "devices") {
      newSites[index].devices = Object.fromEntries(
        Object.entries(defaultDeviceTypes).map(([type, data]) => [
          type,
          { ...data, count: 0 },
        ])
      );
    } else if (type === "logs") {
      newSites[index].logs = {
        netflow: 0,
        syslog: 0,
        traps: 0,
      };
    }
    onUpdateSites(newSites);
  };

  const getSiteResults = (site) => {
    const totalWeight = calculateWeightedScore(
      site.devices,
      config.methodWeights
    );
    const totalEPS = Object.values(site.logs).reduce(
      (sum, eps) => sum + eps,
      0
    );
    return calculateCollectors(totalWeight, totalEPS, config.maxLoad, config);
  };

  const calculateAverageLoad = (collectors) => {
    const primaryCollectors = collectors.filter((c) => c.type === "Primary");
    if (primaryCollectors.length === 0) return 0;
    return Math.round(
      primaryCollectors.reduce((sum, c) => sum + c.load, 0) /
        primaryCollectors.length
    );
  };

  const [expandedSites, setExpandedSites] = useState(new Set([0])); // Start with first site expanded

  const toggleSite = (index) => {
    setExpandedSites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const addSite = () => {
    const blankDevices = Object.fromEntries(
      Object.entries(defaultDeviceTypes).map(([type, data]) => [
        type,
        { ...data, count: 0 },
      ])
    );

    const newSite = {
      name: `Site ${sites.length + 1}`,
      devices: { ...defaultDeviceTypes },
      logs: {
        netflow: 0,
        syslog: 0,
        traps: 0,
      },
    };
    onUpdateSites([...sites, newSite]);
  };

  const deleteSite = (index) => {
    onUpdateSites(sites.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {sites.map((site, index) => (
        <Card key={index} className="bg-white">
          <CardHeader
            className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50"
            onClick={() => toggleSite(index)}
          >
            <div className="flex items-center gap-4">
              <Network className="w-6 h-6 text-blue-600" />
              <div className="flex items-center gap-2">
                <Input
                  value={site.name}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSites = [...sites];
                    newSites[index].name = e.target.value;
                    onUpdateSites(newSites);
                  }}
                  className="w-64"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-slate-400">
                  {expandedSites.has(index) ? "▼" : "▶"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Add collector summary */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">
                    {
                      getSiteResults(site).polling.collectors.filter(
                        (c) => c.type === "Primary"
                      ).length
                    }
                    {config.enablePollingFailover && "+1"}{" "}
                    {getSiteResults(site).polling.collectors.length > 0
                      ? getSiteResults(site).polling.collectors[0].size
                      : ""}
                    <span
                      className={`ml-1 ${
                        calculateAverageLoad(
                          getSiteResults(site).polling.collectors
                        ) >= 80
                          ? "text-red-600"
                          : calculateAverageLoad(
                              getSiteResults(site).polling.collectors
                            ) >= 60
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      (
                      {calculateAverageLoad(
                        getSiteResults(site).polling.collectors
                      )}
                      %)
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600">
                    {
                      getSiteResults(site).logs.collectors.filter(
                        (c) => c.type === "Primary"
                      ).length
                    }
                    {config.enableLogsFailover && "+1"}{" "}
                    {getSiteResults(site).logs.collectors.length > 0
                      ? getSiteResults(site).logs.collectors[0].size
                      : ""}
                    <span
                      className={`ml-1 ${
                        calculateAverageLoad(
                          getSiteResults(site).logs.collectors
                        ) >= 80
                          ? "text-red-600"
                          : calculateAverageLoad(
                              getSiteResults(site).logs.collectors
                            ) >= 60
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      (
                      {calculateAverageLoad(
                        getSiteResults(site).logs.collectors
                      )}
                      %)
                    </span>
                  </span>
                </div>
              </div>
              <span className="text-sm text-slate-500 border-l border-slate-200 pl-4">
                {Object.values(site.devices).reduce(
                  (sum, device) => sum + (device.count || 0),
                  0
                )}{" "}
                Devices
              </span>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSite(index);
                }}
                className="bg-red-100 text-red-600 hover:bg-red-200"
              >
                Remove Site
              </Button>
            </div>
          </CardHeader>
          {expandedSites.has(index) && (
            <CardContent>
              <Tabs defaultValue="devices">
                <TabsList>
                  <TabsTrigger value="devices">Devices</TabsTrigger>
                  <TabsTrigger value="logs">Logs & NetFlow</TabsTrigger>
                </TabsList>

                <TabsContent value="devices" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Devices</h3>
                    <Button
                      onClick={() => resetSite(index, "devices")}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      Reset Devices
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(site.devices).map(([type, data]) => (
                      <DeviceTypeCard
                        key={type}
                        type={type}
                        data={data}
                        onUpdate={(newCount) => {
                          const newSites = [...sites];
                          newSites[index].devices[type].count = newCount;
                          onUpdateSites(newSites);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Logs & NetFlow</h3>
                    <Button
                      onClick={() => resetSite(index, "logs")}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      Reset Logs
                    </Button>
                  </div>
                  <LogsInput
                    logs={site.logs}
                    onUpdate={(newLogs) => {
                      const newSites = [...sites];
                      newSites[index].logs = newLogs;
                      onUpdateSites(newSites);
                    }}
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  {site.name} Collectors
                </h3>
                <CollectorVisualization
                  polling={getSiteResults(site).polling}
                  logs={getSiteResults(site).logs}
                />
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      <Button
        onClick={addSite}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
      >
        Add New Site
      </Button>
    </div>
  );
};

const CollectorCalculator = () => {
  const [config, setConfig] = useState({
    methodWeights: { ...defaultMethodWeights },
    maxLoad: 85,
    enablePollingFailover: true,
    enableLogsFailover: false,
  });

  const [sites, setSites] = useState([
    {
      name: "Default Site",
      devices: { ...defaultDeviceTypes },
      logs: {
        netflow: 0,
        syslog: 0,
        traps: 0,
      },
    },
  ]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-7xl bg-slate-100">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-2xl text-blue-900">
            LogicMonitor Collector Capacity Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="sites">
            <TabsList className="mb-6">
              <TabsTrigger value="sites">Site Configuration</TabsTrigger>
              <TabsTrigger value="system">System Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="sites">
              <SiteConfiguration
                sites={sites}
                onUpdateSites={setSites}
                config={config}
              />
            </TabsContent>

            <TabsContent value="system">
              <SystemConfiguration config={config} onUpdate={setConfig} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectorCalculator;
