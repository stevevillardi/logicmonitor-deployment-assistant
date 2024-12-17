import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Server, Cloud, Users, Box, BarChart, ExternalLink } from 'lucide-react';
import { SiKubernetes } from "react-icons/si";

const LicenseInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Usage Calculation Section */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <BarChart className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-semibold">Usage Calculation Method</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              As it relates to cost, LogicMonitor charges for certain resource units per month. These billable resource units are marked in the table below. To calculate the costs, snapshots are taken every few hours and monthly averages are obtained. This ensures that you are not penalized for small spikes in usage.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Calculation Process:</h4>
              <ul className="list-disc pl-6 space-y-2 text-sm text-blue-800">
                <li>Usage snapshots are taken every few hours</li>
                <li>Daily snapshots are averaged for a daily usage figure</li>
                <li>Daily averages are combined for a monthly average usage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core License Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-semibold">Infrastructure Monitoring</h3>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Licensed by endpoint quantity:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-gray-600">
              <li>Servers, Network Devices, Storage Arrays, etc...</li>
              <li>Cloud resources (IaaS/PaaS) monitored via a local collector</li>
              <li>Special SKU available for Access Points (Juniper Mist, Meraki, Ubiquiti Unifi, etc.)</li>
            </ul>
            <a 
              href="https://www.logicmonitor.com/pricing" 
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View Documentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-semibold">Cloud Monitoring</h3>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Licensed by IaaS/PaaS resource count:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-gray-600">
              <li>AWS, Azure, and GCP resources</li>
              <li>Categorized as IaaS, PaaS, or Non-compute</li>
              <li>Billed based on resource type and category</li>
              <li>Includes allocation of non-compute resources per IaaS/PaaS license</li>
            </ul>
            <a 
              href="https://www.logicmonitor.com/support/cloud-services-and-resource-units" 
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View Cloud Documentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-semibold">SaaS Service Monitoring</h3>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Licensed by user count per service:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-gray-600">
              <li>Calculated per individual SaaS service</li>
              <li>Supports Office 365, Salesforce, and more</li>
              <li>Requires SaaS Monitoring subscription</li>
            </ul>
            <a 
              href="https://www.logicmonitor.com/support/usage-data-for-saas-monitoring" 
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View SaaS Documentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <SiKubernetes className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-semibold">Kubernetes Monitoring</h3>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Licensed by pod count:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-gray-600">
              <li>Number of pods only (simplified pricing)</li>
              <li>Includes monitoring of cluster components</li>
              <li>Available as add-on across all licenses</li>
            </ul>
            <a 
              href="https://www.logicmonitor.com/support/about-logicmonitor-container-monitoring" 
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View K8s Documentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Consumption Services */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Box className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-semibold">Consumption Services</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2 text-gray-900">Logs</h4>
              <p className="text-sm text-muted-foreground">
                Licensed by data volume (GBs):
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
                <li>Monthly data volume aggregation</li>
                <li>Multiple data source support</li>
                <li>Customizable retention periods</li>
              </ul>
              <a 
                href="https://www.logicmonitor.com/support/usage-data-for-lm-logs" 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View Logs Documentation</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2 text-gray-900">Synthetics</h4>
              <p className="text-sm text-muted-foreground">
                Licensed by check volume (invocations):
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
                <li>Browser-based monitoring</li>
                <li>API endpoint testing</li>
                <li>Global testing locations</li>
              </ul>
              <a 
                href="https://www.logicmonitor.com/support/usage-reporting-for-apm-synthetics" 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View Synthetics Documentation</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2 text-gray-900">APM</h4>
              <p className="text-sm text-muted-foreground">
                Licensed by span volume:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
                <li>Distributed tracing</li>
                <li>Performance metrics</li>
                <li>Multi-language support</li>
              </ul>
              <a 
                href="https://www.logicmonitor.com/support/usage-reporting-for-apm-traces" 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View APM Traces Documentation</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2 text-gray-900">PushMetrics/OpenMetrics</h4>
              <p className="text-sm text-muted-foreground">
                Licensed by metric volume:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
                <li>Custom metrics ingestion</li>
                <li>Prometheus compatibility</li>
                <li>Flexible data formats</li>
              </ul>
              <a 
                href="https://www.logicmonitor.com/support/usage-reporting-for-apm-metrics" 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View APM Metrics Documentation</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseInfo;
