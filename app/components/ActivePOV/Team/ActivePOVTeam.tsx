'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Users, Mail, Building2, Copy, ExternalLink } from 'lucide-react';
import { getEffectiveMemberDetails, getInitials } from '@/app/lib/utils';
import { POVTeamMemberWithDetails } from '@/app/types/pov';
import AddTeamMemberDialog from '@/app/components/POV/Team/AddTeamMemberDialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type GroupedMembers = {
    LM: POVTeamMemberWithDetails[];
    CUSTOMER: POVTeamMemberWithDetails[];
    PARTNER: POVTeamMemberWithDetails[];
    OTHER: POVTeamMemberWithDetails[];
};

const CopyableEmail = ({ email, organization = 'OTHER' }: { email: string, organization?: string }) => {
    const [copied, setCopied] = useState(false);

    const getLinkColor = () => {
        switch (organization) {
            case 'LM':
                return 'text-blue-500 dark:text-blue-400';
            case 'CUSTOMER':
                return 'text-green-500 dark:text-green-400';
            case 'PARTNER':
                return 'text-purple-500 dark:text-purple-400';
            default:
                return 'text-gray-500 dark:text-gray-400';
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <a 
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <Mail className={`h-4 w-4 ${getLinkColor()}`} />
                <span>{email}</span>
                <ExternalLink className={`h-3 w-3 ${getLinkColor()}`} />
            </a>
            <TooltipProvider>
                <Tooltip open={copied}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy();
                            }}
                        >
                            <Copy className={`h-3 w-3 ${getLinkColor()}`} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent 
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-lg"
                        sideOffset={5}
                    >
                        <p className="text-xs">Copied!</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default function ActivePOVTeam() {
    const { state } = usePOV();
    const { pov } = state;
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    if (!pov) return null;

    const groupedMembers: GroupedMembers = {
        LM: [],
        CUSTOMER: [],
        PARTNER: [],
        OTHER: []
    };

    pov.team_members?.forEach(member => {
        const details = getEffectiveMemberDetails(member);
        const group = details.organization || 'OTHER';
        groupedMembers[group].push(member);
    });

    const renderTeamGroup = (title: string, members: POVTeamMemberWithDetails[], bgColor: string, icon: string) => (
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        icon === 'LM' && "bg-blue-50 dark:bg-blue-900/20",
                        icon === 'CUSTOMER' && "bg-green-50 dark:bg-green-900/20",
                        icon === 'PARTNER' && "bg-purple-50 dark:bg-purple-900/20",
                        icon === 'OTHER' && "bg-gray-50 dark:bg-gray-900/20"
                    )}>
                        <Building2 className={cn(
                            "h-5 w-5",
                            icon === 'LM' && "text-blue-600 dark:text-blue-400",
                            icon === 'CUSTOMER' && "text-green-600 dark:text-green-400",
                            icon === 'PARTNER' && "text-purple-600 dark:text-purple-400",
                            icon === 'OTHER' && "text-gray-600 dark:text-gray-400"
                        )} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {members.map((member) => {
                    const details = getEffectiveMemberDetails(member);
                    return (
                        <div 
                            key={member.id} 
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 
                                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                                    <AvatarFallback className={cn(
                                        bgColor,
                                        "dark:bg-gray-800 dark:text-gray-200"
                                    )}>
                                        {getInitials(details.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {details.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {details.role}
                                    </p>
                                </div>
                            </div>
                            <CopyableEmail email={details.email} organization={icon} />
                        </div>
                    );
                })}
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Team Members
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage team members and their roles
                    </p>
                </div>
                <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {groupedMembers.LM.length > 0 && 
                    renderTeamGroup('LogicMonitor Team', groupedMembers.LM, 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300', 'LM')}
                {groupedMembers.CUSTOMER.length > 0 && 
                    renderTeamGroup('Customer Team', groupedMembers.CUSTOMER, 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300', 'CUSTOMER')}
                {groupedMembers.PARTNER.length > 0 && 
                    renderTeamGroup('Partner Team', groupedMembers.PARTNER, 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300', 'PARTNER')}
                {groupedMembers.OTHER.length > 0 && 
                    renderTeamGroup('Other', groupedMembers.OTHER, 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', 'OTHER')}
            </div>

            <AddTeamMemberDialog 
                open={isAddDialogOpen} 
                onOpenChange={setIsAddDialogOpen}
            />
        </div>
    );
} 