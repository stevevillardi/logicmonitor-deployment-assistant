'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import WorkingSessionList from '@/app/components/POV/WorkingSessions/WorkingSessionList';
import AddWorkingSessionDialog from '@/app/components/POV/WorkingSessions/AddWorkingSessionDialog';
import { WorkingSession as WorkingSessionType } from '@/app/types/pov';
import { devLog } from '../../Shared/utils/debug';

export default function WorkingSessions() {
  const { state } = usePOV();
  const pov = state.pov;
  const workingSessions = pov?.working_sessions || [];
  devLog('Working Sessions in state:', workingSessions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkingSessionType | null>(null);

  const handleEdit = (session: WorkingSessionType) => {
    setEditingSession(session);
    setIsAddDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingSession(null);
      }, 0);
    }
  };

  const handleAddNewClick = () => {
    setEditingSession(null);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Working Sessions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage working sessions for {state.pov?.title}
            </p>
          </div>
          <Button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <WorkingSessionList 
          sessions={workingSessions} 
          onEdit={handleEdit}
        />
      </Card>

      <AddWorkingSessionDialog 
        open={isAddDialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingSession={editingSession}
        onClose={() => {
          setEditingSession(null);
        }}
      />
    </div>
  );
} 