'use client'

import { TeamMember, POVTeamMemberWithDetails } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, User, Mail, Building2 } from 'lucide-react';
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
import { getEffectiveMemberDetails } from '@/app/lib/utils';

interface TeamMemberListProps {
  members: POVTeamMemberWithDetails[];
  onEdit: (member: POVTeamMemberWithDetails) => void;
}

export default function TeamMemberList({ members, onEdit }: TeamMemberListProps) {
  devLog('Members passed to list:', members);
  const { deleteTeamMember } = usePOVOperations();

  const handleDelete = async (memberId: string) => {
    try {
      await deleteTeamMember(memberId);
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  if (!members?.length) {
    return (
      <Card className="col-span-1 md:col-span-2 p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No team members</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding team members
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {members.map((member) => {
        const details = getEffectiveMemberDetails(member);
        return (
          <Card
            key={member.id}
            className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                {/* Name and Role */}
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {details.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800"
                    >
                      {details.role}
                    </Badge>
                  </div>
                </div>

                {/* Organization */}
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {details.organization}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {details.email}
                  </span>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => onEdit(member)}
                  className="h-8 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleDelete(member.id)}
                  className="h-8 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
                >
                  <Trash className="h-4 w-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
} 