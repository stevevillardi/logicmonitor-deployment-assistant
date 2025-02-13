import React, { useState } from 'react';
import { Info, GitBranch, History, Server, Network, Cloud, Box, Layout, Code, Play, ArrowRight, Bot, ChevronDown, ChevronUp, LogIn, Save, Database, Users, Shield, Paintbrush, LibraryBig, Target } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Version information
const VERSIONS = [
    {
        version: "1.1.0",
        date: "2024-01-12",
        sections: [
            {
                title: "POV Management Suite (Beta)",
                icon: <Target className="w-4 h-4 text-blue-600" />,
                items: [
                    "New POV management interface for tracking customer proof of value engagements",
                    "Decision criteria management with activity tracking",
                    "Customer challenges tracking and resolution workflow",
                    "Working sessions scheduling and activity management",
                    "Team collaboration features with role-based access",
                    "Device scope tracking with status management",
                    "Timeline view of all POV activities",
                    "Document management system for POV artifacts",
                    "Comments and discussion threads for team collaboration"
                ]
            },
            {
                title: "Content Library Enhancements",
                icon: <LibraryBig className="w-4 h-4 text-blue-600" />,
                items: [
                    "Expanded decision criteria library with categorization",
                    "Enhanced challenges library with business impact tracking",
                    "Improved content search and filtering capabilities",
                    "Category-based organization for better content discovery",
                    "Template system for quick POV setup"
                ]
            },
            {
                title: "Platform Architecture Updates",
                icon: <Layout className="w-4 h-4 text-blue-600" />,
                items: [
                    "Redesigned platform architecture with POV management integration",
                    "Enhanced data models for POV tracking",
                    "Improved state management for complex workflows",
                    "Real-time updates for collaborative features",
                    "Optimized database queries for better performance"
                ]
            },
            {
                title: "Security & Access Control",
                icon: <Shield className="w-4 h-4 text-blue-600" />,
                items: [
                    "Enhanced RBAC system with POV-specific permissions",
                    "Team-based access controls for POV content",
                    "Secure document storage and sharing",
                    "Audit logging for POV activities",
                    "Improved authentication workflows"
                ]
            },
            {
                title: "UI/UX Improvements",
                icon: <Paintbrush className="w-4 h-4 text-blue-600" />,
                items: [
                    "New dashboard for POV overview and progress tracking",
                    "Interactive timeline visualization",
                    "Enhanced mobile responsiveness across all features",
                    "Improved dark mode support",
                    "Consistent styling and component design",
                    "Better navigation between POV sections"
                ]
            }
        ]
    },
    {
        version: "1.0.6",
        date: "2024-01-06",
        sections: [
            {
                title: "Platform Architecture Improvements",
                icon: <Layout className="w-4 h-4 text-blue-600" />,
                items: [
                    "Redesigned platform architecture diagram with interactive components",
                    "Added detailed feature descriptions for each platform component",
                    "Improved visual flow indicators between platform layers",
                    "Enhanced dark mode support for architecture diagram",
                    "Added responsive design for mobile devices"
                ]
            },
            {
                title: "POV Content Library",
                icon: <LibraryBig className="w-4 h-4 text-blue-600" />,
                items: [
                    "New POV Content Library for accessing curated content",
                    "Decision Criteria Explorer for documenting customer requirements",
                    "Challenges Explorer for addressing common customer concerns",
                    "Real-time search and filtering capabilities",
                    "Category-based content organization"
                ]
            },
            {
                title: "Security & Access Control",
                icon: <Shield className="w-4 h-4 text-blue-600" />,
                items: [
                    "Manage user permissions for secure access to POV content",
                    "Create user roles with specific permissions",
                ]
            },
            {
                title: "UI/UX Enhancements",
                icon: <Paintbrush className="w-4 h-4 text-blue-600" />,
                items: [
                    "New tabbed interface for content exploration",
                    "Improved content cards with better readability",
                    "Full support for dark mode",
                    "Consistent styling across new components",
                    "Better mobile responsiveness for content library"
                ]
            }
        ]
    },
    {
        version: "1.0.5",
        date: "2024-12-31",
        sections: [
            {
                title: "Community Dashboard Features",
                icon: <Users className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added ability for users to upload and share dashboards",
                    "New dashboard management interface for uploaded dashboards",
                    "Display name support for better dashboard readability",
                    "Category organization for community dashboards"
                ]
            },
            {
                title: "Security & Access Control",
                icon: <Shield className="w-4 h-4 text-blue-600" />,
                items: [
                    "Initial RBAC implementation for permission handling",
                    "Domain-based authorization for protected features",
                    "Secure dashboard management for contributors"
                ]
            },
            {
                title: "UI Improvements",
                icon: <Paintbrush className="w-4 h-4 text-blue-600" />,
                items: [
                    "Enhanced empty state visualizations",
                    "Improved dashboard preview and management interfaces",
                    "Consistent styling across management dialogs"
                ]
            }
        ]
    },
    {
        version: "1.0.4",
        date: "2024-12-30",
        sections: [
            {
                title: "Deployment Management",
                icon: <Save className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added ability to save deployment configurations to your account",
                    "Cloud storage of deployment configurations with automatic device ordering",
                    "Load previously saved deployments with preserved settings",
                    "Manage saved deployments through user profile",
                    "Rename and delete saved configurations"
                ]
            },
            {
                title: "Platform Enhancements",
                icon: <Layout className="w-4 h-4 text-blue-600" />,
                items: [
                    "New modern landing page showcasing platform capabilities",
                    "Improved navigation and user experience",
                    "Added API-based reports section",
                    "Enhanced mobile responsiveness",
                    "Streamlined authentication flow"
                ]
            },
            {
                title: "Data Management",
                icon: <Database className="w-4 h-4 text-blue-600" />,
                items: [
                    "Automatic device type ordering preservation",
                    "Consistent configuration state management",
                    "Overwrite protection for existing deployments",
                    "Secure per-user deployment storage",
                    "Cross-device access to saved configurations"
                ]
            }
        ]
    },
    {
        version: "1.0.3",
        date: "2024-12-28",
        sections: [
            {
                title: "Improved Login Experience",
                icon: <LogIn className="w-4 h-4 text-blue-600" />,
                items: [
                    "Removed the previous basic auth login page",
                    "Added Google and GitHub OAuth login support",
                    "Added initial user profile page"
                ]
            },
            {
                title: "Enhanced AI Chat Experience",
                icon: <Bot className="w-4 h-4 text-blue-600" />,
                items: [
                    "Improved response quality with enhanced RAG models for more accurate and contextual answers",
                    "Rich markdown formatting with syntax highlighting for code snippets",
                    "Expanded knowledge base with support for multiple data types and sources",
                    "Real-time source attribution for transparent and verifiable responses",
                    "Improved code block styling for better readability"
                ]
            },
            {
                title: "Dashboard Explorer",
                icon: <Layout className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added new Dashboard Explorer feature for browsing and importing dashboards",
                    "Support for filtering and organizing dashboards by category",
                    "Preview functionality for dashboard widgets",
                    "Cart style import system for selecting multiple dashboards",
                    "Automatic sync with core LogicMonitor GitHub repository every 6 hours"
                ]
            },
            {
                title: "API/Portal Improvements",
                icon: <Code className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added dynamic repository branch detection",
                    "New routes for dashboard syncing and fetching",
                    "Enhanced error handling for GitHub API requests",
                    "Supabase integration for dashboard storage",
                    "Portal authentication details unified accross Reports, API Explorer, and Dashboard Explorer"
                ]
            }
        ]
    },
    {
        version: "1.0.2",
        date: "2024-12-24",
        sections: [
            {
                title: "AI Documentation Assistant (beta)",
                icon: <Bot className="w-4 h-4 text-blue-600" />,
                items: [
                    "Context-aware documentation search",
                    "Source-linked responses",
                    "Persistent conversation history",
                    "Resizable chat interface",
                    "Minimizable window accessible from any page"
                ]
            },
            {
                title: "EnvisionPlatform Tour",
                icon: <Play className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added interactive platform architecture diagram",
                    "Detailed component descriptions and features",
                    "Category-based component organization (Core, Integration, Collection, Automation)",
                    "Direct links to product documentation",
                    "Fullscreen mode for better visibility"
                ]
            },
            {
                title: "Collector Sizing Enhancements",
                icon: <Server className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added collector sizing method selection with auto and manual modes, with manual mode you can set the collector size used for load calculations based on a specified collector size",
                    "Added special vCenter sizing logic based on VM count",
                    "Automatic size adjustment for environments with >2000 VMs per vCenter (beta)",
                    "Smart distribution calculations for multi-vCenter environments"
                ]
            },
            {
                title: "Protocol Support",
                icon: <Network className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added protocol selection for Windows (WMI/WinRM) and Linux (SSH/SNMP)",
                    "Enhanced protocol-specific load calculations"
                ]
            },
            {
                title: "Monitoring Capacity",
                icon: <History className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added NetFlow ingestion (FPS) support for device level calculations",
                    "Added Log ingestion (EPS) for device level calculations",
                    "Implemented SNMP trap load calculations",
                    "Added FPS as configurable collector capacity metric under collector settings"
                ]
            },
            {
                title: "Cloud Provider Integration",
                icon: <Cloud className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added recommended instance sizes for AWS, Azure, and GCP",
                    "Instance recommendations based on collector sizing",
                    "Added fixed performance instance recommendations"
                ]
            },
            {
                title: "Container Support",
                icon: <Box className="w-4 h-4 text-blue-600" />,
                items: [
                    "Added container support information",
                    "Included container-specific resource limitations",
                    "Added container installation documentation"
                ]
            },
            {
                title: "UI Improvements",
                icon: <Layout className="w-4 h-4 text-blue-600" />,
                items: [
                    "Redesigned deployment configuration interface",
                    "Split collector types into separate categories for polling, log ingestion, and netflow",
                    "Enhanced PDF report generation with improved formatting and layout",
                    "Improved resource utilization displays for mobile devices"
                ]
            },
            {
                title: "Technical Improvements",
                icon: <Code className="w-4 h-4 text-blue-600" />,
                items: [
                    "Enhanced collector calculation algorithms",
                    "Improved load distribution logic",
                    "Added null checks and error handling",
                    "Optimized performance for large-scale deployments"
                ]
            }
        ]
    },
    {
        version: "1.0.1",
        date: "2024-12-15",
        sections: [
            {
                title: "Deployment Assistant Core",
                icon: <Layout className="w-4 h-4 text-blue-600" />,
                items: [
                    "Initial release of the LogicMonitor Deployment Assistant",
                    "Interactive deployment configuration interface",
                    "Automated collector sizing calculations",
                    "Resource requirement estimations",
                    "Multi-site deployment support"
                ]
            },
            {
                title: "Collector Configuration",
                icon: <Server className="w-4 h-4 text-blue-600" />,
                items: [
                    "Basic collector sizing calculations",
                    "Support for multiple collector deployment scenarios",
                    "Device and instance count based sizing",
                    "Automatic collector distribution recommendations",
                    "Basic protocol load calculations (SNMP, WMI, etc.)"
                ]
            },
            {
                title: "Monitoring Scope",
                icon: <Network className="w-4 h-4 text-blue-600" />,
                items: [
                    "Device count based calculations",
                    "Instance count estimations",
                    "Basic monitoring protocol support",
                    "Resource metrics collection configuration",
                    "Performance metric calculations"
                ]
            },
            {
                title: "Cloud Integration",
                icon: <Cloud className="w-4 h-4 text-blue-600" />,
                items: [
                    "Basic cloud provider support (AWS, Azure, GCP)",
                    "Cloud instance size recommendations",
                    "Resource allocation guidelines",
                    "Cloud deployment considerations"
                ]
            },
            {
                title: "Reports & Documentation",
                icon: <Code className="w-4 h-4 text-blue-600" />,
                items: [
                    "Basic deployment reports generation",
                    "Resource requirement documentation",
                    "Configuration recommendations",
                    "Best practices documentation",
                    "Deployment architecture diagrams"
                ]
            },
            {
                title: "User Interface",
                icon: <Layout className="w-4 h-4 text-blue-600" />,
                items: [
                    "Clean, intuitive web interface",
                    "Step-by-step configuration workflow",
                    "Interactive form controls",
                    "Real-time calculation updates",
                    "Mobile-responsive design"
                ]
            }
        ]
    }
];

export const VersionInfo = () => {
    const [expandedVersions, setExpandedVersions] = useState<string[]>(["1.1.0"]);

    const toggleVersion = (version: string) => {
        setExpandedVersions(prev => 
            prev.includes(version) 
                ? prev.filter(v => v !== version)
                : [...prev, version]
        );
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-sm text-blue-700 hover:text-gray-900 dark:text-blue-400"
                >
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 dark:text-blue-400" />
                    <span className="hidden 2xl:inline">Release Notes</span>
                </Button>
            </DialogTrigger>
            <DialogContent 
                className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0 border-blue-200 dark:border-gray-700"
                aria-describedby={undefined}
            >
                <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                        <div className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Release Notes
                        </div>
                    </DialogTitle>
                    <DialogDescription id="version-info-description" className="text-blue-700 dark:text-blue-300">
                        View the latest updates and changes to the Deployment Assistant
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[600px] pr-4 overflow-y-auto">
                    <div className="space-y-6 py-3 pr-4">
                        {VERSIONS.map((versionInfo) => (
                            <div key={versionInfo.version} className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm p-4">
                                <button
                                    onClick={() => toggleVersion(versionInfo.version)}
                                    className="w-full flex items-center justify-between mb-2 text-left"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Version {versionInfo.version}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Released on {versionInfo.date}
                                        </p>
                                    </div>
                                    {expandedVersions.includes(versionInfo.version) 
                                        ? <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        : <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    }
                                </button>

                                {expandedVersions.includes(versionInfo.version) && (
                                    <div className="space-y-4 mt-4">
                                        {versionInfo.sections?.map((section, index) => (
                                            <div key={index} className="bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 p-3">
                                                <div className="flex items-start gap-2 mb-2">
                                                    {section.icon}
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {section.title}
                                                    </h3>
                                                </div>
                                                <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 ml-6">
                                                    {section.items.map((item, itemIndex) => (
                                                        <li key={itemIndex} className="list-disc">
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="border-t border-blue-100 dark:border-gray-700 pt-3 mt-4">
                    <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                For feature requests and bug reports, please visit the github repository and create an issue.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 