'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
    MessageSquare,
    Send,
    MoreVertical,
    Trash2,
    Edit,
    User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { POVComment } from '@/app/types/pov';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { getEffectiveMemberDetails, getInitials } from '@/app/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/app/contexts/AuthContext';
export default function ActivePOVComments() {
    const { state } = usePOV();
    const { pov } = state;
    const { addComment, deleteComment, updateComment } = usePOVOperations();
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState<POVComment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [pov?.comments]);

    if (!pov) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await addComment(newComment);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (comment: POVComment, content: string) => {
        try {
            await updateComment(comment.id, content);
            setEditingComment(null);
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            await deleteComment(commentId);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const getAvatarColors = (email: string) => {
        // Find the team member by email to get their organization
        const teamMember = pov.team_members?.find(
            member => getEffectiveMemberDetails(member).email === email
        );
        const organization = teamMember ? getEffectiveMemberDetails(teamMember).organization : 'OTHER';

        switch (organization) {
            case 'LM':
                return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
            case 'CUSTOMER':
                return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
            case 'PARTNER':
                return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    const getOrganizationLabel = (email: string) => {
        const teamMember = pov.team_members?.find(
            member => getEffectiveMemberDetails(member).email === email
        );
        const organization = teamMember ? getEffectiveMemberDetails(teamMember).organization : 'OTHER';

        switch (organization) {
            case 'LM':
                return 'LogicMonitor Team';
            case 'CUSTOMER':
                return 'Customer Team';
            case 'PARTNER':
                return 'Partner Team';
            default:
                return 'Other';
        }
    };

    const getUserDetails = (email: string) => {
        const teamMember = pov.team_members?.find(
            member => getEffectiveMemberDetails(member).email === email
        );
        
        if (teamMember) {
            const details = getEffectiveMemberDetails(teamMember);
            return {
                name: details.name,
                email: details.email,
                organization: details.organization
            };
        }

        // Fallback to just the email if no team member found
        return {
            name: email.split('@')[0],
            email: email,
            organization: 'OTHER'
        };
    };

    const isOwnMessage = (email: string) => {
        // Check if the comment's email matches the current user's email
        return email === user?.email;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex-none flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Comments
                </h3>
            </div>

            {/* Comments List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 relative">
                {pov.comments?.length ? (
                    pov.comments.map((comment) => {
                        const isOwn = isOwnMessage(comment.created_by_email);
                        return (
                            <div key={comment.id} className="group animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm">
                                        <AvatarFallback className={cn(
                                            getAvatarColors(comment.created_by_email),
                                            "text-sm font-medium"
                                        )}>
                                            {getInitials(getUserDetails(comment.created_by_email).name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                    {getUserDetails(comment.created_by_email).name}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent 
                                                    align="end"
                                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() => setEditingComment(comment)}
                                                        className="gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        {editingComment?.id === comment.id ? (
                                            <form 
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    handleUpdate(comment, editingComment.content);
                                                }}
                                                className={cn(
                                                    "space-y-2",
                                                    isOwn && "ml-auto"
                                                )}
                                            >
                                                <Textarea
                                                    value={editingComment.content}
                                                    onChange={(e) => setEditingComment({
                                                        ...editingComment,
                                                        content: e.target.value
                                                    })}
                                                    className={cn(
                                                        "min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                                                        isOwn && "max-w-[calc(100%-3rem)]"
                                                    )}
                                                />
                                                <div className={cn(
                                                    "flex gap-2",
                                                    isOwn ? "justify-start" : "justify-end"
                                                )}>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setEditingComment(null)}
                                                        className="dark:bg-gray-800 dark:hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit">
                                                        Save
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className={cn(
                                                "rounded-lg p-3 break-words max-w-[fit-content]",
                                                isOwn 
                                                    ? "bg-blue-500 text-white dark:bg-blue-600" 
                                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                            )}>
                                                {comment.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-4">
                            <MessageSquare className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                            No comments yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Start the conversation by adding a comment below
                        </p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Comment Input - Fixed at bottom */}
            <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="flex-1">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="min-h-[80px] resize-none bg-gray-50 dark:bg-gray-800 
                                border-gray-200 dark:border-gray-700 
                                focus-visible:ring-blue-500/30 dark:focus-visible:ring-blue-500/20 
                                focus-visible:ring-offset-0"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={!newComment.trim() || isSubmitting}
                        className="self-end"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Sending...' : 'Send'}
                    </Button>
                </form>
            </div>
        </div>
    );
} 