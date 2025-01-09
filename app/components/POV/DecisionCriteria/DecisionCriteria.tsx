'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Library } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import DecisionCriteriaList from './DecisionCriteriaList';
import CreateDecisionCriteriaDialog from './CreateDecisionCriteriaDialog';
import AddFromLibraryDialog from './AddFromLibraryDialog';
import { POVDecisionCriteria } from '@/app/types/pov';

export default function DecisionCriteria() {
  const { state } = usePOV();
  const { pov } = state;
  const decisionCriteria = pov?.decision_criteria || [];
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<POVDecisionCriteria | null>(null);

  const handleEdit = (criteria: POVDecisionCriteria) => {
    setEditingCriteria(criteria);
    setIsCreateDialogOpen(true);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingCriteria(null);
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
              Decision Criteria
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage decision criteria for {pov?.title}
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
        <DecisionCriteriaList 
          decisionCriteria={decisionCriteria} 
          onEdit={handleEdit}
        />
      </div>

      <CreateDecisionCriteriaDialog 
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        editingCriteria={editingCriteria}
        onClose={() => {
          setEditingCriteria(null);
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