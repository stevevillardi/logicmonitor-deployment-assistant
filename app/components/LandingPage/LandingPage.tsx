'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Layout, Save, Server, Network, Settings, FileText, Play, ArrowRight, Database, Cloud, ChartLine, Terminal, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

const features = [
    {
        title: "AI-Powered Assistant",
        description: "Get instant answers about LogicMonitor's features, configurations, and best practices with our intelligent chat assistant.",
        icon: <Bot className="w-6 h-6 text-blue-600" />,
        gradient: "from-blue-50 to-indigo-50"
    },
    {
        title: "Collector Deployment Management",
        description: "Save, load, and manage collector deployment configurations securely across devices with cloud synchronization.",
        icon: <Save className="w-6 h-6 text-blue-600" />,
        gradient: "from-blue-50 to-sky-50"
    },
    {
        title: "Device Onboarding Guide",
        description: "Get tailored recommendations for device onboarding methods including NetScan, CSV imports, and automated solutions.",
        icon: <Server className="w-6 h-6 text-blue-600" />,
        gradient: "from-sky-50 to-blue-50"
    },
    {
        title: "Deployment Sizing Calculator",
        description: "Optimize your collector deployment with sizing recommendations, failover configurations, and best practices.",
        icon: <Network className="w-6 h-6 text-blue-600" />,
        gradient: "from-indigo-50 to-blue-50"
    },
    {
        title: "API Explorer",
        description: "Interactive API documentation with real-time testing capabilities and code generation for automation.",
        icon: <Terminal className="w-6 h-6 text-blue-600" />,
        gradient: "from-cyan-50 to-blue-50"
    },
    {
        title: "Product Tour",
        description: "Guided walkthrough of platform features and capabilities to help you get started quickly.",
        icon: <PlayCircle className="w-6 h-6 text-blue-600" />,
        gradient: "from-emerald-50 to-blue-50"
    },
    {
        title: "Dashboard Explorer",
        description: "Browse and import pre-configured dashboards with our intuitive dashboard exploration tool.",
        icon: <Layout className="w-6 h-6 text-blue-600" />,
        gradient: "from-purple-50 to-blue-50"
    },
    {
        title: "Video Library",
        description: "Access a comprehensive collection of video guides covering deployment, configuration, and best practices.",
        icon: <Play className="w-6 h-6 text-blue-600" />,
        gradient: "from-blue-50 to-purple-50"
    },
    {
        title: "API based Reports",
        description: "Explore ready-to-use API report templates and examples for common monitoring and reporting scenarios.",
        icon: <FileText className="w-6 h-6 text-blue-600" />,
        gradient: "from-blue-50 to-purple-50"
    }
];

export default function LandingPage() {
    const router = useRouter();
    const { user } = useAuth();

    const handleGetStarted = () => {
        if (user) {
            router.push('/home');
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#040F4B] to-blue-900">
            {/* Hero Section with enhanced styling */}
            <div className="container mx-auto px-4 pt-12 pb-6">
                <div className="text-center mb-12 relative">
                    <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
                        LM Deployment Assistant
                    </h1>
                    <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Streamline your LogicMonitor deployment with our intelligent assistant platform
                    </p>
                    <Button
                        onClick={handleGetStarted}
                        className="bg-white text-[#040F4B] hover:bg-blue-50 px-8 py-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 antialiased"
                    >
                        {user ? (
                            <>
                                Back to Dashboard
                                <ArrowRight className="w-5 h-5" />
                            </>
                        ) : (
                            <>
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Features Grid with enhanced styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    {features.map((feature, index) => (
                        <Card 
                            key={index} 
                            className={`
                                group hover:scale-105 transition-all duration-300
                                bg-white/95 backdrop-blur-sm border-blue-200 
                                hover:shadow-lg hover:border-blue-300
                                relative overflow-hidden
                            `}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`
                                        p-3 rounded-lg shadow-sm
                                        bg-gradient-to-br ${feature.gradient}
                                        group-hover:shadow-md transition-all duration-300
                                    `}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Enhanced Footer */}
                <div className="mt-6 text-center">
                    <p className="text-blue-200 text-sm font-medium">
                        Powered by LogicMonitor&apos;s REST API | Built for efficiency by the LM Community
                    </p>
                </div>
            </div>
        </div>
    );
} 