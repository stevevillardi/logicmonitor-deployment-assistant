'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Layout, Save, Server, Network, Settings, FileText, Play, ArrowRight, Database, Cloud, ChartLine, Terminal, PlayCircle, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';

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
            {/* Navigation Bar */}
            <div className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-b from-[#040F4B]/90 to-transparent backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    {/* Title */}
                    <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold text-lg hidden sm:inline">
                            LM Deployment Assistant
                        </span>
                        <span className="text-white font-semibold text-lg sm:hidden">
                            LM Assistant
                        </span>
                    </div>

                    {/* Get Started Button */}
                    <Button
                        onClick={handleGetStarted}
                        className="bg-white text-[#040F4B] hover:bg-blue-50 px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 antialiased"
                    >
                        {user ? (
                            <>
                                Back to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12 relative pt-16">
                    <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
                        LM Deployment Assistant
                    </h1>
                    <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Streamline your LogicMonitor deployment with our intelligent assistant platform
                    </p>
                </div>

                {/* Screenshot Section */}
                <div className="mt-12 mb-32 relative">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent" />
                    </div>

                    {/* Screenshots Display */}
                    <div className="relative max-w-7xl mx-auto">
                        {/* Desktop Mockups */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-0">
                            {/* Left Screenshot */}
                            <div className="transform sm:-rotate-6 sm:-translate-x-6 sm:translate-y-8 z-10 hover:z-30 transition-all duration-300 hover:-translate-y-8">
                                <div className="relative w-[280px] sm:w-[300px] md:w-[400px] aspect-[7/6] rounded-2xl border-[4px] border-gray-900 shadow-xl hover:shadow-2xl bg-gray-900 overflow-hidden transition-all duration-500 hover:scale-150 origin-center">
                                    <Image
                                        src="/screenshots/onboarding.png"
                                        alt="Collector Configuration"
                                        fill
                                        className="object-cover rounded-lg transition-transform duration-500"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Center Screenshot (larger) */}
                            <div className="z-20 hover:z-30 transition-all duration-300 hover:-translate-y-8">
                                <div className="relative w-[320px] sm:w-[360px] md:w-[480px] aspect-[7/6] rounded-2xl border-[4px] border-gray-900 shadow-xl hover:shadow-2xl bg-gray-900 overflow-hidden transition-all duration-500 hover:scale-150 origin-center">
                                    <Image
                                        src="/screenshots/home.png"
                                        alt="Dashboard View"
                                        fill
                                        className="object-cover rounded-lg transition-transform duration-500"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Right Screenshot */}
                            <div className="transform sm:rotate-6 sm:translate-x-6 sm:translate-y-8 z-10 hover:z-30 transition-all duration-300 hover:-translate-y-8">
                                <div className="relative w-[280px] sm:w-[300px] md:w-[400px] aspect-[7/6] rounded-2xl border-[4px] border-gray-900 shadow-xl hover:shadow-2xl bg-gray-900 overflow-hidden transition-all duration-500 hover:scale-150 origin-center">
                                    <Image
                                        src="/screenshots/overview.png"
                                        alt="AI Chat Assistant"
                                        fill
                                        className="object-cover rounded-lg transition-transform duration-500"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -bottom-16 inset-x-0">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
                        </div>
                    </div>
                </div>

                {/* Features Label */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Platform Features
                    </h2>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        Everything you need to streamline your LogicMonitor deployment
                    </p>
                </div>

                {/* Features Grid */}
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
                <div className="mt-12 pb-8 border-t border-blue-800/20">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center gap-6">
                            {/* Attribution */}
                            <p className="text-blue-200 text-sm font-medium">
                                Built by the Community | Powered by LogicMonitor&apos;s REST API
                            </p>

                            {/* Legal Links */}
                            <div className="flex items-center gap-6">
                                <Link 
                                    href="/privacy" 
                                    className="text-sm text-blue-200 hover:text-white transition-colors duration-200"
                                >
                                    Privacy Policy
                                </Link>
                                <span className="text-blue-700">•</span>
                                <Link 
                                    href="/legal" 
                                    className="text-sm text-blue-200 hover:text-white transition-colors duration-200"
                                >
                                    Legal Disclaimer
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 