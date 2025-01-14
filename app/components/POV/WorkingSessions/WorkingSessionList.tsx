'use client'

import { WorkingSession } from '@/app/types/pov';
import { Pencil, Trash, Calendar, Clock, FileText, CheckCircle2, Circle, ArrowUpRight, StickyNote, Link2, Link, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { devLog } from '../../Shared/utils/debug';
import { usePOV } from '@/app/contexts/POVContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface WorkingSessionListProps {
  sessions: WorkingSession[];
  onEdit: (session: WorkingSession) => void;
}

const formatDateOnly = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function WorkingSessionList({ sessions, onEdit }: WorkingSessionListProps) {
  const { state } = usePOV();
  devLog('Sessions passed to list:', sessions);
  const { deleteWorkingSession } = usePOVOperations();

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteWorkingSession(sessionId);
    } catch (error) {
      console.error('Error deleting working session:', error);
    }
  };

  if (!sessions?.length) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No sessions</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding a working session
        </p>
      </div>
    );
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Preview of POV Timeline
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sessions.length} Working Sessions
        </span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800" />

        <div className="space-y-6 ml-12">
          {sortedSessions.map((session) => (
            <div key={session.id} className="relative">
              {/* Dot on timeline */}
              <div className="absolute -left-[2.85rem] top-1.5 flex items-center justify-center">
                <div className="border-4 border-white dark:border-gray-900 rounded-full">
                  <div className="h-4 w-4 rounded-full bg-blue-500 dark:bg-blue-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                {/* Header with Title, Date, and Actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <Calendar className="h-4 w-4" />
                    <time>{formatDateOnly(session.session_date)}</time>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      session.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : session.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : session.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                    }`}>
                      {session.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        onClick={() => onEdit(session)}
                        className="h-8 w-8 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleDelete(session.id)}
                        className="h-8 w-8 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
                      >
                        <Trash className="h-4 w-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Session: {session.title}
                </h3>

                {/* Duration */}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {session.duration} minutes</span>
                </div>

                {/* Notes */}
                {session.notes && (
                  <div className="mt-4">
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <StickyNote className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Session Notes
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line pl-6">
                        {session.notes}
                      </p>
                    </div>
                  </div>
                )}

                {session.session_activities && session.session_activities.length > 0 && (
                  <div className="mt-4">
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Activities
                        </h4>
                      </div>
                      <div className="space-y-2 pl-6">
                        {session.session_activities
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((activity) => {
                            const activityText = activity.decision_criteria_activity_id 
                              ? state.pov?.decision_criteria?.find(dc => 
                                  dc.activities?.some(a => a.id === activity.decision_criteria_activity_id)
                                )?.activities?.find(a => a.id === activity.decision_criteria_activity_id)?.activity
                              : activity.activity;

                            return (
                              <div 
                                key={activity.decision_criteria_activity_id || activity.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                {activity.status === 'COMPLETED' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                                ) : activity.status === 'IN_PROGRESS' ? (
                                  <ArrowUpRight className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                ) : (
                                  <CircleDot className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                                )}
                                <span className="text-gray-700 dark:text-gray-300">
                                  {activityText}
                                </span>
                                {activity.decision_criteria_activity_id && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Link className="h-4 w-4 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-700 dark:text-gray-300">This activity is linked to a decision criteria</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                                  activity.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                                    : activity.status === 'IN_PROGRESS'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {activity.status.replace("_", " ")}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 