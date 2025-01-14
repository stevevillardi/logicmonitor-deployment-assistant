'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Calendar, ArrowRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { calculateDuration, formatDate, getPOVStatusBadgeColor } from '@/app/lib/utils';
import { parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEffectiveMemberDetails, getInitials } from '@/app/lib/utils';
import Link from 'next/link';
import { POVTeamMemberWithDetails } from '@/app/types/pov';
import { cn } from '@/lib/utils';

const MAX_VISIBLE_MEMBERS = 5;

const TeamMembersSection = ({ members }: { members: POVTeamMemberWithDetails[] }) => {
    const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS);
    const remainingCount = Math.max(0, members.length - MAX_VISIBLE_MEMBERS);

    return (
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-lg py-2 px-3 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center">
                <div className="flex -space-x-2">
                    {visibleMembers.map((member) => {
                        const details = getEffectiveMemberDetails(member);
                        return (
                            <TooltipProvider key={member.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-900 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                                            <AvatarFallback 
                                                className={`${
                                                    details.organization === 'LM' 
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                                                    details.organization === 'CUSTOMER' 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                                                    details.organization === 'PARTNER'
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                            >
                                                {getInitials(details.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="flex flex-col gap-1">
                                        <p className="font-medium">{details.name}</p>
                                        <p className="text-xs text-gray-500">{details.role}</p>
                                        <p className="text-xs text-gray-500">
                                            {details.organization === 'LM' ? 'LogicMonitor' :
                                             details.organization === 'CUSTOMER' ? 'Customer' :
                                             details.organization === 'PARTNER' ? 'Partner' :
                                             details.organization}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                    {remainingCount > 0 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                +{remainingCount}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <Link 
                href={`/active-pov/${members[0]?.pov_id}/team`}
                className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 flex items-center gap-1"
            >
                <Users className="h-4 w-4" />
                <span>View Team</span>
            </Link>
        </div>
    );
};

export default function ActivePOVHeader() {
    const { state } = usePOV();
    const { pov } = state;
    const router = useRouter();

    const handleBack = () => {
        router.push('/pov?tab=pov-tracker');
    };

    const badgeClassName = "pointer-events-none select-none";

    return (
        <header className="border-b border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to POV List
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
                                {pov ? pov.customer_name : 'Loading...'}
                            </h1>
                            <Badge className={cn(
                                getPOVStatusBadgeColor(pov?.status),
                                "font-bold",
                                badgeClassName
                            )}>
                                {pov?.status?.replace(/_/g, ' ') || 'LOADING'}
                            </Badge>
                        </div>
                        {pov && (
                            <div className="mt-1 space-y-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {pov.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>{pov.customer_industry}</span>
                                    <span>•</span>
                                    <span>{pov.customer_region}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {pov && (
                        <div className="flex items-center gap-4 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-500 dark:text-gray-400">Start Date</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {pov.start_date ? formatDate(pov.start_date) : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center px-2">
                                <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-500 dark:text-gray-400">Target End Date</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {pov.end_date ? formatDate(pov.end_date) : ''}
                                    </span>
                                </div>
                            </div>
                            {pov.start_date && pov.end_date && (
                                <div className="flex flex-col ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                                    <span className="font-medium text-gray-500 dark:text-gray-400">Duration</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {calculateDuration(pov.start_date, pov.end_date)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    {pov?.team_members && pov.team_members.length > 0 && (
                        <TeamMembersSection members={pov.team_members} />
                    )}
                </div>
            </div>
        </header>
    );
} 