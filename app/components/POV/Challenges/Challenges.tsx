'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import ChallengeList from './ChallengeList';
import AddChallengeDialog from './AddChallengeDialog';
import { POVChallenge } from '@/app/types/pov';
import { devLog } from '../../Shared/utils/debug';

export default function Challenges() {
  const { state } = usePOV();
  const pov = state.pov;
  const challenges = pov?.challenges || [];
  devLog('Challenges in state:', challenges);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<POVChallenge | null>(null);

  const handleEdit = (challenge: POVChallenge) => {
    setEditingChallenge(challenge);
    setIsAddDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingChallenge(null);
      }, 0);
    }
  };

  const handleAddNewClick = () => {
    setEditingChallenge(null);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
              Challenges
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage challenges for {pov?.title}
            </p>
          </div>
          <Button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
          >
            <Plus className="h-4 w-4" />
            Add Challenge
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChallengeList 
          challenges={challenges} 
          onEdit={handleEdit}
        />
      </div>

      <AddChallengeDialog 
        open={isAddDialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingChallenge={editingChallenge}
        onClose={() => {
          setEditingChallenge(null);
        }}
      />
    </div>
  );
} 