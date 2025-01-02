import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CoordinateHelper } from './CoordinateHelper';
import { Cpu, Link, Database, Zap } from 'lucide-react';

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
    coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    category: 'core' | 'integration' | 'collection' | 'automation';
}

// Original image dimensions
const ORIGINAL_WIDTH = 1200;
const ORIGINAL_HEIGHT = 800;

const TOUR_STEPS: TourStep[] = [
    {
        id: 'collector-cluster',
        title: 'Collector Cluster',
        description: 'Intelligent, distributed monitoring agents that securely collect and transmit data from your infrastructure using standard protocols.',
        details: {
            keyPoints: [
                'Agentless architecture requiring only one Collector per location',
                'Secure, encrypted outbound-only HTTPS communication',
                'Built-in failover and load balancing capabilities',
                'Automatic data caching during network interruptions'
            ],
            features: [
                'Support for SNMP, WMI, JMX, SSH and more',
                'Bandwidth-efficient with ~3Kbps per monitored resource',
                'Proxy support and automatic proxy discovery',
                'Configurable data retention up to 24 hours',
                'Windows and Linux platform support'
            ],
            note: {
                text: 'Collectors intelligently monitor hundreds of devices while using minimal resources. Data is cached locally during outages and automatically forwarded when connectivity is restored. ',
                link: {
                    url: 'https://www.logicmonitor.com/support/collectors/collector-overview/about-the-logicmonitor-collector',
                    text: 'Learn more'
                }
            }
        },
        coordinates: { x: 320, y: 675, width: 615, height: 175 },
        category: 'collection'
    },
    {
        id: 'metrics-store',
        title: 'Data Collection and Retention',
        description: 'Unified data platform for ingesting, storing and analyzing metrics, logs, and traces with granular long-term retention.',
        details: {
            keyPoints: [
                'Raw metrics retention for up to 2 years without downsampling',
                'Log data with anomaly detection and pattern analysis',
                'Distributed trace data for end-to-end request monitoring',
                'Integrated context across all data types'
            ],
            features: [
                'High-speed metric ingestion and querying',
                'AI-powered log analysis and alerting',
                'Service-level trace visualization',
                'Cross-platform data correlation',
                'Customizable data retention periods'
            ],
            note: {
                text: 'LogicMonitor stores every sample of your time-series data at full granularity for comprehensive historical analysis. Logs are enriched with metadata and traces provide request-level visibility. ',
                link: {
                    url: 'https://www.logicmonitor.com/support/about-logicmonitor/overview/data-retention',
                    text: 'Learn more'
                }
            }
        },
        coordinates: { x: 430, y: 475, width: 340, height: 160 },
        category: 'collection'
    },
    {
        id: 'third-party',
        title: 'Third Party Integrations',
        description: 'Extend LogicMonitor capabilities by integrating with your existing tools and workflows for a seamless operational experience.',
        details: {
            keyPoints: [
                'Out-of-the-box integrations configurable directly in portal',
                'Communication integrations for messaging and alerts',
                'Workflow integrations for ITSM and incident management',
                'Automation integrations for infrastructure management'
            ],
            features: [
                'Microsoft Teams and Slack messaging',
                'ServiceNow and Jira Service Management',
                'PagerDuty incident response',
                'Ansible and Terraform automation',
                'Custom HTTP/API integrations'
            ],
            note: {
                text: 'LogicMonitor provides visibility into integration logs and payloads directly in the portal to help troubleshoot integration calls. ',
                link: {
                    url: 'https://www.logicmonitor.com/support/logicmonitor-integrations-overview',
                    text: 'Learn more'
                }
            }
        },
        coordinates: { x: 445, y: 0, width: 350, height: 150 },
        category: 'integration'
    },
    {
        id: 'edwin-ai',
        title: 'Edwin AI',
        description: 'Find the signal in your IT noise with AI-powered incident management that consolidates event intelligence, troubleshooting, and incident management into one single pane of glass.',
        details: {
            keyPoints: [
                'Reduce alert noise by 90% through correlation and deduplication',
                'Reduce MTTR by 60% with GenAI-powered analysis',
                'Boost productivity by 20% with predictive insights',
                'Unify ITOps, SecOps, and DevOps data in real-time'
            ],
            features: [
                'AI-driven alert correlation and grouping',
                'GenAI-powered summaries and root cause analysis',
                'Predictive alerts and automated escalation',
                'Cross-domain data unification',
                'ITSM and CMDB integration'
            ],
            note: {
                text: 'Edwin AI uses machine learning and Generative AI to transform how customers perceive, reason, and act on their complex observability data, delivering value within hours of implementation. ',
                link: {
                    url: 'https://www.logicmonitor.com/support/edwin/introduction-to-edwin-ai',
                    text: 'Learn more'
                }
            }
        },
        coordinates: { x: 840, y: 195, width: 140, height: 240 },
        category: 'automation'
    },
    {
        id: 'service-insights',
        title: 'Service Insight',
        description: 'Group and monitor resources at a service level to understand the health and performance of your business services and applications.',
        details: {
            keyPoints: [
                'Aggregate service level indicators across multiple resources',
                'Monitor applications running across distributed containers',
                'Focus on overall service health rather than individual components',
                'Group instances across multiple monitored resources into logical services'
            ],
            features: [
                'Service-level monitoring and alerting',
                'Aggregated data collection across instances',
                'Custom service grouping and organization',
                'Service health visualization and dashboards',
                'Cross-resource performance monitoring'
            ],
            note: {
                text: 'Service Insight helps monitor distributed applications where individual component health may not reflect overall service performance. ',
                link: {
                    url: 'https://www.logicmonitor.com/support/lm-service-insight/about-lm-service-insight',
                    text: 'Learn more'
                }
            }
        },
        coordinates: { x: 460, y: 225, width: 300, height: 200 },
        category: 'core'
    },
    {
        id: 'cloud-integration',
        title: 'Cloud Integration',
        description: 'Unified monitoring for AWS, Azure, GCP and SaaS applications with automatic discovery and comprehensive visibility.',
        details: {
            keyPoints: [
                'Three-step setup wizard for automatic cloud discovery',
                'API-based monitoring of cloud services and resources',
                'Comprehensive monitoring of cloud performance, events, and billing',
                'Support for multi-cloud and hybrid environments'
            ],
            features: [
                'Resource performance and cloud events monitoring',
                'Cloud provider availability tracking',
                'Cost optimization and billing insights',
                'Auto-generated cloud dashboards and reports',
                'Cloud resource tagging and filtering'
            ],
            note: {
                text: 'Monitor your entire cloud ecosystem including AWS, Azure, GCP, and SaaS applications like Office 365, Salesforce, and Zoom from a single unified platform. ',
                link: {
                    url: 'https://www.logicmonitor.com/support/lm-cloud/getting-started-lm-cloud/lm-cloud-monitoring-overview',
                    text: 'Learn more'
                }
            }
        },
        coordinates: { x: 0, y: 325, width: 220, height: 175 },
        category: 'integration'
    },
    {
        id: 'servicenow',
        title: 'ServiceNow Integration',
        description: 'Enterprise-grade ITSM integration with ServiceNow.',
        details: {
            keyPoints: [
                'Bi-directional incident synchronization',
                'CMDB data synchronization',
                'Automated ticket creation'
            ],
            features: [
                'Incident management workflow',
                'Change management integration',
                'Asset enrichment and updates',
                'Custom field mapping'
            ],
            note: {
                text: 'Certified ServiceNow integration available in the ',
                link: {
                    url: 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/951bdc460f07b200c514c3ace1050e5e',
                    text: 'ServiceNow Store'
                }
            }
        },
        coordinates: { x: 1000, y: 317, width: 200, height: 235 },
        category: 'integration'
    }
];

// Update categoryStyles to include dark mode classes
const categoryStyles = {
    core: { 
        icon: Cpu,
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        accentColor: 'bg-blue-200 dark:bg-blue-800',
        borderColor: 'border-blue-300 dark:border-blue-800',
        textColor: 'text-blue-700 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900'
    },
    integration: { 
        icon: Link,
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        accentColor: 'bg-yellow-200 dark:bg-yellow-800',
        borderColor: 'border-yellow-300 dark:border-yellow-800',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900'
    },
    collection: { 
        icon: Database,
        bgColor: 'bg-orange-50 dark:bg-orange-950',
        accentColor: 'bg-orange-200 dark:bg-orange-800',
        borderColor: 'border-orange-300 dark:border-orange-800',
        textColor: 'text-orange-700 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-900'
    },
    automation: { 
        icon: Zap,
        bgColor: 'bg-emerald-50 dark:bg-emerald-950',
        accentColor: 'bg-emerald-200 dark:bg-emerald-800',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900'
    }
} as const;

// Add isFullScreen to props
interface PlatformTourProps {
    isFullScreen?: boolean;
}

export const PlatformTour = ({ isFullScreen }: PlatformTourProps) => {
    const [activeStep, setActiveStep] = useState<TourStep | null>(null);
    const [scale, setScale] = useState(1);
    const imageRef = useRef<HTMLImageElement>(null);

    // Update scale when image size changes or fullscreen state changes
    useEffect(() => {
        const updateScale = () => {
            if (imageRef.current) {
                const currentWidth = imageRef.current.clientWidth;
                setScale(currentWidth / ORIGINAL_WIDTH);
            }
        };

        // Initial scale
        updateScale();

        // Add small delay for transition
        const timeout = setTimeout(updateScale, 300);

        // Update scale on window resize
        window.addEventListener('resize', updateScale);
        return () => {
            window.removeEventListener('resize', updateScale);
            clearTimeout(timeout);
        };
    }, [isFullScreen]); // Add isFullScreen to dependencies

    const handleAreaClick = (step: TourStep) => {
        setActiveStep(step);
    };

    return (
        <div className="relative">
            {/* Interactive Diagram - simplified */}
            <div className="relative border rounded-lg overflow-hidden">
                <Image 
                    ref={imageRef}
                    src="/platform-diagram.png" 
                    alt="LogicMonitor Platform Architecture"
                    width={ORIGINAL_WIDTH}
                    height={ORIGINAL_HEIGHT}
                    className="w-full h-auto"
                />
                {/* Clickable Areas */}
                {TOUR_STEPS.map(step => (
                    <button
                        key={step.id}
                        className={cn(
                            "absolute cursor-pointer transition-all duration-200",
                            "hover:bg-blue-500/20 hover:border-blue-500",
                            "border-2 border-transparent rounded-md",
                            activeStep?.id === step.id && "border-blue-500 bg-blue-500/10"
                        )}
                        style={{
                            left: `${step.coordinates.x * scale}px`,
                            top: `${step.coordinates.y * scale}px`,
                            width: `${step.coordinates.width * scale}px`,
                            height: `${step.coordinates.height * scale}px`,
                        }}
                        onClick={() => handleAreaClick(step)}
                    />
                ))}
            </div>

            {/* Dialog - remove fullscreen classes */}
            <Dialog open={!!activeStep} onOpenChange={(open) => !open && setActiveStep(null)}>
                <DialogContent className={cn(
                    "max-w-xl dark:border-gray-800",
                    activeStep && categoryStyles[activeStep.category].bgColor
                )}>
                    {activeStep && (
                        <>
                            <DialogHeader className={`pb-4 ${categoryStyles[activeStep.category].borderColor}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${categoryStyles[activeStep.category].bgColor} 
                                        flex items-center justify-center border-2 ${categoryStyles[activeStep.category].borderColor}`}>
                                        {React.createElement(categoryStyles[activeStep.category].icon, {
                                            className: `w-6 h-6 ${categoryStyles[activeStep.category].textColor}`
                                        })}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {activeStep.title}
                                        </DialogTitle>
                                        <p className={`text-sm ${categoryStyles[activeStep.category].textColor} font-medium mt-1`}>
                                            {activeStep.category.charAt(0).toUpperCase() + activeStep.category.slice(1)}
                                        </p>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                    {activeStep.description}
                                </p>
                                
                                {activeStep.details && (
                                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl border dark:border-gray-800 shadow-sm p-6 space-y-8">
                                        {activeStep.details.keyPoints && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-base">
                                                    <div className={`w-1.5 h-6 rounded-full ${categoryStyles[activeStep.category].accentColor}`} />
                                                    Key Capabilities
                                                </h4>
                                                <ul className="space-y-3">
                                                    {activeStep.details.keyPoints.map((point, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${categoryStyles[activeStep.category].accentColor}`} />
                                                            <span className="text-gray-600 dark:text-gray-400 leading-relaxed">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {activeStep.details.features && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-base">
                                                    <div className={`w-1.5 h-6 rounded-full ${categoryStyles[activeStep.category].accentColor}`} />
                                                    Features
                                                </h4>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {activeStep.details.features.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <div className={`p-1 rounded-full mt-0.5 flex-shrink-0 ${categoryStyles[activeStep.category].accentColor}`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full bg-white`} />
                                                            </div>
                                                            <span className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {activeStep.details?.note && (
                                            <div className={`flex items-start gap-3 pt-4 border-t ${categoryStyles[activeStep.category].borderColor}`}>
                                                <div className={`p-2 rounded-lg ${categoryStyles[activeStep.category].accentColor} flex-shrink-0`}>
                                                    {React.createElement(categoryStyles[activeStep.category].icon, {
                                                        className: "w-4 h-4 text-white"
                                                    })}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {activeStep.details.note.text}
                                                    </p>
                                                    {activeStep.details.note.link && (
                                                        <a 
                                                            href={activeStep.details.note.link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-1 font-medium hover:underline ${categoryStyles[activeStep.category].textColor}`}
                                                        >
                                                            {activeStep.details.note.link.text}
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}; 