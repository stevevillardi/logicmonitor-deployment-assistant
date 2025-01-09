'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Library } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import ChallengeList from './ChallengeList';
import CreateChallengeDialog from './CreateChallengeDialog';
import AddFromLibraryDialog from './AddFromLibraryDialog';
import { POVChallenge } from '@/app/types/pov';
import { devLog } from '../../Shared/utils/debug';

export default function Challenges() {
  const { state } = usePOV();
  const pov = state.pov;
  const challenges = pov?.challenges || [];
  devLog('Challenges in state:', challenges);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<POVChallenge | null>(null);

  const handleEdit = (challenge: POVChallenge) => {
    setEditingChallenge(challenge);
    setIsCreateDialogOpen(true);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingChallenge(null);
      }, 0);
    }
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
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Create New
            </Button>
            <Button
              onClick={() => setIsLibraryDialogOpen(true)}
              className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
            >
              <Library className="h-4 w-4" />
              Add from Library
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChallengeList 
          challenges={challenges} 
          onEdit={handleEdit}
        />
      </div>

      <CreateChallengeDialog 
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        editingChallenge={editingChallenge}
        onClose={() => {
          setEditingChallenge(null);
        }}
      />

      <AddFromLibraryDialog
        open={isLibraryDialogOpen}
        onOpenChange={setIsLibraryDialogOpen}
        onClose={() => setIsLibraryDialogOpen(false)}
      />
    </div>
  );
} 