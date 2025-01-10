'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import TeamMemberList from '@/app/components/POV/Team/TeamMemberList';
import AddTeamMemberDialog from '@/app/components/POV/Team/AddTeamMemberDialog';
import { TeamMember } from '@/app/types/pov';
import { devLog } from '../../Shared/utils/debug';

export default function Team() {
  const { state } = usePOV();
  const pov = state.pov;
  const teamMembers = pov?.team_members || [];
  devLog('Team Members in state:', teamMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsAddDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingMember(null);
      }, 0);
    }
  };

  const handleAddNewClick = () => {
    setEditingMember(null);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Team Members
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage team members for {pov?.title}
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeamMemberList 
          members={pov?.team_members || []} 
          onEdit={handleEdit}
        />
      </div>

      <AddTeamMemberDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        editingMember={editingMember}
        onClose={() => {
          setEditingMember(null);
        }}
      />
    </div>
  );
} 