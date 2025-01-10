'use client'

import { WorkingSession } from '@/app/types/pov';
import { Pencil, Trash, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { devLog } from '../../Shared/utils/debug';

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
                  {session.title}
                </h3>

                {/* Duration */}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {session.duration} minutes</span>
                </div>

                {/* Notes */}
                {session.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {session.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 