import React from 'react';
import {CodeSamples } from './CodeSamples';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FileSpreadsheet,
    Wand2,
    Cloud,
    Terminal,
    Puzzle,
    Workflow,
    ExternalLink,
    Info,
    PlayCircle,
    Code2,
    FileJson,
    Bot,
    Scroll
} from 'lucide-react';
import VideoGuide from './VideoGuide';

interface MethodRef {
    id: string;
    title: string;
    icon: React.ElementType;
    shortDesc: string;
}

const methodRefs: MethodRef[] = [
    {
        id: 'csv-import',
        title: 'CSV Import',
        icon: FileSpreadsheet,
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
        shortDesc: 'for auto-discovery'
    },
    {
        id: 'api',
        title: 'API/Automation',
        icon: Terminal,
        shortDesc: 'for programmatic control'
    }
];

const MethodLink: React.FC<{ method: MethodRef }> = ({ method }) => {
    const handleClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            // Add a highlight effect
            element.classList.add('highlight-section');
            setTimeout(() => {
                element.classList.remove('highlight-section');
            }, 2000);
        }
    };

    return (
        <button
            onClick={(e) => handleClick(e, method.id)}
            className="flex items-start gap-2 group hover:bg-blue-100/50 p-2 rounded-lg transition-colors"
        >
            <method.icon className="w-4 h-4 text-blue-700 mt-1" />
            <span className="text-sm text-blue-700">
                Use <span className="font-medium group-hover:text-blue-900 transition-colors">{method.title}</span> {method.shortDesc}
            </span>
        </button>
    );
};

const MethodsOverview: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                        <Info className="w-5 h-5 text-blue-700" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">Choose Your Onboarding Method</h3>
                        <p className="text-blue-700 mt-1">
                            Select the most appropriate method based on your requirements:
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {methodRefs.map((method) => (
                            <MethodLink key={method.id} method={method} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                        <p className="text-sm text-blue-700">
                            Need help choosing? Contact <a href="#" className="font-medium underline hover:text-blue-800">LogicMonitor Support</a>
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
            </div>
            {recommended && (
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                    Recommended
                </div>
            )}
        </div>
        <div className="space-y-4">
            {children}
        </div>
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
        <div className="space-y-6">
            <Card className="border-gray-200">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <Bot className="w-6 h-6 text-blue-700" />
                        <CardTitle className="text-gray-900">Device Onboarding Methods</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-6 mb-6">
    <div className="flex gap-4">
        <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-700" />
            </div>
        </div>
        <div className="space-y-3">
            <div>
                <h3 className="text-lg font-semibold text-blue-900">Choose Your Onboarding Method</h3>
                <p className="text-blue-700 mt-1">
                    Select the most appropriate method based on your requirements:
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700 mt-1" />
                    <span className="text-sm text-blue-700">
                        Use <span className="font-medium">CSV Import</span> for bulk device onboarding
                    </span>
                </div>
                <div className="flex items-start gap-2">
                    <Scroll className="w-4 h-4 text-blue-700 mt-1" />
                    <span className="text-sm text-blue-700">
                        Use <span className="font-medium">NetScan Import</span> for scheduled device onboarding
                    </span>
                </div>
                <div className="flex items-start gap-2">
                    <Wand2 className="w-4 h-4 text-blue-700 mt-1" />
                    <span className="text-sm text-blue-700">
                        Use <span className="font-medium">Wizard</span> for guided individual setup
                    </span>
                </div>
                <div className="flex items-start gap-2">
                    <Cloud className="w-4 h-4 text-blue-700 mt-1" />
                    <span className="text-sm text-blue-700">
                        Use <span className="font-medium">Cloud Integration</span> for auto-discovery
                    </span>
                </div>
                <div className="flex items-start gap-2">
                    <Terminal className="w-4 h-4 text-blue-700 mt-1" />
                    <span className="text-sm text-blue-700">
                        Use <span className="font-medium">API/Automation</span> for programmatic control
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <p className="text-sm text-blue-700">
                    Need help choosing? Contact <a href="#" className="font-medium underline hover:text-blue-800">LogicMonitor Support</a>
                </p>
            </div>
        </div>
    </div>
</div>
                        <OnboardingMethod
                            id="csv-import"
                            icon={FileSpreadsheet}
                            title="PowerShell Module - CSV Import"
                            description="Bulk import devices using a CSV file with predefined properties and resource configurations."
                            recommended
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Best For</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Initial bulk device imports</li>
                                        <li>• Migration from other monitoring platforms</li>
                                        <li>• Structured device onboarding with consistent properties</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Property templating</li>
                                        <li>• Resource mapping</li>
                                        <li>• Resource Group creation</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Resources</h4>
                                <div className="space-y-1">
                                    <ResourceLink 
                                        href="https://docs.google.com/document/d/1I1flixdli-MXWL13_0riU4FZIdmfVXG7Im6Q6uesPRA/edit?usp=sharing" 
                                        title="PowerShell CSV Import Preparation Guide" 
                                    />
                                    <ResourceLink 
                                        href="https://github.com/logicmonitor/lm-powershell-module" 
                                        title="PowerShell Module Github" 
                                    />
                                </div>
                            </div>
                            <VideoGuide 
                                title="PowerShell CSV Import Walkthrough"
                                description="Learn how to prepare and import a CSV file, including property mapping and validation steps."
                                videoId="mMGadMsu1Qo"
                            />
                        </OnboardingMethod>
                        <OnboardingMethod
                            id="netscan"
                            icon={Scroll}
                            title="NetScan Import"
                            description="Bulk import devices using a CSV file, IP address range, or custom script on a schedule or on-demand."
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Best For</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Onboarding specific devices using vendor APIs or custom scripts</li>
                                        <li>• Migration from other monitoring platforms</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Best For</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Adding individual devices</li>
                                        <li>• Learning device configuration options</li>
                                        <li>• Testing new device types</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
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
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">AWS</h4>
                                    <div className="space-y-2">
                                        <ResourceLink 
                                            href="https://www.logicmonitor.com/support/aws-monitoring-setup" 
                                            title="AWS Integration Guide" 
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">Azure</h4>
                                    <div className="space-y-2">
                                        <ResourceLink 
                                            href="https://www.logicmonitor.com/support/lm-cloud/getting-started-lm-cloud/adding-microsoft-azure-cloud-monitoring" 
                                            title="Azure Integration Guide" 
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">GCP</h4>
                                    <div className="space-y-2">
                                        <ResourceLink 
                                            href="https://www.logicmonitor.com/support/lm-cloud/getting-started-lm-cloud/adding-your-gcp-environment-into-logicmonitor" 
                                            title="GCP Integration Guide" 
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
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="w-5 h-5 text-blue-700" />
                                            <h4 className="font-medium text-gray-900">SDKs & Modules</h4>
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
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <FileJson className="w-5 h-5 text-blue-700" />
                                            <h4 className="font-medium text-gray-900">Automation Integrations</h4>
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
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Workflow className="w-5 h-5 text-blue-700" />
                                        <h4 className="font-medium text-gray-900">Automation Examples</h4>
                                    </div>
                                    <CodeSamples />
                                </div>
                            </div>
                        </OnboardingMethod>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeviceOnboarding;