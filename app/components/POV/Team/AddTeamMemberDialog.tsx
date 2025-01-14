'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { POVTeamMember, POVTeamMemberWithDetails, TeamMember } from '@/app/types/pov';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { User, Plus, Briefcase, Mail, Building2, AlertCircle } from "lucide-react";
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMember?: POVTeamMemberWithDetails | null;
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
  const { addTeamMember, updateTeamMember } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingMembers, setExistingMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [formData, setFormData] = useState<Partial<POVTeamMember>>({
    name: '',
    email: '',
    role: '',
    organization: 'LM',
  });
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchExistingMembers = async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from('team_members')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setExistingMembers(data || []);
        setFilteredMembers(data || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
        setExistingMembers([]);
        setFilteredMembers([]);
      }
    };

    if (open) {
      fetchExistingMembers();
    }
  }, [open]);

  useEffect(() => {
    if (editingMember && open) {
        setFormData({
            ...editingMember.team_member,
            ...editingMember  // POV-specific overrides take precedence
        });
    }
  }, [editingMember, open]);

  const memberStatuses = filteredMembers.map(member => {
    const isInTeam = pov?.team_members?.some(tm => {
      return (tm.team_member?.id || tm.id) === member.id;
    });

    return {
      ...member,
      isInTeam
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
        if (editingMember) {
            // Update existing member
            await updateTeamMember(editingMember.id, {
                ...formData,
                pov_id: pov?.id
            });
        } else if (selectedMember && !isCreatingNew) {
            // Add existing member to POV
            await addTeamMember({
                ...selectedMember,
                pov_id: pov?.id
            });
        } else {
            // Create new member
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
      organization: 'LM',
    });
    setSelectedMember(null);
    setIsCreatingNew(false);
    onClose?.();
    onOpenChange(false);
  };

  const filterMembers = (value: string) => {
    if (!value) {
      setFilteredMembers(existingMembers);
      return;
    }

    const search = value.toLowerCase();
    const filtered = existingMembers.filter((member) => {
      const name = member.name.toLowerCase();
      const email = member.email.toLowerCase();
      const role = member.role.toLowerCase();
      const org = member.organization.toLowerCase();
      
      return name.includes(search) || 
             email.includes(search) || 
             role.includes(search) ||
             org.includes(search);
    });

    setFilteredMembers(filtered);
  };

  return (
    <Dialog modal={false} open={open} onOpenChange={handleClose}>
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
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-left font-normal"
                          >
                            {selectedMember 
                              ? `${selectedMember.name} - ${selectedMember.role}`
                              : "Select a team member..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" 
                          align="start"
                          sideOffset={5}
                        >
                          <Command className="border-none">
                            <CommandInput 
                              placeholder="Search members..." 
                              className="border-none focus:ring-0 dark:bg-gray-900"
                              onValueChange={filterMembers}
                            />
                            <CommandEmpty className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                              No team members found.
                            </CommandEmpty>
                            <CommandGroup className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                              {memberStatuses.map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={`${member.name} ${member.email} ${member.role}`}
                                  onSelect={() => {
                                    if (!member.isInTeam) {
                                      setSelectedMember(member);
                                      setIsCreatingNew(false);
                                      setOpenCombobox(false);
                                    }
                                  }}
                                  disabled={member.isInTeam}
                                  className={cn(
                                    "cursor-pointer",
                                    "text-gray-700 dark:text-gray-200",
                                    !member.isInTeam && "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                    "data-[selected=true]:bg-gray-50 dark:data-[selected=true]:bg-gray-800/50",
                                    "data-[selected=true]:text-gray-900 dark:data-[selected=true]:text-gray-100",
                                    member.isInTeam && "opacity-50 cursor-not-allowed",
                                    "transition-colors"
                                  )}
                                >
                                  <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-2">
                                      {member.isInTeam ? (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <AlertCircle className="h-4 w-4 text-amber-500" />
                                            </TooltipTrigger>
                                            <TooltipContent 
                                              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                              side="right"
                                            >
                                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                                Already a team member
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      ) : selectedMember?.id === member.id ? (
                                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      ) : (
                                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                      )}
                                      <span className="font-medium">{member.name}</span>
                                    </div>
                                    <div className="pl-10 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                      <Briefcase className="h-3 w-3 shrink-0" />
                                      <span>{member.role}</span>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                        organization: e.target.value as 'LM' | 'CUSTOMER' | 'PARTNER' 
                      })}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                      required
                    >
                      <option value="LM">LM</option>
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