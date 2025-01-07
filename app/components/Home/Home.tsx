import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Rocket, 
    Bot, 
    Server, 
    Layout,
    ArrowRight,
    FileText,
    Settings,
    BookText,
    Terminal
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

const QuickAccessCard = ({ 
    title, 
    description, 
    icon: Icon, 
    href,
    gradient = "from-blue-50 to-indigo-50",
    darkGradient = "dark:from-blue-900/30 dark:to-indigo-900/30"
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    gradient?: string;
    darkGradient?: string;
}) => (
    <Link href={href}>
        <Card className={`
            group hover:scale-105 transition-all duration-300
            bg-gradient-to-br ${gradient} ${darkGradient}
            border-blue-200 dark:border-blue-800
            hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700
            cursor-pointer dark:bg-gray-800
        `}>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-900 shadow-sm group-hover:shadow-md transition-all duration-300">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </Link>
);

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6 mb-10 overflow-y-auto">
            <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <Rocket className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 dark:bg-gray-800">
                    <div className="space-y-6">
                        {/* Welcome Message */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 dark:bg-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                LogicMonitor Deployment Assistant
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Streamline your LogicMonitor implementation with our comprehensive deployment tools and resources. Get started by exploring our key features below.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-gray-800 dark:hover:bg-gray-700 gap-2"
                                >
                                    <Link href="/sites">
                                        Configure Deployment
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Quick Access Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <QuickAccessCard
                                title="Deployment Configuration"
                                description="Configure your deployment settings, manage sites, and plan your collector distribution."
                                icon={Settings}
                                href="/sites"
                                gradient="from-blue-50 to-indigo-50"
                            />
                            <QuickAccessCard
                                title="Deployment Overview"
                                description="View your deployment summary, resource allocation, and site distribution."
                                icon={BookText}
                                href="/overview"
                                gradient="from-indigo-50 to-blue-50"
                            />
                            <QuickAccessCard
                                title="Device Information"
                                description="Access detailed information about device onboarding methods and requirements."
                                icon={Server}
                                href="/device-onboarding"
                                gradient="from-blue-50 to-sky-50"
                            />
                            <QuickAccessCard
                                title="Collector Information"
                                description="Learn about collector deployment, sizing, and configuration options."
                                icon={Bot}
                                href="/collector-info"
                                gradient="from-sky-50 to-blue-50"
                            />
                        </div>

                        {/* Additional Resources */}
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Additional Resources
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Button
                                    className="justify-start bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-gray-800 dark:hover:bg-gray-700 gap-2"
                                    asChild
                                >
                                    <Link href="/dashboard-explorer">
                                        <Layout className="w-4 h-4 text-white dark:text-blue-400" />
                                        Dashboard Explorer
                                    </Link>
                                </Button>
                                <Button
                                    className="justify-start bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-gray-800 dark:hover:bg-gray-700 gap-2"
                                    asChild
                                >
                                    <Link href="/reports-explorer">
                                        <FileText className="w-4 h-4 text-white dark:text-blue-400" />
                                        Reports Explorer
                                    </Link>
                                </Button>
                                <Button
                                    className="justify-start bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-gray-800 dark:hover:bg-gray-700 gap-2"
                                    asChild
                                >
                                    <Link href="/api-explorer">
                                        <Terminal className="w-4 h-4 text-white dark:text-blue-400" />
                                        API Explorer
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HomePage; 