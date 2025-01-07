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
            description: 'Intelligent observability for modern applications – contextually bring together traces, metrics, and synthetics.',
            category: 'core',
            details: {
                keyPoints: [
                    'End-to-end distributed tracing with OpenTelemetry',
                    'Real-time application performance insights',
                    'Proactive synthetic monitoring',
                    'Automated service dependency mapping'
                ],
                features: [
                    'Distributed tracing with span analysis',
                    'Application topology visualization',
                    'Multi-step synthetic transactions',
                    'OpenTelemetry & OpenMetrics integration',
                    'Cross-team collaboration tools'
                ],
                note: {
                    text: 'Track user performance, detect application latency, and identify bottlenecks within your modern applications across hybrid and multi-cloud environments.',
                    link: {
                        url: 'https://www.logicmonitor.com/application-performance-monitoring',
                        text: 'Learn about Application Performance Monitoring'
                    }
                }
            }
        },
        {
            id: 'alerts',
            title: 'Alert & Event Intelligence',
            icon: Activity,
            description: 'Eliminate alert fatigue and resolve IT incidents faster with Edwin AI-powered intelligence.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Reduce alert noise by 90% with AI correlation',
                    'Reduce MTTR by 60% with GenAI insights',
                    'Seamless ITSM integration',
                    'Cross-domain alert grouping'
                ],
                features: [
                    'AI-driven alert correlation & deduplication',
                    'GenAI-powered incident summaries',
                    'Automated routing & escalation',
                    'Predictive alerts & insights',
                    'Root cause analysis with GenAI'
                ],
                note: {
                    text: 'Edwin AI consolidates event intelligence, troubleshooting, and incident management into one single pane of glass, with support for 3000+ integrations.',
                    link: {
                        url: 'https://www.logicmonitor.com/edwin-ai',
                        text: 'Learn about Edwin AI'
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
            description: 'Monitor and visualize service health by aggregating data across instances and resources.',
            category: 'core',
            details: {
                keyPoints: [
                    'Service-level monitoring and alerting',
                    'Cross-resource data aggregation',
                    'Logical service grouping',
                    'Service level indicators (SLI) tracking'
                ],
                features: [
                    'Instance aggregation across resources',
                    'Service-level data visualization',
                    'Custom aggregation methods',
                    'Service health monitoring',
                    'Container-aware service tracking'
                ],
                note: {
                    text: 'LM Service Insight enables monitoring of overall service health across distributed resources, perfect for containerized applications where individual instances may be ephemeral.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/lm-service-insight/about-lm-service-insight',
                        text: 'Learn about Service Insight'
                    }
                }
            }
        },
        {
            id: 'resource-explorer',
            title: 'Resource Explorer',
            icon: Search,
            description: 'Display and analyze health summary for all monitored resources in your LogicMonitor portal.',
            category: 'core',
            details: {
                keyPoints: [
                    'Advanced filtering by resource properties',
                    'Flexible resource grouping options',
                    'Alert severity tracking and analysis',
                    'Real-time resource health monitoring'
                ],
                features: [
                    'Custom saved views and sharing',
                    'Alert severity filtering',
                    'Property-based grouping',
                    'Resource metrics visualization',
                    'Drill-down resource analysis'
                ],
                note: {
                    text: 'Use filters and groups to focus on specific resources, quickly identify critical alerts, and drill down to investigate root causes across your infrastructure.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/resource-explorer-overview',
                        text: 'Learn about Resource Explorer'
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
                        url: 'https://www.logicmonitor.com/support/dashboards-and-widgets/overview/what-are-dashboards',
                        text: 'Learn about Platform Analytics'
                    }
                }
            }
        },
        {
            id: 'ai-assist',
            title: 'AI Assist',
            icon: Zap,
            description: 'AI-powered intelligence that helps you see what\'s coming before it happens and quickly understand the source of problems.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Reduce alert noise by up to 80%',
                    'Early warning system for proactive prevention',
                    'Automated metric correlation',
                    'Dynamic threshold adaptation'
                ],
                features: [
                    'AI-driven alert correlation',
                    'Predictive anomaly detection',
                    'Automated root cause analysis',
                    'Capacity planning forecasting',
                    'Dependent alert mapping'
                ],
                note: {
                    text: 'Edwin AI employs out-of-box ML models with no training needed, providing immediate value through alert correlation, predictive insights, and automated troubleshooting.',
                    link: {
                        url: 'https://www.logicmonitor.com/aiops',
                        text: 'Learn about AIOps'
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
            description: 'Identify data patterns that fall outside of expected behavior using machine learning algorithms.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Machine learning-based pattern detection',
                    'Automatic expected range calculation',
                    'Real-time anomaly visualization',
                    'Log and metric anomaly detection'
                ],
                features: [
                    'Dynamic baseline learning',
                    'Expected range visualization',
                    'Historical pattern analysis',
                    'Log structure analysis',
                    'Automated profile learning'
                ],
                note: {
                    text: 'Detect anomalies across metrics and logs with no training needed - LogicMonitor automatically establishes baselines and identifies deviations to catch issues before they escalate.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/forecasting/anomaly-detection/anomaly-detection-visualization',
                        text: 'Learn about Anomaly Detection'
                    }
                }
            }
        },
        {
            id: 'dynamic',
            title: 'Dynamic Thresholds',
            icon: GitBranch,
            description: 'Automatically detect anomalies and reduce alert noise with AI-powered dynamic thresholds.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Auto-generated expected data ranges',
                    'Seasonal pattern recognition',
                    'Rate of change detection',
                    'No manual threshold tuning needed'
                ],
                features: [
                    'Automatic baseline learning',
                    'Daily/weekly trend detection',
                    'Alert noise reduction',
                    'Multi-level threshold configuration',
                    'Static threshold integration'
                ],
                note: {
                    text: 'Dynamic thresholds automatically adjust to your environment\'s patterns, reducing alert noise while ensuring you catch real issues that static thresholds might miss.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/alerts/aiops-features-for-alerting/enabling-dynamic-thresholds-for-datapoints',
                        text: 'Learn about Dynamic Thresholds'
                    }
                }
            }
        },
        {
            id: 'forecasting',
            title: 'Forecasting & Prediction',
            icon: BarChart,
            description: 'Predict future trends for your monitored infrastructure using past performance data and machine learning.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Anomaly-aware trend analysis',
                    'Capacity trending algorithms',
                    'Confidence-based predictions',
                    'Multiple forecast methods'
                ],
                features: [
                    '95% confidence forecasting',
                    'Line of best fit forecasting',
                    'Customizable time ranges',
                    'Alert threshold prediction',
                    'Resource lifetime planning'
                ],
                note: {
                    text: 'Forecast helps with issue diagnosis, budget planning, and resource management by analyzing past performance to predict when metrics will reach critical thresholds.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/forecasting/overview/data-forecasting',
                        text: 'Learn about Forecasting'
                    }
                }
            }
        },
        {
            id: 'correlation',
            title: 'Event Correlation',
            icon: Network,
            description: 'Group related alerts into unified incidents and identify root causes through topology-aware correlation.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Topology-based dependency mapping',
                    'Cross-domain alert grouping',
                    'Automated root cause identification',
                    'Intelligent alert deduplication'
                ],
                features: [
                    'Alert noise reduction by 90%',
                    'Dependent alert suppression',
                    'Real-time correlation analysis',
                    'Configurable routing delays',
                    'Automated escalation control'
                ],
                note: {
                    text: 'Alert correlation automatically groups related alerts into unified incidents, identifies root causes through topology mapping, and reduces alert noise by suppressing dependent alerts.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/edwina/alert-correlation',
                        text: 'Learn about Edwin AI Alert Correlation'
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
            description: 'Collect and store high-resolution time-series data with flexible retention and aggregation.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Long-term data retention (3 months to 2+ years)',
                    'High-resolution data collection',
                    'Granular storage engine',
                    'Flexible data aggregation'
                ],
                features: [
                    'Full-resolution data storage',
                    'Historical data analysis',
                    'Custom retention policies',
                    'Trend-based aggregation',
                    'Instance history preservation'
                ],
                note: {
                    text: 'Store every sample of your time-series data at full resolution for forensic analysis, with intelligent aggregation for long-term trend visibility. Instance history is preserved for 30 days after deletion.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/about-logicmonitor/overview/data-retention',
                        text: 'Learn about Data Retention'
                    }
                }
            }
        },
        {
            id: 'events',
            title: 'Events',
            icon: Activity,
            description: 'Collect and normalize events from multiple sources to identify changes in your IT infrastructure.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Multi-source event collection',
                    'Automated event normalization',
                    'Event-based workflow triggers',
                    'Intelligent event deduplication'
                ],
                features: [
                    'SNMP trap monitoring',
                    'Windows event logs',
                    'Syslog monitoring',
                    'IPMI event tracking',
                    'Custom event filtering'
                ],
                note: {
                    text: 'Events are normalized into a homogeneous format (DEF) and can trigger workflows that compress repeat identical events into deduplicated alerts for efficient incident management.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/edwin/events',
                        text: 'Learn about Events'
                    }
                }
            }
        },
        {
            id: 'logs',
            title: 'Logs',
            icon: Database,
            description: 'Unified log analysis with algorithmic root-cause analysis and anomaly detection.',
            category: 'collection',
            details: {
                keyPoints: [
                    'AI-powered anomaly detection',
                    'Early issue identification',
                    'Automated pattern recognition',
                    'Multi-source log ingestion'
                ],
                features: [
                    'Advanced log search & filtering',
                    'Log pipeline processing',
                    'Log anomaly visualization',
                    'Cloud service integration',
                    'Real-time log analysis'
                ],
                note: {
                    text: 'LM Logs analyzes log events to identify normal patterns and deviations, helping teams act on issues early before they become more complex and expensive to resolve.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/lm-logs/lm-logs-overview',
                        text: 'Learn about LM Logs'
                    }
                }
            }
        },
        {
            id: 'traces',
            title: 'Traces',
            icon: GitBranch,
            description: 'Monitor end-to-end communication as requests flow through distributed services in your environment.',
            category: 'collection',
            details: {
                keyPoints: [
                    'OpenTelemetry-based integration',
                    'End-to-end request monitoring',
                    'Automated service mapping',
                    'Real-time performance analysis'
                ],
                features: [
                    'Distributed trace collection',
                    'Service dependency visualization',
                    'Request latency analysis',
                    'Cross-service correlation',
                    'Span-level troubleshooting'
                ],
                note: {
                    text: 'Identify where issues are occurring in your application\'s communication with detailed trace data that shows how requests flow through your distributed services.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/tracing/distributed-tracing-overview',
                        text: 'Learn about Distributed Tracing'
                    }
                }
            }
        },
        {
            id: 'topology',
            title: 'Topology',
            icon: Network,
            description: 'Visual representation of relationships among elements within your communications network using layer 2 and layer 3 mappings.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Layer 2 and 3 topology mapping',
                    'Dynamic relationship discovery',
                    'Root cause visualization',
                    'Multi-protocol support'
                ],
                features: [
                    'LLDP/CDP discovery',
                    'BGP/OSPF/EIGRP support',
                    'Automated topology generation',
                    'Resource relationship mapping',
                    'Topology-aware alerting'
                ],
                note: {
                    text: 'Automatically discover and visualize network topology to determine root causes of incidents, troubleshoot alerts, and understand resource dependencies across your infrastructure.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/forecasting/topology-mapping/topology-mapping-overview',
                        text: 'Learn about Topology Mapping'
                    }
                }
            }
        },
        {
            id: 'config',
            title: 'Config',
            icon: Settings,
            description: 'Monitor and track configuration changes across your infrastructure with version control and compliance validation.',
            category: 'collection',
            details: {
                keyPoints: [
                    'Multi-protocol config collection',
                    'Version-controlled change tracking',
                    'Automated config backup',
                    'Real-time change detection'
                ],
                features: [
                    'Config file versioning',
                    'Change visualization & diff',
                    'Protocol auto-detection',
                    'Config comparison tools',
                    'Custom collection methods'
                ],
                note: {
                    text: 'Track configuration changes with support for multiple collection protocols (SFTP, SCP, SSH, Telnet) and automatically detect the most reliable method for each device.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/common-config-monitoring',
                        text: 'Learn about Config Monitoring'
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
            description: 'Agentless monitoring solution for comprehensive visibility into your on-premises infrastructure.',
            category: 'core',
            details: {
                keyPoints: [
                    'Agentless architecture',
                    'Standard monitoring protocols',
                    'Automated resource discovery',
                    'Centralized data collection'
                ],
                features: [
                    'Network device monitoring',
                    'Server performance tracking',
                    'Storage system monitoring',
                    'Virtual infrastructure visibility',
                    'Comprehensive data collection'
                ],
                note: {
                    text: 'Monitor your entire on-premises infrastructure through a lightweight collector that uses standard protocols - no need to install agents on each monitored resource.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/getting-started/i-just-signed-up-for-logicmonitor-now-what/1-about-the-logicmonitor-solution',
                        text: 'Learn about LogicMonitor Architecture'
                    }
                }
            }
        },
        {
            id: 'cloud-infra',
            title: 'Cloud Infrastructure',
            icon: Cloud,
            description: 'API-based monitoring of AWS, GCP, and Azure environments with seamless setup and automated discovery.',
            category: 'integration',
            details: {
                keyPoints: [
                    'Three-step setup wizard',
                    'Multi-cloud resource discovery',
                    'Comprehensive billing monitoring',
                    'Service limit utilization tracking'
                ],
                features: [
                    'Auto-generated cloud dashboards',
                    'Cloud cost optimization',
                    'Cloud provider availability checks',
                    'Cloud service monitoring',
                    'Resource performance tracking'
                ],
                note: {
                    text: 'LM Cloud provides executive-level dashboards and deep-dive technical insights into AWS, GCP, and Azure together with other infrastructure on one unified platform.',
                    link: {
                        url: 'https://www.logicmonitor.com/support/lm-cloud/getting-started-lm-cloud/lm-cloud-monitoring-overview',
                        text: 'Learn about LM Cloud'
                    }
                }
            }
        },
        {
            id: 'ai-infra',
            title: 'AI Infrastructure',
            icon: Brain,
            description: 'Comprehensive visibility and optimization for AI/ML workloads and GenAI initiatives.',
            category: 'automation',
            details: {
                keyPoints: [
                    'Unified hybrid cloud visibility',
                    'Proactive issue resolution',
                    'Resource optimization for AI',
                    'Performance bottleneck detection'
                ],
                features: [
                    'GenAI model monitoring',
                    'AI workload optimization',
                    'Resource utilization tracking',
                    'AI pipeline visibility',
                    'Cross-environment correlation'
                ],
                note: {
                    text: 'Monitor AI workloads across hybrid environments with comprehensive visibility that helps teams optimize resource utilization, maintain reliability, and quickly isolate the source of issues.',
                    link: {
                        url: 'https://www.logicmonitor.com/blog/how-logicmonitor-and-amazon-bedrock-accelerate-generative-ai-initiatives',
                        text: 'Learn about AI Infrastructure Monitoring'
                    }
                }
            }
        },
        {
            id: 'applications',
            title: 'Applications',
            icon: Layers,
            description: 'Scalable, dynamic monitoring for containerized applications and microservices across your hybrid infrastructure.',
            category: 'integration',
            details: {
                keyPoints: [
                    'Automated container discovery',
                    'Kubernetes & Docker monitoring',
                    'Event-based resource tracking',
                    'Service-level monitoring'
                ],
                features: [
                    'Container health monitoring',
                    'Microservices visibility',
                    'Dynamic service grouping',
                    'Container resource optimization',
                    'Long-term data retention'
                ],
                note: {
                    text: 'Monitor containerized applications with automatic discovery and tracking of ephemeral resources, while maintaining data continuity for long-term performance analysis.',
                    link: {
                        url: 'https://www.logicmonitor.com/container-monitoring',
                        text: 'Learn about Container Monitoring'
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