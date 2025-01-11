'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';
import { 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Circle, 
    ArrowUpRight,
    CalendarDays,
    Lock,
    FileText,
    Link,
    MoreHorizontal,
    MinusCircle,
    Flag,
    BarChart2,
} from 'lucide-react';
import { formatDate } from '@/app/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor } from '@/app/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { SessionActivity } from '@/app/types/pov';
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from 'react';

export default function ActivePOVWorkingSessionsOverview() {
    const { state } = usePOV();
    const { pov } = state;
    const { updateWorkingSession } = usePOVOperations();
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        skipped: 0,
        percentage: 0
    });

    // Early return after hooks
    if (!pov) return null;

    const allSessions = pov.working_sessions?.sort(
        (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    ) || [];

    useEffect(() => {
        const newStats = calculateSessionStats();
        setStats(newStats);
    }, [allSessions]);

    const formatActivityStatus = (status: string) => {
        return status.replace(/_/g, ' ');
    };

    const handleSessionStatusChange = async (
        sessionId: string, 
        newStatus: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
    ) => {
        try {
            await updateWorkingSession(sessionId, { status: newStatus });
        } catch (error) {
            console.error('Error updating session status:', error);
        }
    };

    const handleActivityStatusChange = async (
        sessionId: string, 
        activityId: string | undefined, 
        activities: SessionActivity[], 
        newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
    ) => {
        if (!activityId) return;
        
        const updatedActivities = activities.map(activity => 
            activity.id === activityId ? { ...activity, status: newStatus } : activity
        );

        try {
            await updateWorkingSession(sessionId, { 
                session_activities: updatedActivities
            });
        } catch (error) {
            console.error('Error updating activity status:', error);
        }
    };

    const calculateSessionStats = () => {
        const allActivities = allSessions.flatMap(session => session.session_activities || []);
        const totalActivities = allActivities.length;
        const completedActivities = allActivities.filter(activity => activity.status === 'COMPLETED').length;
        const inProgressActivities = allActivities.filter(activity => activity.status === 'IN_PROGRESS').length;
        const skippedActivities = allActivities.filter(activity => activity.status === 'SKIPPED').length;
        
        const completionPercentage = totalActivities > 0 
            ? Math.round((completedActivities / totalActivities) * 100)
            : 0;

        return {
            total: totalActivities,
            completed: completedActivities,
            inProgress: inProgressActivities,
            skipped: skippedActivities,
            percentage: completionPercentage
        };
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Working Sessions</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Timeline of all POV working sessions
                </p>
            </div>

            {/* Progress Stats Section */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />  
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                Activity Progress
                            </h3>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {stats.completed} of {stats.total} activities completed
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.completed} Completed
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.inProgress} In Progress
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.skipped} Skipped
                            </span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="relative">
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300 ease-in-out"
                                style={{ width: `${stats.percentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stats.percentage}% Complete
                    </div>
                </div>
            </Card>

            {/* Sessions Timeline */}
            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800" />
                
                <div className="space-y-6 ml-12">
                    {allSessions.map((session) => (
                        <div key={session.id} className="relative">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[2.85rem] top-1.5 flex items-center justify-center">
                                <div className="border-4 border-white dark:border-gray-900 rounded-full">
                                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                                </div>
                            </div>

                            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                {/* Session Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Badge 
                                                    className={`
                                                        ${getStatusBadgeColor(session.status)} 
                                                        cursor-pointer hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100
                                                        !bg-opacity-100 border-0
                                                    `}
                                                >
                                                    {session.status}
                                                </Badge>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="min-w-[120px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                                <DropdownMenuItem 
                                                    className="cursor-pointer focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                                                    onClick={() => handleSessionStatusChange(session.id, 'SCHEDULED')}
                                                >
                                                    Scheduled
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="cursor-pointer focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                                                    onClick={() => handleSessionStatusChange(session.id, 'COMPLETED')}
                                                >
                                                    Completed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="cursor-pointer focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                                                    onClick={() => handleSessionStatusChange(session.id, 'CANCELLED')}
                                                >
                                                    Cancelled
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CalendarDays className="h-4 w-4" />
                                            <time>{formatDate(session.session_date)}</time>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="h-4 w-4" />
                                            <span>{session.duration} minutes</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Title */}
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    {session.title}
                                </h3>

                                {/* Session Notes */}
                                {session.notes && (
                                    <div className="flex items-start gap-2 mb-4">
                                        <FileText className="h-4 w-4 mt-1 text-gray-400 dark:text-gray-500" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {session.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Activities Section */}
                                {session.session_activities && session.session_activities.length > 0 && (
                                    <div className="border-t dark:border-gray-700 pt-4 mt-4">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                            Activities ({session.session_activities.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {session.session_activities.map((activity, index) => (
                                                <div 
                                                    key={activity.id || index}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                >
                                                    {activity.status === 'COMPLETED' ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : activity.status === 'IN_PROGRESS' ? (
                                                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                                    ) : activity.status === 'SKIPPED' ? (
                                                        <MinusCircle className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Circle className="h-4 w-4 text-gray-400" />
                                                    )}
                                                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                                        {activity.activity || state.pov?.decision_criteria?.find(dc => 
                                                            dc.activities?.some(a => a.id === activity.decision_criteria_activity_id)
                                                        )?.activities?.find(a => a.id === activity.decision_criteria_activity_id)?.activity}
                                                    </span>
                                                    {activity.decision_criteria_activity_id && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Link className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                                                </TooltipTrigger>
                                                                <TooltipContent 
                                                                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-lg"
                                                                    sideOffset={5}
                                                                >
                                                                    <p className="text-xs">This activity is associated with a decision criteria.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Badge 
                                                                className={`
                                                                    cursor-pointer hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100
                                                                    ${activity.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                                                                      activity.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                                                                      activity.status === 'SKIPPED' ? 'bg-red-500 text-white' :
                                                                      'bg-gray-500 text-white'}
                                                                `}
                                                            >
                                                                {formatActivityStatus(activity.status)}
                                                            </Badge>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="min-w-[120px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                                                                onClick={() => handleActivityStatusChange(session.id, activity.id, session.session_activities || [], 'PENDING')}
                                                            >
                                                                Pending
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                                                                onClick={() => handleActivityStatusChange(session.id, activity.id, session.session_activities || [], 'IN_PROGRESS')}
                                                            >
                                                                In Progress
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                                                                onClick={() => handleActivityStatusChange(session.id, activity.id, session.session_activities || [], 'COMPLETED')}
                                                            >
                                                                Completed
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                                                                onClick={() => handleActivityStatusChange(session.id, activity.id, session.session_activities || [], 'SKIPPED')}
                                                            >
                                                                Skipped
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 