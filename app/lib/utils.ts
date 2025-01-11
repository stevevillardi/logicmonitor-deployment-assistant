import { format, parseISO } from "date-fns";
import { differenceInMonths } from "date-fns";
import { differenceInDays } from "date-fns";
import { POVDecisionCriteria, POVTeamMemberWithDetails } from "../types/pov";

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
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
        case 'BLOCKED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
        case 'TECHNICALLY_SELECTED':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400';
        case 'NOT_SELECTED':
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

export function getInitials(name: string) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

export const calculateProgress = (criteria: POVDecisionCriteria[] | undefined) => {
    if (!criteria?.length) return 0;
    const met = (criteria || []).filter(c => c.status === 'MET').length;
    return Math.round((met / criteria.length) * 100);
};

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}