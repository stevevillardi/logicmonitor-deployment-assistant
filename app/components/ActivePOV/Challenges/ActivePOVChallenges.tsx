'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { POVChallenge } from '@/app/types/pov';
import { Badge } from '@/components/ui/badge';
import { 
    AlertCircle, 
    ChevronDown, 
    ChevronUp, 
    CheckCircle2, 
    MessageSquareText,
    ChartLine,
    Tags,
    Target,
    Clock,
    XCircle,
    Ban,
    PlayCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getStatusBadgeColor } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StatusDropdown } from "@/app/components/Shared/StatusDropdown";

const badgeClassName = "pointer-events-none select-none";

export default function ActivePOVChallenges() {
    const { state } = usePOV();
    const { pov } = state;
    const { updateChallenge } = usePOVOperations();
    const [expandedId, setExpandedId] = useState<string[]>(
        pov?.challenges?.map(c => c.id) || []
    );

    const challengeStatuses = [
        { value: 'OPEN', icon: PlayCircle, label: 'Open' },
        { value: 'IN_PROGRESS', icon: Clock, label: 'In Progress' },
        { value: 'COMPLETED', icon: CheckCircle2, label: 'Completed' },
        { value: 'UNABLE_TO_COMPLETE', icon: XCircle, label: 'Unable to Complete' },
        { value: 'WAIVED', icon: Ban, label: 'Waived' },
    ];

    const getStatusColor = (status: string) => {
        switch (status as POVChallenge['status']) {
            case 'COMPLETED':
                return 'text-green-600 hover:text-green-700';
            case 'IN_PROGRESS':
                return 'text-blue-600 hover:text-blue-700';
            case 'UNABLE_TO_COMPLETE':
                return 'text-red-600 hover:text-red-700';
            case 'WAIVED':
                return 'text-gray-600 hover:text-gray-700';
            case 'OPEN':
            default:
                return 'text-gray-500 hover:text-gray-600';
        }
    };

    if (!pov?.challenges?.length) return null;

    const handleStatusChange = async (challenge: POVChallenge, newStatus: POVChallenge['status'], e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const updatedChallenge = await updateChallenge(challenge.id, {
                title: challenge.title,
                challenge_description: challenge.challenge_description,
                business_impact: challenge.business_impact,
                example: challenge.example || '',
                status: newStatus,
                pov_id: challenge.pov_id,
                categories: challenge.categories?.map(cat => cat.category),
                outcomes: challenge.outcomes?.map(outcome => ({
                    outcome: outcome.outcome,
                    order_index: outcome.order_index
                }))
            });

            // Close the dropdown after successful update
            if (updatedChallenge) {
                const dropdownTrigger = document.activeElement as HTMLElement;
                dropdownTrigger?.blur();
            }
        } catch (error) {
            console.error('Error updating challenge status:', error);
        }
    };



    const handleToggle = (id: string) => {
        setExpandedId(current => 
            current.includes(id) 
                ? current.filter(cid => cid !== id) 
                : [...current, id]
        );
    };

    return (
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Active Challenges
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track and manage monitoring challenges
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {pov.challenges.map((challenge) => (
                    <div 
                        key={challenge.id} 
                        className={cn(
                            "rounded-xl border transition-all duration-200",
                            "border-gray-200 dark:border-gray-700",
                            expandedId.includes(challenge.id) && "border-blue-200 dark:border-blue-800",
                            "hover:border-blue-200 dark:hover:border-blue-800"
                        )}
                    >
                        <div className="flex items-start justify-between p-4">
                            <div 
                                className={cn(
                                    "flex-1 cursor-pointer",
                                    "transition-colors duration-200",
                                    "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                    expandedId.includes(challenge.id) && "bg-gray-50 dark:bg-gray-800/50"
                                )}
                                onClick={() => handleToggle(challenge.id)}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                        {challenge.title}
                                    </h4>
                                    <Badge className={cn(
                                        getStatusBadgeColor(challenge.status),
                                        "font-medium",
                                        badgeClassName
                                    )}>
                                        {challenge.status.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MessageSquareText className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                    <p className={cn(
                                        "text-sm text-gray-600 dark:text-gray-400",
                                        !expandedId.includes(challenge.id) && "line-clamp-2"
                                    )}>
                                        {challenge.challenge_description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <StatusDropdown
                                    currentStatus={challenge.status}
                                    statuses={challengeStatuses}
                                    onStatusChange={(status) => handleStatusChange(challenge, status as POVChallenge['status'])}
                                    getStatusColor={getStatusColor}
                                    showIcon={true}
                                    buttonSize="sm"
                                    formatStatus={(status) => status.replace(/_/g, ' ')}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 hover:bg-transparent"
                                    onClick={() => handleToggle(challenge.id)}
                                >
                                    {expandedId.includes(challenge.id) ? 
                                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    }
                                </Button>
                            </div>
                        </div>

                        {expandedId.includes(challenge.id) && (
                            <div className="px-4 pb-4 space-y-6 border-t border-gray-100 dark:border-gray-700/50">
                                {challenge.business_impact && (
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ChartLine className="h-4 w-4 text-amber-500" />
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Business Impact
                                            </h4>
                                        </div>
                                        <div className="pl-6">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {challenge.business_impact}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {challenge.categories && challenge.categories.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tags className="h-4 w-4 text-purple-500" />
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Categories
                                            </h4>
                                        </div>
                                        <div className="pl-6">
                                            <div className="flex flex-wrap gap-2">
                                                {challenge.categories.map((category) => (
                                                    <Badge 
                                                        key={category.id} 
                                                        variant="outline"
                                                        className="text-xs bg-purple-50 dark:bg-purple-900/20 
                                                                 border-purple-200 dark:border-purple-800 
                                                                 text-purple-700 dark:text-purple-300"
                                                    >
                                                        {category.category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {challenge.outcomes && challenge.outcomes.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="h-4 w-4 text-green-500" />
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Expected Outcomes
                                            </h4>
                                        </div>
                                        <div className="pl-6 space-y-2">
                                            {challenge.outcomes.map((outcome, index) => (
                                                <p key={outcome.id} className="text-sm text-gray-600 dark:text-gray-400">
                                                    {outcome.outcome}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
} 