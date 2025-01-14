'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';
import { 
    BarChart2, 
    CheckCircle2, 
    AlertCircle,
    Calendar,
    Clock,
    ArrowRight,
    Users,
    Activity,
    User,
    FileText,
    CircleHelp,
    MessageCircle,
    Server,
    HardDrive,
    Network,
    Laptop,
    ChevronDown,
    Hash,
    Target,
    ChevronLeft,
    ChevronRight,
    Building2,
    XCircle,
    Ban,
    ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { POVActivity, DeviceScope } from '@/app/types/pov';
import { formatDistanceToNow } from 'date-fns';
import { formatDate } from '@/app/lib/utils';
import { devLog } from '../../Shared/utils/debug';
import ActivePOVChallenges from '../Challenges/ActivePOVChallenges';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import DashboardDecisionCriteriaList from '@/app/components/POV/DecisionCriteria/DashboardDecisionCriteriaList';
import { StatusDropdown } from "@/app/components/Shared/StatusDropdown";
import { Button } from "@/components/ui/button";
import { calculateProgress } from '@/app/lib/utils';

const MAX_VISIBLE_SESSIONS = 3;

// Progress bar component
const ProgressBar = ({ progress, label, color = "bg-blue-600" }: { 
    progress: number; 
    label: string;
    color?: string;
}) => (
    <div className="space-y-1">
        <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <span className="text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
                className={`h-full ${color} transition-all duration-300`} 
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);

export default function ActivePOVDashboard() {
    const { state } = usePOV();
    const { pov } = state;
    const { updateDeviceStatus } = usePOVOperations();

    const [currentDevicePage, setCurrentDevicePage] = useState(0);
    const [currentServicePage, setCurrentServicePage] = useState(0);
    const [showDetails, setShowDetails] = useState(true);

    if (!pov) return null;

    // Get upcoming sessions (sorted by date)
    const upcomingSessions = pov.working_sessions
        ?.filter(session => new Date(session.session_date) >= new Date())
        .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()) || [];

    const visibleSessions = upcomingSessions.slice(0, MAX_VISIBLE_SESSIONS);
    const remainingSessionsCount = Math.max(0, upcomingSessions.length - MAX_VISIBLE_SESSIONS);

    const getActivityIcon = (type: POVActivity['type']) => {
        switch (type) {
            case 'CRITERIA':
                return <div className="h-5 w-5 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>;
            case 'SESSION':
                return <div className="h-5 w-5 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-blue-600" />
                </div>;
            case 'CHALLENGE':
                return <div className="h-5 w-5 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                </div>;
            case 'TEAM':
                return <div className="h-5 w-5 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-600" />
                </div>;
            case 'STATUS':
                return <div className="h-5 w-5 rounded-full bg-gray-500/20 border-2 border-gray-500 flex items-center justify-center">
                    <Activity className="h-3 w-3 text-gray-600" />
                </div>;
            case 'DOCUMENT':
                return <div className="h-5 w-5 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
                    <FileText className="h-3 w-3 text-orange-600" />
                </div>;
            case 'COMMENT':
                return <div className="h-5 w-5 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                    <MessageCircle className="h-3 w-3 text-red-600" />
                </div>;
            default:
                return <div className="h-5 w-5 rounded-full bg-gray-500/20 border-2 border-gray-500 flex items-center justify-center">
                    <CircleHelp className="h-3 w-3 text-gray-600" />
                </div>;
        }
    };
    devLog('pov', pov);
    // Get recent activities (last 5)
    const recentActivities = pov.activities
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

    const MAX_VISIBLE_ACTIVITIES = 3;
    const visibleActivities = recentActivities.slice(0, MAX_VISIBLE_ACTIVITIES);
    const remainingCount = Math.max(0, recentActivities.length - MAX_VISIBLE_ACTIVITIES);

    const getDeviceIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'servers':
                return <Server className="h-4 w-4" />;
            case 'storage':
                return <HardDrive className="h-4 w-4" />;
            case 'networking':
                return <Network className="h-4 w-4" />;
            default:
                return <Laptop className="h-4 w-4" />;
        }
    };

    const deviceStatuses = [
        { value: 'NOT_ONBOARDED', icon: AlertCircle, label: 'Not Onboarded' },
        { value: 'IN_PROGRESS', icon: Clock, label: 'In Progress' },
        { value: 'ONBOARDED', icon: CheckCircle2, label: 'Onboarded' },
        { value: 'SKIPPED', icon: XCircle, label: 'Skipped' },
        { value: 'WAIVED', icon: Ban, label: 'Waived' }
    ];

    const getStatusColor = (status: string) => {
        switch (status as DeviceScope['status']) {
            case 'ONBOARDED':
                return 'text-green-600 dark:text-green-400';
            case 'IN_PROGRESS':
                return 'text-blue-600 dark:text-blue-400';
            case 'NOT_ONBOARDED':
                return 'text-gray-600 dark:text-gray-400';
            case 'SKIPPED':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'WAIVED':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const handleDeviceStatusChange = async (deviceId: string, status: DeviceScope['status']) => {
        try {
            await updateDeviceStatus(deviceId, status);
        } catch (error) {
            console.error('Error updating device status:', error);
            // You might want to add toast notification here
        }
    };

    // Add state for device scope pagination
    const DEVICES_PER_PAGE = 8;

    // Add these helper functions
    const totalDevicePages = Math.ceil((pov.device_scopes?.length || 0) / DEVICES_PER_PAGE);
    const hasNextPage = currentDevicePage < totalDevicePages - 1;
    const hasPrevPage = currentDevicePage > 0;

    const visibleDevices = pov.device_scopes?.slice(
        currentDevicePage * DEVICES_PER_PAGE,
        (currentDevicePage + 1) * DEVICES_PER_PAGE
    ) || [];

    // Add to state declarations
    const SERVICES_PER_PAGE = 4;

    // Add helper functions for services pagination
    const totalServicePages = Math.ceil((pov.key_business_services?.length || 0) / SERVICES_PER_PAGE);
    const hasNextServicePage = currentServicePage < totalServicePages - 1;
    const hasPrevServicePage = currentServicePage > 0;

    const visibleServices = pov.key_business_services?.slice(
        currentServicePage * SERVICES_PER_PAGE,
        (currentServicePage + 1) * SERVICES_PER_PAGE
    ) || [];

    // Calculate individual progress
    const workingSessionsProgress = calculateProgress(pov?.working_sessions || []) * 0.25;
    const deviceScopesProgress = calculateProgress(pov?.device_scopes || []) * 0.25;
    const challengesProgress = calculateProgress(pov?.challenges || []) * 0.25;
    const decisionCriteriaProgress = calculateProgress(pov?.decision_criteria || []) * 0.25;

    // Calculate overall progress
    const overallProgress = workingSessionsProgress + deviceScopesProgress + challengesProgress + decisionCriteriaProgress;

    return (
        <div className="space-y-6 p-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Progress - Takes 2 columns */}
                <div className="md:col-span-2">
                    <Card className="h-full p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BarChart2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Overall Progress
                                </h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="space-y-4">

                            <div className="space-y-2">
                                <div className="relative">
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300 ease-in-out"
                                            style={{ width: `${overallProgress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {overallProgress.toFixed(0)}% Complete
                                </div>
                            </div>

                            {/* Detailed Progress Sections */}
                            {showDetails && (
                                <div className="space-y-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {/* Working Sessions Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Working Sessions ({(workingSessionsProgress * 4).toFixed(0)}% Complete)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.working_sessions?.filter(s => s.status === 'COMPLETED').length || 0} Complete
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.working_sessions?.filter(s => s.status === 'SCHEDULED').length || 0} Scheduled
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 transition-all duration-300"
                                                style={{ width: `${workingSessionsProgress * 4}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Device Scope Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Device Scope Onboarding ({(deviceScopesProgress * 4).toFixed(0)}% Complete)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.device_scopes?.filter(d => d.status === 'ONBOARDED').length || 0} Onboarded
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.device_scopes?.filter(d => d.status === 'IN_PROGRESS').length || 0} In Progress
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500 transition-all duration-300"
                                                style={{ width: `${deviceScopesProgress * 4}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Challenges Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Challenges ({(challengesProgress * 4).toFixed(0)}% Complete)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.challenges?.filter(c => c.status === 'COMPLETED').length || 0} Complete
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.challenges?.filter(c => c.status === 'IN_PROGRESS').length || 0} In Progress
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.challenges?.filter(c => c.status === 'OPEN').length || 0} Open
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-yellow-500 transition-all duration-300"
                                                style={{ width: `${challengesProgress * 4}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Decision Criteria Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Decision Criteria ({(decisionCriteriaProgress * 4).toFixed(0)}% Complete)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.decision_criteria?.filter(c => c.status === 'COMPLETE').length || 0} Complete
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pov.decision_criteria?.filter(c => c.status === 'IN_PROGRESS').length || 0} In Progress
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-red-500 transition-all duration-300"
                                                style={{ width: `${decisionCriteriaProgress * 4}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Combined Metrics - Takes 1 column */}
                <div className="md:col-span-1">
                    <Card className="h-full p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <div className="space-y-6">
                            {/* Key Business Services */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        Key Business Services
                                    </h3>
                                </div>
                                <div className="relative">
                                    {/* Previous Button */}
                                    {hasPrevServicePage && (
                                        <button
                                            onClick={() => setCurrentServicePage(prev => prev - 1)}
                                            className="absolute -left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                                        >
                                            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    )}

                                    {/* Services Grid */}
                                    <div className="grid grid-cols-2 gap-2 px-2">
                                        {visibleServices.map((service) => (
                                            <div 
                                                key={service.id}
                                                className="p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                                            >
                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                    {service.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                                    {service.tech_owner}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    {hasNextServicePage && (
                                        <button
                                            onClick={() => setCurrentServicePage(prev => prev + 1)}
                                            className="absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                                        >
                                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    )}
                                </div>

                                {/* Page Indicator */}
                                {totalServicePages > 1 && (
                                    <div className="flex justify-center gap-1 mt-3">
                                        {Array.from({ length: totalServicePages }).map((_, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "h-1 rounded-full transition-all",
                                                    index === currentServicePage
                                                        ? "w-3 bg-blue-500 dark:bg-blue-400"
                                                        : "w-1 bg-gray-200 dark:bg-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-700" />

                            {/* Progress Metrics */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Decision Criteria
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Criteria Met
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {pov.decision_criteria?.filter(c => c.status === 'MET').length || 0}
                                            /{pov.decision_criteria?.length || 0}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Challenges
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Resolved
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {pov.challenges?.filter(c => c.status === 'COMPLETED').length || 0}
                                            /{pov.challenges?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Device Scope Section */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Device Scope
                        </h3>
                    </div>
                    {/* <Link 
                        href={`/active-pov/${pov.id}/scope`}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link> */}
                </div>

                <div className="relative">
                    {/* Previous Button */}
                    {hasPrevPage && (
                        <button
                            onClick={() => setCurrentDevicePage(prev => prev - 1)}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}

                    {/* Device Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {visibleDevices.map((device) => (
                            <div 
                                key={device.id}
                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                            {getDeviceIcon(device.category)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {device.device_type}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {device.category}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusDropdown
                                        currentStatus={device.status}
                                        statuses={deviceStatuses}
                                        onStatusChange={(status) => handleDeviceStatusChange(device.id, status as DeviceScope['status'])}
                                        getStatusColor={getStatusColor}
                                        showIcon={true}
                                        buttonSize="sm"
                                    />
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Hash className="h-3.5 w-3.5" />
                                        <span>{device.count} devices</span>
                                    </div>
                                    {device.priority && (
                                        <>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Target className="h-3.5 w-3.5" />
                                                <span>{device.priority} Priority</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Next Button */}
                    {hasNextPage && (
                        <button
                            onClick={() => setCurrentDevicePage(prev => prev + 1)}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Optional: Add page indicator */}
                {totalDevicePages > 1 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {Array.from({ length: totalDevicePages }).map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "h-1.5 rounded-full transition-all",
                                    index === currentDevicePage
                                        ? "w-4 bg-blue-500 dark:bg-blue-400"
                                        : "w-1.5 bg-gray-200 dark:bg-gray-700"
                                )}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {/* Recent Activities & Upcoming Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Recent Activities
                            </h3>
                        </div>
                        <Link 
                            href={`/active-pov/${pov.id}/activities`}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-4 ml-12">
                            {recentActivities.length > 0 ? (
                                <>
                                    {visibleActivities.map((activity) => (
                                        <div key={activity.id} className="relative">
                                            <div className="absolute -left-[2.85rem] top-1.5 flex items-center justify-center">
                                                <div className="border-4 border-white dark:border-gray-900 rounded-full bg-white dark:bg-gray-900">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                {getActivityIcon(activity.type)}
                                                            </TooltipTrigger>
                                                            <TooltipContent 
                                                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-lg"
                                                                sideOffset={5}
                                                            >
                                                                <p className="text-xs">{activity.type.charAt(0) + activity.type.slice(1).toLowerCase()} Activity</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {activity.title}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {activity.description}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5" />
                                                        {activity.created_by_email || 'Unknown User'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {remainingCount > 0 && (
                                        <div className="relative">
                                            <div className="absolute -left-[2.85rem] top-1.5 flex items-center justify-center">
                                                <div className="border-4 border-white dark:border-gray-900 rounded-full bg-white dark:bg-gray-900">
                                                    <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                                                </div>
                                            </div>
                                            <Link 
                                                href={`/active-pov/${pov.id}/timeline`}
                                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                            >
                                                <span>{remainingCount} more {remainingCount === 1 ? 'activity' : 'activities'}</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    No recent activities
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Upcoming Sessions */}
                <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Upcoming Sessions
                            </h3>
                        </div>
                        <Link 
                            href={`/active-pov/${pov.id}/sessions`}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {upcomingSessions.length > 0 ? (
                            <>
                                {visibleSessions.map((session, index) => (
                                    <div key={session.id} className="relative">
                                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200/50 dark:border-gray-700/50">
                                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 rounded-lg flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {session.title}
                                                </h4>
                                                <div className="mt-1 flex items-center gap-3 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>{formatDate(session.session_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{session.duration} mins</span>
                                                    </div>
                                                </div>
                                                {(() => {
                                                    const activityCount = session.session_activities?.length || 0;
                                                    return activityCount > 0 && (
                                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span>{activityCount} {activityCount === 1 ? 'activity' : 'activities'}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        
                                        {index < visibleSessions.length - 1 && (
                                            <div className="h-4 mt-2 flex items-center justify-center">
                                                <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 rotate-90" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {remainingSessionsCount > 0 && (
                                    <Link 
                                        href={`/active-pov/${pov.id}/sessions`}
                                        className="flex items-center gap-2 p-4 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <span>{remainingSessionsCount} more {remainingSessionsCount === 1 ? 'session' : 'sessions'} scheduled</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No upcoming sessions</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Schedule your next working session
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Challenges Section */}
            <ActivePOVChallenges />

            {/* Decision Criteria Section */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Decision Criteria
                        </h3>
                    </div>
                    <Link 
                        href={`/active-pov/${pov.id}/sessions`}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                        View Related Sessions
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <DashboardDecisionCriteriaList 
                    decisionCriteria={pov.decision_criteria || []}
                />
            </Card>

            {/* Progress Overview */}
            <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Overall Progress
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                
                <ProgressBar 
                    progress={overallProgress} 
                    label="Overall Completion" 
                    color="bg-[#040F4B] dark:bg-blue-600"
                />

                {showDetails && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <ProgressBar 
                            progress={workingSessionsProgress * 4} 
                            label="Working Sessions" 
                            color="bg-green-600 dark:bg-green-500"
                        />
                        <ProgressBar 
                            progress={deviceScopesProgress * 4} 
                            label="Device Scope Onboarding" 
                            color="bg-purple-600 dark:bg-purple-500"
                        />
                        <ProgressBar 
                            progress={challengesProgress * 4} 
                            label="Challenges" 
                            color="bg-yellow-600 dark:bg-yellow-500"
                        />
                        <ProgressBar 
                            progress={decisionCriteriaProgress * 4} 
                            label="Decision Criteria" 
                            color="bg-red-600 dark:bg-red-500"
                        />
                    </div>
                )}
            </div>

        </div>
    );
} 