'use client'

import { WorkingSession } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, Calendar, Clock, FileText, Tag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { devLog } from '../../Shared/utils/debug';
import { formatDate } from '@/lib/utils';

interface WorkingSessionListProps {
  sessions: WorkingSession[];
  onEdit: (session: WorkingSession) => void;
}

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
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No sessions</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding a working session
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-100';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-100';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-100';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-100';
    }
  };

  return (
    <div className="grid gap-4">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="p-6 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              {/* Title and Status */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {session.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={`mt-1 ${getStatusColor(session.status)}`}
                  >
                    {session.status}
                  </Badge>
                </div>
              </div>

              {/* Date and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(session.session_date)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Duration: {session.duration} minutes
                  </span>
                </div>
              </div>

              {/* Notes */}
              {session.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {session.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onEdit(session)}
                className="h-8 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleDelete(session.id)}
                className="h-8 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
              >
                <Trash className="h-4 w-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 