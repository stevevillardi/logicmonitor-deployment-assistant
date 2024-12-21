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
        description: 'Distributed collectors gather metrics, logs, and performance data from your infrastructure using various protocols.',
        details: {
            keyPoints: [
                'Automatic collector failover and load balancing',
                'Support for multiple collection protocols',
                'Distributed architecture for scalability'
            ],
            features: [
                'JDBC, WMI, SSH, and SNMP collection',
                'Ingestion of logs and netflow data',
                'Support for Windows, Linux, and Containerized environments'
            ],
            note: {
                text: 'Collectors can be deployed on-premises or in the cloud for hybrid monitoring scenarios. ',
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
        description: 'High-performance time-series database designed for long-term metric storage and fast querying.',
        details: {
            keyPoints: [
                'Raw data retention for up to 2 years',
                'No data aggregation or downsampling',
                'High-speed query performance'
            ],
            features: [
                'Automatic data replication',
                'Built-in data compression',
                'Real-time data ingestion'
            ],
            note: {
                text: 'Visit LogicMonitor for more information about data retention. ',
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
        description: 'Seamlessly integrate with popular observability and IT operations platforms.',
        details: {
            keyPoints: [
                'Pre-built integrations with leading platforms',
                'Bi-directional data synchronization',
                'Unified observability workflows'
            ],
            features: [
                'Cribl integration for data routing',
                'Dynatrace APM correlation',
                'ThousandEyes network insights',
                'Splunk data forwarding'
            ],
            note: {
                text: 'Visit LogicMonitor for the full list of supported integrations. ',
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
        description: 'AI-powered intelligence platform for automated event management and root cause analysis.',
        details: {
            keyPoints: [
                'Dynamic thresholds and anomaly detection',
                'Automated root cause analysis',
                'Intelligent alert correlation'
            ],
            features: [
                'ML-based insights',
                'Automated incident management',
                'Pattern recognition and learning'
            ],
            note: {
                text: 'Edwin AI continuously learns from your environment to improve accuracy over time. ',
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
        title: 'Service Insights',
        description: 'Comprehensive service mapping and dependency visualization for modern applications.',
        details: {
            keyPoints: [
                'Automated service discovery',
                'Real-time dependency mapping',
                'Impact analysis and visualization'
            ],
            features: [
                'Service health scoring',
                'Dynamic topology mapping',
                'Cross-service correlation'
            ],
            note: {
                text: 'Visualize and understand complex service relationships across your entire infrastructure. ',
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
        description: 'Native cloud monitoring for AWS, Azure, and Google Cloud Platform.',
        details: {
            keyPoints: [
                'Automated cloud resource discovery',
                'Multi-cloud monitoring support',
                'Cloud cost optimization insights'
            ],
            features: [
                'AWS CloudWatch integration',
                'Azure Monitor integration',
                'GCP Stackdriver integration'
            ],
            note: {
                text: 'Visit LogicMonitor for the full list of supported cloud services. ',
                link: {
                    url: 'https://www.logicmonitor.com/support/cloud-services-and-resource-units',
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

// Update categoryStyles to use consistent Tailwind classes
const categoryStyles = {
    core: { 
        icon: Cpu,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
    },
    integration: { 
        icon: Link,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-600',
        iconBg: 'bg-purple-100'
    },
    collection: { 
        icon: Database,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-600',
        iconBg: 'bg-orange-100'
    },
    automation: { 
        icon: Zap,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100'
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
                    "max-w-xl",
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
                                        <DialogTitle className="text-xl font-bold text-gray-900">
                                            {activeStep.title}
                                        </DialogTitle>
                                        <p className={`text-sm ${categoryStyles[activeStep.category].textColor} font-medium mt-1`}>
                                            {activeStep.category.charAt(0).toUpperCase() + activeStep.category.slice(1)}
                                        </p>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-6 space-y-6">
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {activeStep.description}
                                </p>
                                
                                {activeStep.details && (
                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm p-5 space-y-6">
                                        {activeStep.details.keyPoints && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className={`w-1 h-4 rounded-full ${categoryStyles[activeStep.category].bgColor}`} />
                                                    Key Points
                                                </h4>
                                                <ul className="space-y-2.5 ml-2">
                                                    {activeStep.details.keyPoints.map((point, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${categoryStyles[activeStep.category].bgColor}`} />
                                                            <span className="leading-relaxed">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {activeStep.details.features && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className={`w-1 h-4 rounded-full ${categoryStyles[activeStep.category].bgColor}`} />
                                                    Features
                                                </h4>
                                                <ul className="space-y-2.5 ml-2">
                                                    {activeStep.details.features.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${categoryStyles[activeStep.category].bgColor}`} />
                                                            <span className="leading-relaxed">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {activeStep.details?.note && (
                                            <div className={`flex items-start gap-3 pt-3 border-t ${categoryStyles[activeStep.category].borderColor}`}>
                                                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                                                    {React.createElement(categoryStyles[activeStep.category].icon, {
                                                        className: `w-5 h-5 ${categoryStyles[activeStep.category].textColor}`
                                                    })}
                                                </div>
                                                <p className={`text-sm ${categoryStyles[activeStep.category].textColor}`}>
                                                    {activeStep.details.note.text}
                                                    {activeStep.details.note.link && (
                                                        <a 
                                                            href={activeStep.details.note.link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline hover:text-gray-600 font-medium"
                                                        >
                                                            {activeStep.details.note.link.text}
                                                        </a>
                                                    )}
                                                </p>
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