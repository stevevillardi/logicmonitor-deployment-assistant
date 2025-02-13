'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ClipboardList, 
    CalendarRange, 
    CheckCircle2, 
    AlertCircle, 
    Target,
    Search,
    Clock,
    BarChart2,
    Building2,
    Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePOV } from '@/app/contexts/POVContext';
import { POV } from '@/app/types/pov';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEffectiveMemberDetails, getInitials, formatDate, getPOVStatusBadgeColor, calculateProgress } from '@/app/lib/utils';

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

const EmptyState = () => (
    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="text-center">
            <div className="bg-gray-50 dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                No Active POVs
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                There are currently no active POVs to track, create one to get started! View the POV Manager to see all POVs.
            </p>
        </div>
    </div>
);

const calculateSessionProgress = (pov: POV) => {
    const allActivities = pov.working_sessions?.flatMap(session => 
        session.session_activities || []
    ).filter(activity => activity.status) || [];
    
    const totalActivities = allActivities.length;
    if (totalActivities === 0) return 0;
    
    const completedActivities = allActivities.filter(activity => 
        activity.status === 'COMPLETED'
    ).length;
    
    return Math.round((completedActivities / totalActivities) * 100);
};

const calculateOverallProgress = (pov: POV) => {
    const workingSessionsProgress = calculateProgress(pov?.working_sessions || []) * 0.25;
    const deviceScopesProgress = calculateProgress(pov?.device_scopes || []) * 0.25;
    const challengesProgress = calculateProgress(pov?.challenges || []) * 0.25;
    const decisionCriteriaProgress = calculateProgress(pov?.decision_criteria || []) * 0.25;
    
    return workingSessionsProgress + deviceScopesProgress + challengesProgress + decisionCriteriaProgress;
};

const POVTracker = () => {
    const router = useRouter();
    const { state } = usePOV();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const povsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const activePOVs = state.povs?.filter(pov => 
        pov.status !== 'DRAFT' && 
        (pov.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         pov.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastPOV = currentPage * povsPerPage;
    const indexOfFirstPOV = indexOfLastPOV - povsPerPage;
    const currentPOVs = activePOVs?.slice(indexOfFirstPOV, indexOfLastPOV);
    const totalPages = Math.ceil((activePOVs?.length || 0) / povsPerPage);

    const handleViewPOV = (povId: string) => {
        router.push(`/active-pov/${povId}`);
    };

    return (
        <Card className="border border-gray-200 dark:border-gray-700 mb-4 min-h-[800px] dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        <CardTitle className="dark:text-gray-100">POV Progress Tracker</CardTitle>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activePOVs?.length || 0} Active POVs
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
                <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Search and Filter
                        </label>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                            placeholder="Search active POVs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                {currentPOVs && currentPOVs.length > 0 ? (
                    <div className="space-y-4">
                        {currentPOVs.map((pov: POV) => (
                            <div
                                key={pov.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 
                                    hover:bg-gray-50 dark:hover:bg-gray-800 
                                    hover:border-gray-300 dark:hover:border-gray-600
                                    cursor-pointer transition-all duration-200"
                                onClick={() => handleViewPOV(pov.id)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {pov.customer_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {pov.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <Building2 className="h-3.5 w-3.5" />
                                            <span>{pov.customer_industry}</span>
                                            <span>•</span>
                                            <span>{pov.customer_region}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-4">
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {pov.working_sessions?.filter(s => s.status === 'SCHEDULED').length || 0} Sessions Left
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {calculateSessionProgress(pov)}% Activities Complete
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex -space-x-2">
                                                {(pov.team_members || []).map((member) => (
                                                    <TooltipProvider key={member.id}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                                                                    <AvatarFallback 
                                                                        className={`${
                                                                            getEffectiveMemberDetails(member).organization === 'LM' 
                                                                                ? 'bg-blue-100 text-blue-700' :
                                                                            getEffectiveMemberDetails(member).organization === 'CUSTOMER' 
                                                                                ? 'bg-green-100 text-green-700' :
                                                                            getEffectiveMemberDetails(member).organization === 'PARTNER'
                                                                                ? 'bg-purple-100 text-purple-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                        } text-xs`}
                                                                    >
                                                                        {getInitials(getEffectiveMemberDetails(member).name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </TooltipTrigger>
                                                            <TooltipContent 
                                                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                                                                sideOffset={5}
                                                            >
                                                                <div className="text-sm">
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {getEffectiveMemberDetails(member).name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {getEffectiveMemberDetails(member).role}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {getEffectiveMemberDetails(member).organization === 'LM' ? 'LogicMonitor' :
                                                                         getEffectiveMemberDetails(member).organization === 'CUSTOMER' ? 'Customer' :
                                                                         getEffectiveMemberDetails(member).organization === 'PARTNER' ? 'Partner' :
                                                                         getEffectiveMemberDetails(member).organization}
                                                                    </p>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {pov.team_members?.length || 0} Team Members
                                            </span>
                                        </div>

                                        <Badge className={`${getPOVStatusBadgeColor(pov.status)}`}>
                                            {pov.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Started: {formatDate(pov.start_date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Target: {formatDate(pov.end_date)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Overall Progress
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {calculateOverallProgress(pov).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="absolute left-0 top-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-in-out"
                                                    style={{ width: `${calculateOverallProgress(pov)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                                                    <span className="text-gray-700 dark:text-gray-300">Decision Criteria Met</span>
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {pov.decision_criteria?.filter(c => c.status === 'MET').length || 0}/{pov.decision_criteria?.length || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                                                    <span className="text-gray-700 dark:text-gray-300">Challenges Resolved</span>
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {pov.challenges?.filter(c => c.status === 'COMPLETED').length || 0}/{pov.challenges?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}

                <div className="mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md 
                                disabled:opacity-50 text-gray-900 dark:text-gray-100"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300 order-first sm:order-none">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md 
                                disabled:opacity-50 text-gray-900 dark:text-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default POVTracker; 