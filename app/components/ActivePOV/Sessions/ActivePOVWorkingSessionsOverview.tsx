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
    FileText,
    Link,
    MinusCircle,
    BarChart2,
    CircleDot,
} from 'lucide-react';
import { formatDate } from '@/app/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { SessionActivity } from '@/app/types/pov';
import { useState, useEffect } from 'react';
import { StatusDropdown } from "@/app/components/Shared/StatusDropdown";
import { cn } from "@/lib/utils";

export default function ActivePOVWorkingSessionsOverview() {
    const { state } = usePOV();
    const { pov } = state;
    const { updateWorkingSession } = usePOVOperations();
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
        percentage: 0
    });

    const sessionStatuses = [
        { value: 'SCHEDULED', icon: Calendar, label: 'Scheduled' },
        { value: 'COMPLETED', icon: CheckCircle2, label: 'Completed' },
        { value: 'CANCELLED', icon: MinusCircle, label: 'Cancelled' }
    ];

    const activityStatuses = [
        { value: 'PENDING', icon: CircleDot, label: 'Pending' },
        { value: 'IN_PROGRESS', icon: ArrowUpRight, label: 'In Progress' },
        { value: 'COMPLETED', icon: CheckCircle2, label: 'Completed' },
        { value: 'SKIPPED', icon: MinusCircle, label: 'Skipped' }
    ];

    const dropdownClassName = "scale-90 origin-top-right";

    const getSessionStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500 text-white hover:bg-green-600';
            case 'SCHEDULED':
                return 'bg-blue-500 text-white hover:bg-blue-600';
            case 'CANCELLED':
                return 'bg-red-500 text-white hover:bg-red-600';
            default:
                return 'bg-gray-500 text-white hover:bg-gray-600';
        }
    };

    const getSessionMenuItemColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'text-green-600';
            case 'SCHEDULED':
                return 'text-blue-600';
            case 'CANCELLED':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getActivityStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500 text-white hover:bg-green-600';
            case 'IN_PROGRESS':
                return 'bg-blue-500 text-white hover:bg-blue-600';
            case 'SKIPPED':
                return 'bg-red-500 text-white hover:bg-red-600';
            case 'PENDING':
            default:
                return 'bg-gray-500 text-white hover:bg-gray-600';
        }
    };

    const getActivityMenuItemColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'text-green-600';
            case 'IN_PROGRESS':
                return 'text-blue-600';
            case 'SKIPPED':
                return 'text-red-600';
            case 'PENDING':
            default:
                return 'text-gray-600';
        }
    };

    // Move useEffect before any returns
    useEffect(() => {
        if (pov?.working_sessions) {
            const total = pov.working_sessions.length;
            const completed = pov.working_sessions.filter(s => s.status === 'COMPLETED').length;
            const scheduled = pov.working_sessions.filter(s => s.status === 'SCHEDULED').length;
            const cancelled = pov.working_sessions.filter(s => s.status === 'CANCELLED').length;

            setStats({
                total,
                completed,
                scheduled,
                cancelled,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            });
        }
    }, [pov?.working_sessions]);

    // Early return after useEffect
    if (!pov) return null;

    const allSessions = pov.working_sessions?.sort(
        (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    ) || [];

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
                                {stats.scheduled} Scheduled
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.cancelled} Cancelled
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
                                        <StatusDropdown
                                            currentStatus={session.status}
                                            statuses={sessionStatuses}
                                            onStatusChange={(status) => handleSessionStatusChange(session.id, status as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED')}
                                            getStatusColor={getSessionStatusColor}
                                            getMenuItemColor={getSessionMenuItemColor}
                                            showIcon={true}
                                            buttonSize="sm"
                                            className={cn("rounded-full", dropdownClassName)}
                                        />
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
                                                    <StatusDropdown
                                                        currentStatus={activity.status}
                                                        statuses={activityStatuses}
                                                        onStatusChange={(status) => handleActivityStatusChange(
                                                            session.id, 
                                                            activity.id, 
                                                            session.session_activities || [], 
                                                            status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
                                                        )}
                                                        getStatusColor={getActivityStatusColor}
                                                        getMenuItemColor={getActivityMenuItemColor}
                                                        showIcon={true}
                                                        buttonSize="sm"
                                                        className={cn("rounded-full", dropdownClassName)}
                                                    />
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