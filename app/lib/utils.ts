import { format, parseISO } from "date-fns";
import { differenceInMonths } from "date-fns";
import { differenceInDays } from "date-fns";
import { POV, POVDecisionCriteria, POVTeamMemberWithDetails } from "../types/pov";
import { CheckCircle } from "lucide-react";
import { Ban, CheckCircle2, CircleSlash, Star } from "lucide-react";
import { Clock } from "lucide-react";

export const getEffectiveMemberDetails = (member: POVTeamMemberWithDetails) => ({
    name: member.name ?? member.team_member.name,
    email: member.email ?? member.team_member.email,
    role: member.role ?? member.team_member.role,
    organization: member.organization ?? member.team_member.organization
});

export const calculateDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const months = differenceInMonths(end, start);
    const remainingWeeks = Math.floor((differenceInDays(end, start) - (months * 30)) / 7);
    const remainingDays = differenceInDays(end, start) % 7;

    const parts = [];
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (remainingWeeks > 0) parts.push(`${remainingWeeks} ${remainingWeeks === 1 ? 'week' : 'weeks'}`);
    if (remainingDays > 0) parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);

    return parts.join(' ');
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(parseISO(dateString), 'MMM d, yyyy');
};

export const getStatusBadgeColor = (status?: string) => {
    switch (status) {
        case 'COMPLETE':
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
        case 'SKIPPED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
        case 'BLOCKED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
        case 'TECHNICALLY_SELECTED':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400';
        case 'NOT_SELECTED':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        case 'NOT_STARTED':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        case 'SCHEDULED':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
        case 'WAIVED':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        case 'UNABLE_TO_COMPLETE':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
        default:
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
    }
};

export const STATUS_CONFIG = {
    'SUBMITTED': { icon: Clock, color: 'text-yellow-500 dark:text-yellow-400' },
    'APPROVED': { icon: CheckCircle, color: 'text-blue-500 dark:text-blue-400' },
    'IN_PROGRESS': { icon: Clock, color: 'text-blue-500 dark:text-blue-400' },
    'COMPLETE': { icon: CheckCircle2, color: 'text-green-500 dark:text-green-400' },
    'BLOCKED': { icon: Ban, color: 'text-red-500 dark:text-red-400' },
    'TECHNICALLY_SELECTED': { icon: Star, color: 'text-purple-500 dark:text-purple-400' },
    'NOT_SELECTED': { icon: CircleSlash, color: 'text-gray-500 dark:text-gray-400' }
  } as const;

export const getPOVStatusBadgeColor = (status: POV['status'] | undefined) => {
    const colors = {
        'DRAFT': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400',
        'SUBMITTED': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400',
        'APPROVED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400',
        'IN_PROGRESS': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400',
        'COMPLETE': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400',
        'BLOCKED': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
        'TECHNICALLY_SELECTED': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400',
        'NOT_SELECTED': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400',
    } as const;
    return colors[status as keyof typeof colors] || colors.DRAFT;
};

export function getInitials(name: string) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

// Helper function to calculate completion percentage
export const calculateProgress = (items: Array<{ status: string }>, excludedStatuses: string[] = ['NOT_ONBOARDED','NOT_STARTED', 'PENDING', 'OPEN', 'IN_PROGRESS', 'UNABLE_TO_COMPLETE', 'SCHEDULED']): number => {
    if (!items?.length) return 0;
    const completedItems = items.filter(item => !excludedStatuses.includes(item.status));
    return (completedItems.length / items.length) * 100;
};

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}