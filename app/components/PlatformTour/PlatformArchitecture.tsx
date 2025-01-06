import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { 
    Server, 
    Activity,
    Database,
    Cloud,
    Search,
    Zap,
    Brain,
    Network,
    BarChart,
    GitBranch,
    Settings,
    Layers,
    Info
} from 'lucide-react';

// Reuse the TourStep and categoryStyles from PlatformTour
interface TourStep {
    id: string;
    title: string;
    description: string;
    details?: {
        keyPoints?: string[];
        features?: string[];
        note?: {
            text: string;
            link?: {
                url: string;
                text: string;
            };
        };
    };
    category: 'core' | 'integration' | 'collection' | 'automation';
    icon: React.ElementType;
}

const PLATFORM_SECTIONS = {
    integrations: {
        id: 'integrations',
        title: 'API & Integrations',
        icon: GitBranch,
        description: 'Extend LogicMonitor capabilities by integrating with your existing tools and workflows.',
        category: 'integration',
        details: {
            keyPoints: [
                'RESTful API for automation and integration',
                'Webhook support for real-time notifications',
                'Pre-built integrations with popular platforms',
                'Custom HTTP/API integration capabilities'
            ],
            features: [
                'ServiceNow integration',
                'Slack and Microsoft Teams notifications',
                'Terraform provider',
                'REST API explorer',
                'Custom webhook support'
            ],
            note: {
                text: 'LogicMonitor provides comprehensive API documentation and integration guides to help you extend and customize your monitoring solution.',
                link: {
                    url: 'https://www.logicmonitor.com/support/rest-api-developers-guide',
                    text: 'View API Documentation'
                }
            }
        }
    },
    monitoring: [
        {
            id: 'infrastructure',
            title: 'Infrastructure Monitoring',
            icon: Server,
            description: 'Comprehensive infrastructure monitoring across your entire technology stack.',
            category: 'core',
            details: {
                keyPoints: [
                    'Agentless monitoring for network devices',
                    'Automated discovery and configuration',
                    'Real-time performance metrics',
                    'Customizable monitoring templates'
                ],
                features: [
                    'Network performance monitoring',
                    'Server monitoring',
                    'Storage monitoring',
                    'Virtualization monitoring',
                    'Cloud infrastructure monitoring'
                ],
                note: {
                    text: 'Monitor your entire infrastructure with a single platform, from traditional on-premises systems to modern cloud services.',
                    link: {
                        url: 'https://www.logicmonitor.com/infrastructure-monitoring',
                        text: 'Learn more about Infrastructure Monitoring'
                    }
                }
            }
        },
        {
            id: 'cloud',
            title: 'Cloud Monitoring',
            icon: Cloud,
            description: 'Monitor cloud resources and services across multiple providers.',
            category: 'integration',
            details: {
                keyPoints: [
                    'Multi-cloud monitoring support',
                    'Automated resource discovery',
                    'Cost optimization insights',
                    'Cloud service health monitoring'
                ],
                features: [
                    'AWS monitoring',
                    'Azure monitoring',
                    'Google Cloud monitoring',
                    'Kubernetes monitoring',
                    'Cloud cost analysis'
                ],
                note: {
                    text: 'Get complete visibility into your cloud infrastructure with automated discovery and monitoring of cloud resources.',
                    link: {
                        url: 'https://www.logicmonitor.com/cloud-monitoring',
                        text: 'Explore Cloud Monitoring'
                    }
                }
            }
        },
        {
            id: 'application',
            title: 'Application Visibility',
            icon: Search,
            description: 'End-to-end visibility into application performance and dependencies.',
            category: 'core',
            details: {
                keyPoints: [
                    'Full-stack application monitoring',
                    'Service dependency mapping',
                    'Transaction tracing',
                    'Application performance metrics'
                ],
                features: [
                    'Application topology mapping',
                    'Code-level performance insights',
                    'User experience monitoring',
                    'Service level objective tracking',
                    'Application dependency analysis'
                ],
                note: {
                    text: 'Get complete visibility into your application stack with automated service discovery and performance monitoring.',
                    link: {
                        url: 'https://www.logicmonitor.com/application-monitoring',
                        text: 'Learn about Application Monitoring'
                    }
                }
            }
        },
        {
            id: 'alerts',
            title: 'Alert & Event Intelligence',
            icon: Activity,
            description: 'Smart alerting and event correlation powered by Edwin AI.',
            category: 'automation',
            details: {
                keyPoints: [
                    'AI-powered alert correlation',
                    'Automated incident routing',
                    'Dynamic alert thresholds',
                    'Root cause analysis'
                ],
                features: [
                    'Alert noise reduction',
                    'Intelligent alert grouping',
                    'Automated escalation workflows',
                    'Alert dependency mapping',
                    'Historical trend analysis'
                ],
                note: {
                    text: 'Reduce alert fatigue and respond faster to incidents with AI-powered alert intelligence and automation.',
                    link: {
                        url: 'https://www.logicmonitor.com/alert-intelligence',
                        text: 'Explore Alert Intelligence'
                    }
                }
            }
        }
    ],
    experience: [
        {
            id: 'service-insights',
            title: 'Service Insights',
            icon: Brain,
            description: 'Understand service health, dependencies, and performance at a glance.',
            category: 'core',
            details: {
                keyPoints: [
                    'Service-level health monitoring',
                    'Automated dependency mapping',
                    'Performance trend analysis',
                    'Service impact assessment'
                ],
                features: [
                    'Service topology visualization',
                    'SLA/SLO tracking',
                    'Cross-service correlation',
                    'Business service mapping',
                    'Dependency-aware alerting'
                ],
                note: {
                    text: 'Get a comprehensive view of your services with automated discovery and intelligent insights.',
                    link: {
                        url: 'https://www.logicmonitor.com/service-monitoring',
                        text: 'Learn about Service Insights'
                    }
                }
            }
        },
        {
            id: 'resource-explorer',
            title: 'Resource Explorer',
            icon: Search,
            description: 'Powerful search and exploration of all monitored resources.',
            category: 'core',
            details: {
                keyPoints: [
                    'Advanced resource search',
                    'Dynamic filtering capabilities',
                    'Resource relationship mapping',
                    'Real-time resource metrics'
                ],
                features: [
                    'Resource inventory management',
                    'Custom resource views',
                    'Resource group management',
                    'Resource health tracking',
                    'Resource configuration analysis'
                ],
                note: {
                    text: 'Quickly find and analyze any resource in your environment with powerful search and filtering capabilities.',
                    link: {
                        url: 'https://www.logicmonitor.com/resource-management',
                        text: 'Explore Resource Management'
                    }
                }
            }
        },
        {
            id: 'platform-analytics',
            title: 'Platform Analytics',
            icon: BarChart,
            description: 'Advanced analytics and reporting across your entire platform.',
            category: 'core',
            details: {
                keyPoints: [
                    'Custom report generation',
                    'Performance trend analysis',
                    'Capacity planning insights',
                    'Resource utilization tracking'
                ],
                features: [
                    'Custom dashboards',
                    'Automated reporting',
                    'Data visualization tools',
                    'Historical data analysis',
                    'Forecast modeling'
                ],
                note: {
                    text: 'Make data-driven decisions with comprehensive analytics and reporting capabilities.',
                    link: {
                        url: 'https://www.logicmonitor.com/platform-analytics',
                        text: 'Learn about Platform Analytics'
                    }
                }
            }
        },
        {
            id: 'ai-assist',
            title: 'AI Assist',
            icon: Zap,
            description: 'AI-powered assistance for faster problem resolution.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Automated root cause analysis',
                    'Intelligent troubleshooting',
                    'Predictive insights',
                    'Automated remediation suggestions'
                ],
                features: [
                    'AI-driven recommendations',
                    'Automated problem detection',
                    'Knowledge base integration',
                    'Contextual insights',
                    'Learning from past incidents'
                ],
                note: {
                    text: 'Let Edwin AI help you resolve issues faster with intelligent insights and recommendations.',
                    link: {
                        url: 'https://www.logicmonitor.com/ai-assist',
                        text: 'Discover AI Assist'
                    }
                }
            }
        }
    ],
    ai: [
        {
            id: 'anomaly',
            title: 'Anomaly Detection',
            icon: Activity,
            description: 'AI-powered anomaly detection and behavioral analysis.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Machine learning-based detection',
                    'Dynamic baseline creation',
                    'Pattern recognition',
                    'Contextual anomaly scoring'
                ],
                features: [
                    'Automated baseline learning',
                    'Multi-metric correlation',
                    'Seasonal pattern detection',
                    'False positive reduction',
                    'Real-time anomaly alerts'
                ],
                note: {
                    text: 'Detect and respond to anomalies faster with Edwin AI-powered behavioral analysis.',
                    link: {
                        url: 'https://www.logicmonitor.com/anomaly-detection',
                        text: 'Learn about Anomaly Detection'
                    }
                }
            }
        },
        {
            id: 'dynamic',
            title: 'Dynamic Thresholds',
            icon: GitBranch,
            description: 'Self-adjusting thresholds based on historical patterns.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Automatic threshold adjustment',
                    'Historical trend analysis',
                    'Seasonal awareness',
                    'Resource-specific tuning'
                ],
                features: [
                    'Time-based thresholds',
                    'Percentile-based alerts',
                    'Trend-based forecasting',
                    'Custom threshold rules',
                    'Threshold optimization'
                ],
                note: {
                    text: 'Eliminate alert noise with intelligent thresholds that automatically adapt to your environment.',
                    link: {
                        url: 'https://www.logicmonitor.com/dynamic-thresholds',
                        text: 'Explore Dynamic Thresholds'
                    }
                }
            }
        },
        {
            id: 'forecasting',
            title: 'Forecasting & Prediction',
            icon: BarChart,
            description: 'Predictive analytics for proactive management.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Resource utilization forecasting',
                    'Capacity planning insights',
                    'Trend analysis',
                    'Predictive alerting'
                ],
                features: [
                    'ML-based forecasting',
                    'Resource optimization',
                    'Predictive maintenance',
                    'Capacity planning',
                    'Budget forecasting'
                ],
                note: {
                    text: 'Make informed decisions with AI-powered forecasting and predictive analytics.',
                    link: {
                        url: 'https://www.logicmonitor.com/forecasting',
                        text: 'Discover Forecasting Capabilities'
                    }
                }
            }
        },
        {
            id: 'correlation',
            title: 'Event Correlation',
            icon: Network,
            description: 'Intelligent event correlation and root cause analysis.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Automated event grouping',
                    'Root cause identification',
                    'Impact analysis',
                    'Topology-aware correlation'
                ],
                features: [
                    'AI-driven correlation',
                    'Dependency mapping',
                    'Alert noise reduction',
                    'Impact visualization',
                    'Automated remediation'
                ],
                note: {
                    text: 'Reduce mean time to resolution with intelligent event correlation powered by Edwin AI.',
                    link: {
                        url: 'https://www.logicmonitor.com/event-correlation',
                        text: 'Learn about Event Correlation'
                    }
                }
            }
        }
    ],
    coverage: [
        {
            id: 'metrics',
            title: 'Metrics',
            icon: BarChart,
            description: 'Comprehensive collection and analysis of performance metrics.',
            category: 'collection',
            details: {
                keyPoints: [
                    'High-resolution metric collection',
                    'Custom metric support',
                    'Automated metric discovery',
                    'Flexible aggregation options'
                ],
                features: [
                    'Real-time metric streaming',
                    'Custom metric calculations',
                    'Metric data retention',
                    'Statistical analysis',
                    'Metric correlation'
                ],
                note: {
                    text: 'Collect and analyze metrics from any source with customizable retention and aggregation.',
                    link: {
                        url: 'https://www.logicmonitor.com/metrics',
                        text: 'Learn about Metrics'
                    }
                }
            }
        },
        {
            id: 'events',
            title: 'Events',
            icon: Activity,
            description: 'Centralized event collection and intelligent processing.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Real-time event processing',
                    'Event correlation',
                    'Custom event rules',
                    'Event enrichment'
                ],
                features: [
                    'Event filtering',
                    'Event aggregation',
                    'Custom event handlers',
                    'Event forwarding',
                    'Event retention policies'
                ],
                note: {
                    text: 'Collect and process events from all your systems with intelligent correlation and routing.',
                    link: {
                        url: 'https://www.logicmonitor.com/events',
                        text: 'Explore Event Management'
                    }
                }
            }
        },
        {
            id: 'logs',
            title: 'Logs',
            icon: Database,
            description: 'Centralized log aggregation and analysis.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Automated log collection',
                    'Log parsing and structuring',
                    'Pattern detection',
                    'Log retention management'
                ],
                features: [
                    'Log searching',
                    'Log analytics',
                    'Custom parsing rules',
                    'Log forwarding',
                    'Log archival'
                ],
                note: {
                    text: 'Aggregate and analyze logs from all your sources with powerful search and analytics capabilities.',
                    link: {
                        url: 'https://www.logicmonitor.com/logs',
                        text: 'Discover Log Analytics'
                    }
                }
            }
        },
        {
            id: 'traces',
            title: 'Traces',
            icon: GitBranch,
            description: 'End-to-end distributed tracing and performance analysis.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Distributed tracing',
                    'Service dependency mapping',
                    'Performance bottleneck detection',
                    'Error tracking'
                ],
                features: [
                    'Transaction tracing',
                    'Service maps',
                    'Latency analysis',
                    'Error analysis',
                    'Trace sampling'
                ],
                note: {
                    text: 'Track requests across your distributed systems with detailed performance analysis.',
                    link: {
                        url: 'https://www.logicmonitor.com/traces',
                        text: 'Learn about Tracing'
                    }
                }
            }
        },
        {
            id: 'topology',
            title: 'Topology',
            icon: Network,
            description: 'Automated infrastructure and application topology mapping.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Automated topology discovery',
                    'Relationship mapping',
                    'Dynamic updates',
                    'Impact analysis'
                ],
                features: [
                    'Network topology',
                    'Application topology',
                    'Service dependencies',
                    'Change tracking',
                    'Visual mapping'
                ],
                note: {
                    text: 'Automatically discover and visualize your entire infrastructure topology.',
                    link: {
                        url: 'https://www.logicmonitor.com/topology',
                        text: 'Explore Topology Mapping'
                    }
                }
            }
        },
        {
            id: 'config',
            title: 'Config',
            icon: Settings,
            description: 'Configuration management and change tracking.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Configuration tracking',
                    'Change detection',
                    'Compliance monitoring',
                    'Version control'
                ],
                features: [
                    'Config backup',
                    'Change history',
                    'Compliance reporting',
                    'Config comparison',
                    'Automated remediation'
                ],
                note: {
                    text: 'Track and manage configurations across your infrastructure with automated change detection.',
                    link: {
                        url: 'https://www.logicmonitor.com/configuration',
                        text: 'Learn about Config Management'
                    }
                }
            }
        }
    ],
    infrastructure: [
        {
            id: 'on-prem',
            title: 'On Prem Infrastructure',
            icon: Server,
            description: 'Comprehensive monitoring for on-premises infrastructure.',
            category: 'core',
            details: {
                keyPoints: [
                    'Agentless monitoring capabilities',
                    'Automated device discovery',
                    'Network performance monitoring',
                    'Hardware health monitoring'
                ],
                features: [
                    'Server monitoring',
                    'Network device monitoring',
                    'Storage system monitoring',
                    'Virtual infrastructure monitoring',
                    'Data center monitoring'
                ],
                note: {
                    text: 'Monitor your entire on-premises infrastructure with comprehensive visibility and automated discovery.',
                    link: {
                        url: 'https://www.logicmonitor.com/on-prem-monitoring',
                        text: 'Learn about On-Prem Monitoring'
                    }
                }
            }
        },
        {
            id: 'cloud-infra',
            title: 'Cloud Infrastructure',
            icon: Cloud,
            description: 'Multi-cloud infrastructure monitoring and optimization.',
            category: 'integration',
            details: {
                keyPoints: [
                    'Multi-cloud support',
                    'Cloud resource discovery',
                    'Cost optimization',
                    'Performance monitoring'
                ],
                features: [
                    'AWS infrastructure monitoring',
                    'Azure resource tracking',
                    'Google Cloud monitoring',
                    'Cloud cost analysis',
                    'Resource utilization tracking'
                ],
                note: {
                    text: 'Get unified visibility across all your cloud providers with automated resource discovery and monitoring.',
                    link: {
                        url: 'https://www.logicmonitor.com/cloud-infrastructure',
                        text: 'Explore Cloud Infrastructure'
                    }
                }
            }
        },
        {
            id: 'ai-infra',
            title: 'AI Infrastructure',
            icon: Brain,
            description: 'Specialized monitoring for AI and ML infrastructure.',
            category: 'automation',
            details: {
                keyPoints: [
                    'GPU utilization monitoring',
                    'ML pipeline tracking',
                    'Resource optimization',
                    'Performance analytics'
                ],
                features: [
                    'GPU metrics monitoring',
                    'ML infrastructure tracking',
                    'Resource scheduling',
                    'Workload optimization',
                    'Cost allocation'
                ],
                note: {
                    text: 'Monitor and optimize your AI infrastructure with specialized metrics and insights.',
                    link: {
                        url: 'https://www.logicmonitor.com/ai-infrastructure',
                        text: 'Discover AI Infrastructure Monitoring'
                    }
                }
            }
        },
        {
            id: 'applications',
            title: 'Applications',
            icon: Layers,
            description: 'End-to-end application infrastructure monitoring.',
            category: 'integration',
            details: {
                keyPoints: [
                    'Application stack monitoring',
                    'Container monitoring',
                    'Microservices visibility',
                    'Database performance'
                ],
                features: [
                    'Container orchestration',
                    'Microservices monitoring',
                    'Database monitoring',
                    'Application dependencies',
                    'Service mesh monitoring'
                ],
                note: {
                    text: 'Get complete visibility into your application infrastructure with comprehensive monitoring and dependency mapping.',
                    link: {
                        url: 'https://www.logicmonitor.com/application-infrastructure',
                        text: 'Learn about Application Infrastructure'
                    }
                }
            }
        }
    ]
};

// Update the button styles for all sections to use this consistent style
const cardStyle = "p-3 bg-[#040F4B] hover:bg-[#0A1B6F] border border-[#040F4B] rounded-lg flex flex-col items-center gap-2 transition-colors";
const cardTextStyle = "hidden sm:block text-xs font-medium text-white text-center";
const containerStyle = "border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-white dark:bg-gray-900";
const headerStyle = "text-xs font-medium text-[#040F4B] dark:text-gray-400";

const FlowingIcons = ({ direction = 'down' }: { direction?: 'up' | 'down' }) => (
    <div className="relative h-6 my-0">
        <div className="flex justify-center gap-16">
            {[
                { icon: BarChart, label: 'metrics' },
                { icon: Database, label: 'logs' },
                { icon: GitBranch, label: 'traces' }
            ].map(({ icon: Icon, label }) => (
                <div key={label} className="relative">
                    <div className={`h-6 border-l-2 border-dotted border-[#040F4B] dark:border-gray-200 relative`}>
                        <div 
                            className={`
                                absolute ${direction === 'up' ? '-top-1' : '-bottom-1'} left-1/2 
                                w-2 h-2 border-r-2 border-b-2 border-[#040F4B] dark:border-gray-200
                                transform -translate-x-1/2 ${direction === 'up' ? 'rotate-[225deg]' : 'rotate-45'}
                            `}
                        />
                        <div 
                            className={`
                                absolute left-1/2 -translate-x-1/2
                                w-5 h-5 rounded-full border border-[#040F4B] dark:border-gray-200
                                bg-white dark:bg-gray-900 flex items-center justify-center
                                ${direction === 'up' ? 'animate-[moveUpWithFade_1.5s_infinite_linear]' : 'animate-[moveDownWithFade_1.5s_infinite_linear]'}
                            `}
                        >
                            <Icon className="w-3 h-3 text-[#040F4B] dark:text-gray-200" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <style jsx>{`
            @keyframes moveDownWithFade {
                0% { 
                    transform: translateX(-50%) translateY(-4px);
                    opacity: 1;
                }
                90% { 
                    transform: translateX(-50%) translateY(24px);
                    opacity: 0;
                }
                100% { 
                    transform: translateX(-50%) translateY(24px);
                    opacity: 0;
                }
            }
            @keyframes moveUpWithFade {
                0% { 
                    transform: translateX(-50%) translateY(24px);
                    opacity: 1;
                }
                90% { 
                    transform: translateX(-50%) translateY(-4px);
                    opacity: 0;
                }
                100% { 
                    transform: translateX(-50%) translateY(-4px);
                    opacity: 0;
                }
            }
        `}</style>
    </div>
);

export const PlatformArchitecture = () => {
    const [activeSection, setActiveSection] = useState<TourStep | null>(null);

    return (
        <div className="w-full">
            <div className="flex gap-6">
                {/* Left Column - API & Integrations */}
                <div className="w-12 flex-shrink-0">
                    <button
                        onClick={() => setActiveSection(PLATFORM_SECTIONS.integrations as TourStep)}
                        className="h-full w-full flex flex-col items-center justify-center py-4 
                                 bg-[#040F4B] hover:bg-[#0A1B6F] 
                                 rounded-lg border border-[#040F4B] transition-colors"
                    >
                        <GitBranch className="w-5 h-5 text-blue-400 mb-2" />
                        <div className="flex items-center justify-center h-24">
                            <span className="hidden sm:block text-xs font-medium text-white rotate-[-90deg] whitespace-nowrap">
                                API & Integrations
                            </span>
                        </div>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-3">
                    {/* Monitoring Layer */}
                    <div className={containerStyle}>
                        <h3 className={headerStyle}>MONITORING</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {PLATFORM_SECTIONS.monitoring.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section as TourStep)}
                                    className={cardStyle}
                                >
                                    <section.icon className="w-5 h-5 text-blue-400" />
                                    <span className={cardTextStyle}>{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Arrows pointing down */}
                    <FlowingIcons direction="down" />

                    {/* Combined Unified Experience and AI Platform Container */}
                    <div className={containerStyle}>
                        {/* Unified Experience Section */}
                        <div className="space-y-3">
                            <h3 className={headerStyle}>UNIFIED EXPERIENCE</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {PLATFORM_SECTIONS.experience.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section as TourStep)}
                                        className={cardStyle}
                                    >
                                        <section.icon className="w-5 h-5 text-blue-400" />
                                        <span className={cardTextStyle}>{section.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI Platform Section */}
                        <div className="space-y-3 mt-4">
                            <h3 className={headerStyle}>FOUNDATIONAL AI PLATFORM</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {PLATFORM_SECTIONS.ai.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section as TourStep)}
                                        className={cardStyle}
                                    >
                                        <section.icon className="w-5 h-5 text-blue-400" />
                                        <span className={cardTextStyle}>{section.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Arrows pointing up */}
                    <FlowingIcons direction="up" />

                    {/* Hybrid Coverage Container */}
                    <div className={containerStyle}>
                        <h3 className={headerStyle}>HYBRID COVERAGE</h3>
                        {/* Coverage Layer */}
                        <div className="grid grid-cols-6 gap-3">
                            {PLATFORM_SECTIONS.coverage.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section as TourStep)}
                                    className={cardStyle}
                                >
                                    <section.icon className="w-5 h-5 text-blue-400" />
                                    <span className={cardTextStyle}>{section.title}</span>
                                </button>
                            ))}
                        </div>
                        {/* Infrastructure Layer */}
                        <div className="grid grid-cols-4 gap-3 mt-3">
                            {PLATFORM_SECTIONS.infrastructure.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section as TourStep)}
                                    className={cardStyle}
                                >
                                    <section.icon className="w-5 h-5 text-blue-400" />
                                    <span className={cardTextStyle}>{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog with matching FirstTimeVisit styles */}
            <Dialog open={!!activeSection} onOpenChange={(open) => !open && setActiveSection(null)}>
                <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                    {activeSection && (
                        <>
                            <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
                                <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                                    {activeSection.title}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
                                    {activeSection.description}
                                </DialogDescription>
                            </DialogHeader>

                            {activeSection.details && (
                                <div className="space-y-4 py-3">
                                    <div className="space-y-3">
                                        {/* Key Points Section */}
                                        {activeSection.details.keyPoints && (
                                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-gray-700">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                    Key Points
                                                </h4>
                                                <ul className="space-y-2">
                                                    {activeSection.details.keyPoints.map((point, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Features Section */}
                                        {activeSection.details.features && (
                                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-gray-700">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                    Features
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {activeSection.details.features.map((feature, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900 mt-0.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                                            </div>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Note Section */}
                                        {activeSection.details.note && (
                                            <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-3">
                                                <div className="flex gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p>{activeSection.details.note.text}</p>
                                                        {activeSection.details.note.link && (
                                                            <a 
                                                                href={activeSection.details.note.link.url}
                                                                className="text-blue-600 hover:underline mt-2 inline-block"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {activeSection.details.note.link.text}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}; 