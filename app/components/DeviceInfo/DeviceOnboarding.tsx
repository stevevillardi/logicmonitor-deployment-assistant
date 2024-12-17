import React from 'react';
import { CodeSamples } from './CodeSamples';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaAws, FaSlack } from "react-icons/fa6";
import { SiMicrosoftazure, SiPowershell } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";
import { SiKubernetes } from "react-icons/si";
import { TbLicense } from "react-icons/tb";
import LicenseInfo from './LicenseInfo';

import {
    Wand2,
    Cloud,
    Terminal,
    Workflow,
    ExternalLink,
    Info,
    Code2,
    FileJson,
    Scroll,
    Server,
    Key
} from 'lucide-react';
import VideoGuide from '../VideoLibrary/VideoGuide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeviceCatalog from './DeviceCatalog';
import { Badge } from '@/components/ui/badge';

interface MethodRef {
    id: string;
    title: string;
    icon: React.ElementType;
    shortDesc: string;
}

const methodRefs: MethodRef[] = [
    {
        id: 'csv-import',
        title: 'PowerShell CSV Import',
        icon: SiPowershell,
        shortDesc: 'for bulk device onboarding'
    },
    {
        id: 'netscan',
        title: 'NetScan Import',
        icon: Scroll,
        shortDesc: 'for scheduled device onboarding'
    },
    {
        id: 'wizard',
        title: 'Wizard',
        icon: Wand2,
        shortDesc: 'for guided individual setup'
    },
    {
        id: 'cloud',
        title: 'Cloud Integration',
        icon: Cloud,
        shortDesc: 'for auto-discovery of cloud resources'
    },
    {
        id: 'containers',
        title: 'Kubernetes Integration',
        icon: SiKubernetes,
        shortDesc: 'for monitoring containerized workloads'
    },
    {
        id: 'api',
        title: 'API/Automation',
        icon: Terminal,
        shortDesc: 'for programmatic control'
    }
];

const MethodLink: React.FC<{ methodId: string; icon: React.ElementType; title: string; description: string }> = ({
    methodId,
    icon: Icon,
    title,
    description
}) => {
    const scrollToSection = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(methodId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <button
            onClick={scrollToSection}
            className="flex items-start gap-2 group hover:bg-blue-100/50 p-2 rounded-lg transition-colors w-full text-left"
        >
            <Icon className="w-4 h-4 text-blue-700 mt-1 flex-shrink-0" />
            <span className="text-sm text-blue-700">
                Use <span className="font-medium group-hover:text-blue-900 transition-colors">{title}</span> {description}
            </span>
        </button>
    );
};

const MethodsOverview: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                </div>
                <div className="space-y-3">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-blue-900">Choose Your Onboarding Method</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Select the most appropriate method based on your requirements:
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {methodRefs.map((method) => (
                            <MethodLink
                                key={method.id}
                                methodId={method.id}
                                icon={method.icon}
                                title={method.title}
                                description={method.shortDesc}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                        <p className="text-sm text-blue-700">
                            Need help choosing? Contact <a href="mailto:saleseng@logicmonitor.com" className="font-medium underline hover:text-blue-800">LogicMonitor Sales Engineering</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface OnboardingMethodProps {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    recommended?: boolean;
    children: React.ReactNode;
}

interface ResourceLinkProps {
    href: string;
    title: string;
}

const OnboardingMethod: React.FC<OnboardingMethodProps> = ({
    id,
    icon: Icon,
    title,
    description,
    recommended,
    children
}) => (
    <div id={id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
                </div>
            </div>
            {recommended && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                    Recommended
                </Badge>
            )}
        </div>
        {children}
    </div>
);

const ResourceLink: React.FC<ResourceLinkProps> = ({ href, title }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
    >
        <ExternalLink className="w-4 h-4" />
        <span className="text-sm">{title}</span>
    </a>
);

const DeviceOnboarding: React.FC = () => {
    return (
        <div className="space-y-6 overflow-y-auto">
            <Tabs defaultValue="onboarding" className="w-full">
                <TabsList className="grid grid-cols-1 sm:flex w-full h-full bg-white p-1 rounded-lg border border-gray-200 mb-6">
                    <TabsTrigger
                        value="onboarding"
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                            data-[state=active]:bg-blue-50 
                            data-[state=active]:text-blue-700 
                            data-[state=active]:border-blue-200
                            data-[state=active]:shadow-sm
                            hover:bg-gray-50 
                            text-gray-600
                            font-medium
                            transition-all
                            border border-transparent
                            mb-2 sm:mb-0 sm:mr-2"
                    >
                        <Server className="w-4 h-4" />
                        Onboarding Methods
                    </TabsTrigger>
                    <TabsTrigger
                        value="credentials"
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                            data-[state=active]:bg-blue-50 
                            data-[state=active]:text-blue-700 
                            data-[state=active]:border-blue-200
                            data-[state=active]:shadow-sm
                            hover:bg-gray-50 
                            text-gray-600
                            font-medium
                            transition-all
                            border border-transparent"
                    >
                        <Key className="w-4 h-4" />
                        Common Credential Requirements
                    </TabsTrigger>
                    <TabsTrigger
                        value="licenses"
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-md 
                            data-[state=active]:bg-blue-50 
                            data-[state=active]:text-blue-700 
                            data-[state=active]:border-blue-200
                            data-[state=active]:shadow-sm
                            hover:bg-gray-50 
                            text-gray-600
                            font-medium
                            transition-all
                            border border-transparent"
                    >
                        <TbLicense className="w-4 h-4" />
                        License Information
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="onboarding">
                    <Card>
                        <CardHeader className="border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <Server className="w-6 h-6 text-blue-700" />
                                <CardTitle>Onboarding Methods</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <MethodsOverview />

                                <div className="space-y-6">
                                    <OnboardingMethod
                                        id="csv-import"
                                        icon={SiPowershell}
                                        title="PowerShell Module - CSV Import"
                                        description="Bulk import devices using a CSV file with predefined properties and resource configurations."
                                        recommended
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Best For</h4>
                                                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                    <li>• Initial bulk device imports</li>
                                                    <li>• Migration from other monitoring platforms</li>
                                                    <li>• Structured device onboarding with consistent properties</li>
                                                </ul>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Key Features</h4>
                                                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                    <li>• Property templating</li>
                                                    <li>• Resource mapping</li>
                                                    <li>• Resource Group creation</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900">Resources</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://docs.google.com/document/d/1I1flixdli-MXWL13_0riU4FZIdmfVXG7Im6Q6uesPRA/edit?usp=sharing"
                                                        title="PowerShell CSV Import Preparation Guide"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://github.com/logicmonitor/lm-powershell-module"
                                                        title="PowerShell Module Github"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://github.com/stevevillardi/Logic.Monitor.SE"
                                                        title="PowerShell (SE) Module Github"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <VideoGuide
                                            title="PowerShell CSV Import Walkthrough"
                                            description="Learn how to prepare and import a CSV file, including property mapping and validation steps."
                                            videoId="mMGadMsu1Qo"
                                            duration="12:11"
                                        />
                                    </OnboardingMethod>
                                    <OnboardingMethod
                                        id="netscan"
                                        icon={Scroll}
                                        title="NetScan Import"
                                        description="Bulk import devices using a CSV file, IP address range, or custom script on a schedule or on-demand."
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Best For</h4>
                                                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                    <li>• Onboarding specific devices using vendor APIs or custom scripts</li>
                                                    <li>• Migration from other monitoring platforms</li>
                                                </ul>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Key Features</h4>
                                                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                    <li>• Regularly scheduled imports</li>
                                                    <li>• Custom script execution</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900">Resources</h4>
                                            <div className="space-y-1">
                                                <ResourceLink
                                                    href="https://www.logicmonitor.com/support/creating-netscans"
                                                    title="NetScan Documentation"
                                                />
                                                <ResourceLink
                                                    href="https://www.logicmonitor.com/support/enhanced-script-netscan"
                                                    title="Enhanced Scripted NetScan"
                                                />
                                            </div>
                                        </div>
                                    </OnboardingMethod>


                                    <OnboardingMethod
                                        id="wizard"
                                        icon={Wand2}
                                        title="Onboarding Wizard"
                                        description="Interactive guided workflow for adding individual or small groups of devices."
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Best For</h4>
                                                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                    <li>• Adding individual devices</li>
                                                    <li>• Learning device configuration options</li>
                                                    <li>• Testing new device types</li>
                                                </ul>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Key Features</h4>
                                                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                    <li>• Step-by-step guidance</li>
                                                    <li>• Interactive property configuration</li>
                                                    <li>• Immediate validation</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900">Resources</h4>
                                            <div className="space-y-1">
                                                <ResourceLink
                                                    href="https://www.logicmonitor.com/support/devices/adding-managing-devices/how-do-i-add-devices"
                                                    title="Onboarding Wizard Guide"
                                                />
                                                <ResourceLink
                                                    href="https://www.logicmonitor.com/support/getting-started/advanced-logicmonitor-setup/defining-authentication-credentials"
                                                    title="Defining Authentication Credentials"
                                                />
                                            </div>
                                        </div>
                                    </OnboardingMethod>

                                    <OnboardingMethod
                                        id="cloud"
                                        icon={Cloud}
                                        title="Cloud & SaaS Integration"
                                        description="Automated discovery and monitoring of cloud resources and SaaS applications."
                                        recommended
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                                                    <FaAws className="w-4 h-4" />
                                                    <span>AWS</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/aws-monitoring-setup"
                                                        title="AWS Integration Guide"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                                                    <SiMicrosoftazure className="w-4 h-4" />
                                                    <span>Azure</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/lm-cloud/getting-started-lm-cloud/adding-microsoft-azure-cloud-monitoring"
                                                        title="Azure Integration Guide"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                                                    <FaGoogle className="w-4 h-4" />
                                                    <span>GCP</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/lm-cloud/getting-started-lm-cloud/adding-your-gcp-environment-into-logicmonitor"
                                                        title="GCP Integration Guide"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                                                    <FaSlack className="w-4 h-4" />
                                                    <span>SaaS</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/saas/saas-lite-monitoring"
                                                        title="SaaS Lite Monitoring Guide"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 gap-4">
                                            <h4 className="font-medium text-gray-900">Resources</h4>
                                            <div className="space-y-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/monitoring/applications-databases/microsoft-office-365-monitoring"
                                                        title="Office365 Monitoring"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/monitoring/applications-databases/salesforce-monitoring"
                                                        title="Salesforce Monitoring"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/monitoring/applications-databases/zoom-monitoring"
                                                        title="Zoom Monitoring"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/webex-monitoring"
                                                        title="Webex Monitoring"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/slack-monitoring"
                                                        title="Slack Monitoring"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </OnboardingMethod>

                                    <OnboardingMethod
                                        id="containers"
                                        icon={SiKubernetes}
                                        title="Kubernetes & OpenShift Monitoring"
                                        description="Automated discovery and monitoring of containerized workloads."
                                        recommended
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Key Features</h4>
                                                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                    <li>• Onboarding K8s & OpenShift clusters</li>
                                                    <li>• Full lifecycle management of K8s & OpenShift clusters</li>
                                                    <li>• Automated discovery of workloads and nodes</li>
                                                    <li>• Integration with existing LogicMonitor LogicModules</li>
                                                </ul>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Collector Sizing</h4>
                                                <div className="space-y-2">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/resource-sizing-for-performance-optimization-and-tuning-recommendations"
                                                        title="Resource Sizing Recommendations"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Installation Methods</h4>
                                                <div className="space-y-2">
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/adding-kubernetes-cluster-using-logicmonitor-web-portal"
                                                        title="Installing LM Container using Web Portal"
                                                    />
                                                    <ResourceLink
                                                        href="https://www.logicmonitor.com/support/installing-lm-container-chart-using-cli"
                                                        title="Installing LM Container using CLI"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </OnboardingMethod>

                                    <OnboardingMethod
                                        id="api"
                                        icon={Terminal}
                                        title="API & Automation"
                                        description="Programmatic device management using REST API and automation tools."
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">SDKs & Modules</h4>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <ResourceLink
                                                            href="https://www.logicmonitor.com/support/logicmonitor-v3-sdk"
                                                            title="LogicMonitor v3 Python & Go SDKs"
                                                        />
                                                        <ResourceLink
                                                            href="https://github.com/logicmonitor/lm-powershell-module"
                                                            title="PowerShell Module"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <FileJson className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">Automation Integrations</h4>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <ResourceLink
                                                            href="https://www.logicmonitor.com/support/terraform-integration"
                                                            title="Terraform Integration"
                                                        />
                                                        <ResourceLink
                                                            href="https://www.logicmonitor.com/support/ansible-integration"
                                                            title="Ansible Integration"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Workflow className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Automation Examples (Adding Devices)</h4>
                                            </div>
                                            <CodeSamples />
                                        </div>
                                    </OnboardingMethod>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="credentials">
                    <Card>
                        <CardHeader className="border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <Key className="w-6 h-6 text-blue-700" />
                                <CardTitle>Common Credential Requirements</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <DeviceCatalog />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="licenses">
                <Card>
                        <CardHeader className="border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <TbLicense className="w-6 h-6 text-blue-700" />
                                <CardTitle>License Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <LicenseInfo />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};


export default DeviceOnboarding;