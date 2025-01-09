'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamMember } from '@/app/types/pov';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { User, Plus, Briefcase, Mail, Building2 } from "lucide-react";
import { supabaseBrowser } from '@/app/lib/supabase/client';

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMember?: TeamMember | null;
  onClose?: () => void;
}

export default function AddTeamMemberDialog({ 
  open, 
  onOpenChange, 
  editingMember, 
  onClose 
}: AddTeamMemberDialogProps) {
  const { state } = usePOV();
  const { pov } = state;
  const { addTeamMember } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingMembers, setExistingMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    role: '',
    organization: 'INTERNAL',
  });

  useEffect(() => {
    const fetchExistingMembers = async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from('team_members')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }
        
        setExistingMembers(data || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
        setExistingMembers([]);
      }
    };

    if (open) {
      fetchExistingMembers();
    }
  }, [open]);

  useEffect(() => {
    if (editingMember && open) {
      setFormData(editingMember);
    }
  }, [editingMember, open]);

  // Filter out existing team members from the dropdown options
  const availableMembers = existingMembers.filter(member => 
    !pov?.team_members?.some(tm => tm.id === member.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Check if member is already in the team
    if (selectedMember && pov?.team_members?.some(tm => tm.id === selectedMember.id)) {
      alert('This team member is already part of the POV.');
      return;
    }

    // For new members, check if email already exists in current team
    if (isCreatingNew && pov?.team_members?.some(tm => tm.email === formData.email)) {
      alert('A team member with this email is already part of the POV.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedMember && !isCreatingNew) {
        await addTeamMember({
          ...selectedMember,
          pov_id: pov?.id
        });
      } else {
        await addTeamMember({
          ...formData,
          pov_id: pov?.id
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error saving team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      organization: 'INTERNAL',
    });
    setSelectedMember(null);
    setIsCreatingNew(false);
    onClose?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <div className="space-y-4">
              {!editingMember && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100">Select existing member or create new</Label>
                    <div className="flex gap-2 mt-2">
                      <select
                        value={selectedMember?.id || ''}
                        onChange={(e) => {
                          const member = availableMembers.find(m => m.id === e.target.value);
                          setSelectedMember(member || null);
                          setIsCreatingNew(!member);
                        }}
                        className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                      >
                        <option value="">Select a team member...</option>
                        {availableMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreatingNew(true);
                          setSelectedMember(null);
                        }}
                        className="bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show form fields only when creating new or editing */}
              {(isCreatingNew || editingMember) && (
                <div className="grid gap-4">
                  {/* Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">Name</Label>
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      placeholder="Enter name"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label htmlFor="role" className="text-gray-900 dark:text-gray-100">Role</Label>
                    </div>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      placeholder="Enter role"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email</Label>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label htmlFor="organization" className="text-gray-900 dark:text-gray-100">Organization</Label>
                    </div>
                    <select
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        organization: e.target.value as 'INTERNAL' | 'CUSTOMER' | 'PARTNER' 
                      })}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                      required
                    >
                      <option value="INTERNAL">Internal</option>
                      <option value="CUSTOMER">Customer</option>
                      <option value="PARTNER">Partner</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3">
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
              >
                {isSubmitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Add Member'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 