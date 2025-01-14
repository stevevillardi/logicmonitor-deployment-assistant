'use client'

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePOV } from '@/app/contexts/POVContext';
import { WorkingSession, SessionActivity } from '@/app/types/pov';
import { Calendar, Clock, FileText, Tag, GripVertical, ChevronDown, Plus, Lock, ChevronsUpDown, ListChecks, ClipboardList, AlertCircle, Check } from 'lucide-react';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { devLog } from '../../Shared/utils/debug';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";

interface AddWorkingSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSession?: WorkingSession | null;
  onClose?: () => void;
}

// Update the type for filteredActivities
type FilteredDC = {
  id: string;
  title: string;
  activities?: {
    id: string;
    activity: string;
    order_index: number;
    status?: string;
  }[];
}[];

export default function AddWorkingSessionDialog({ 
  open, 
  onOpenChange,
  editingSession,
  onClose 
}: AddWorkingSessionDialogProps) {
  const { state } = usePOV();
  const { addWorkingSession, updateWorkingSession } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkingSession>>({
    title: '',
    status: 'SCHEDULED',
    session_date: '',
    duration: 60,
    notes: '',
    session_activities: [],
  });

  const initialFormState: Partial<WorkingSession> = {
    title: '',
    status: 'SCHEDULED',
    session_date: new Date().toISOString(),
    duration: 60,
    notes: '',
    session_activities: [],
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setActivities([]);
    setFilteredActivities(null);
    setIsSubmitting(false);
  };

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Get all available activities from decision criteria
  const availableActivities = state.pov?.decision_criteria?.flatMap(dc => 
    dc.activities?.map(activity => ({
      decision_criteria_activity_id: activity.id,
      status: 'PENDING' as const,
      display_order: 0,
      notes: '',
    })) ?? []
  ) ?? [];

  // Setup drag and drop
  const [activitiesRef, activities, setActivities] = useDragAndDrop<HTMLDivElement, SessionActivity>(
    formData.session_activities || [], 
    {
      group: 'activities',
      dragHandle: '.drag-handle'
    }
  );

  // Set initial data when editing
  useEffect(() => {
    if (editingSession && open) {
      setFormData(editingSession);
      setActivities(editingSession.session_activities || []);
    } else if (!open) {
      resetForm();
    }
  }, [editingSession, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sessionData = {
        ...formData,
        pov_id: state.pov?.id as string,
        session_activities: activities.map((activity, index) => ({
          ...activity,
          display_order: index,
        })),
      };

      if (editingSession) {
        await updateWorkingSession(editingSession.id, sessionData as WorkingSession);
      } else {
        await addWorkingSession(sessionData);
      }

      onOpenChange(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving working session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUsedActivities = () => {
    const usedActivities = new Set<string>();
    
    state.pov?.working_sessions?.forEach(session => {
      // Skip activities from the current session if editing
      if (editingSession && session.id === editingSession.id) {
        devLog('Skipping current session:', session.id);
        return;
      }
      
      session.session_activities?.forEach(activity => {
        if (activity.decision_criteria_activity_id) {
          usedActivities.add(activity.decision_criteria_activity_id);
        }
      });
    });
    
    return usedActivities;
  };

  const addActivitiesFromGroup = (dcId: string) => {
    const dc = state.pov?.decision_criteria?.find(c => c.id === dcId);
    if (!dc?.activities) return;

    const usedActivities = getUsedActivities();
    const newActivities = dc.activities
      .filter(activity => {
        // Only add activities that aren't already added or used in other sessions
        const isAdded = activities.some(a => a.decision_criteria_activity_id === activity.id);
        const isUsedInOtherSession = usedActivities.has(activity.id);
        return !isAdded && !isUsedInOtherSession;
      })
      .map(activity => ({
        decision_criteria_activity_id: activity.id,
        status: 'PENDING' as const,
        display_order: 0,
        notes: '',
      }));

    if (newActivities.length > 0) {
      setActivities([...activities, ...newActivities]);
    }
  };

  // Add state for filtered activities
  const [filteredActivities, setFilteredActivities] = useState<FilteredDC | null>(null);

  // Update the filter function
  const filterActivities = (value: string) => {
    if (!state.pov?.decision_criteria) return;
    
    if (!value) {
      setFilteredActivities(null); // Show all activities
      return;
    }

    const search = value.toLowerCase();
    const filtered = state.pov.decision_criteria.reduce<FilteredDC>((acc, dc) => {
      // Check if decision criteria title matches
      const titleMatches = dc.title.toLowerCase().includes(search);
      
      // Filter activities that match the search
      const matchingActivities = dc.activities?.filter(activity => {
        const activityText = activity.activity.toLowerCase();
        return activityText.includes(search);
      });

      // Include the decision criteria if either title matches or has matching activities
      if (titleMatches || matchingActivities?.length) {
        acc.push({
          id: dc.id,
          title: dc.title,
          // If title matches, include all activities, otherwise only matching ones
          activities: titleMatches ? dc.activities : matchingActivities
        });
      }
      return acc;
    }, []);

    setFilteredActivities(filtered);
  };

  return (
    <Dialog modal={false} open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 h-[85vh] p-0 flex flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b border-blue-100 dark:border-gray-700">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            {editingSession ? 'Edit Session' : 'Add Session'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <div className="space-y-4">
              <div className="grid gap-4">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">Title</Label>
                  </div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    placeholder="Enter session title"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="status" className="text-gray-900 dark:text-gray-100">Status</Label>
                  </div>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      status: e.target.value as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
                    })}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                    required
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Session Date */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="session_date" className="text-gray-900 dark:text-gray-100">Session Date</Label>
                  </div>
                  <Input
                    id="session_date"
                    type="date"
                    value={formData.session_date ? new Date(formData.session_date).toLocaleDateString('en-CA') : ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      session_date: new Date(e.target.value + 'T12:00:00').toISOString()
                    })}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="duration" className="text-gray-900 dark:text-gray-100">Duration (minutes)</Label>
                  </div>
                  <Input
                    id="duration"
                    type="number"
                    min={15}
                    step={15}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="notes" className="text-gray-900 dark:text-gray-100">Notes</Label>
                  </div>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    placeholder="Enter session notes"
                    rows={3}
                  />
                </div>

                {/* Activities Section */}
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-gray-100">Activities</Label>
                  <div className="w-full">
                    <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={isDropdownOpen}
                          className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-left font-normal"
                        >
                          <span className="truncate">Add activities...</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900/50 shadow-lg dark:shadow-blue-900/20 rounded-lg overflow-hidden" 
                        align="start"
                        sideOffset={5}
                      >
                        <Command className="border-none">
                          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/20">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start text-sm bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-800 dark:hover:text-blue-200"
                              onClick={() => {
                                const newActivity: SessionActivity = {
                                  status: 'PENDING',
                                  display_order: activities.length,
                                  notes: '',
                                  activity: 'New Activity',
                                };
                                setActivities([...activities, newActivity]);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create Custom Activity
                            </Button>
                          </div>

                          <CommandInput 
                            placeholder="Search activities..." 
                            className="border-none focus:ring-0 dark:bg-gray-900"
                            onValueChange={filterActivities}
                          />
                          <CommandEmpty className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                            No activities found.
                          </CommandEmpty>

                          <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                            {(filteredActivities || state.pov?.decision_criteria)?.map(dc => {
                              const usedActivities = getUsedActivities();
                              
                              return (
                                <div key={dc.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800">
                                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <ListChecks className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {dc.title}
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2.5 text-xs shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 ml-2"
                                      onClick={() => addActivitiesFromGroup(dc.id)}
                                    >
                                      Add All
                                    </Button>
                                  </div>

                                  <CommandGroup>
                                    {dc.activities?.map(activity => {
                                      const isAdded = activities.some(
                                        a => a.decision_criteria_activity_id === activity.id
                                      );
                                      const isUsedInOtherSession = usedActivities.has(activity.id);
                                      const isDisabled = isAdded || isUsedInOtherSession;
                                      
                                      return (
                                        <CommandItem
                                          key={activity.id}
                                          value={`${activity.activity} ${dc.title}`}
                                          onSelect={() => {
                                            if (!isDisabled) {
                                              const newActivity = {
                                                decision_criteria_activity_id: activity.id,
                                                status: 'PENDING' as const,
                                                display_order: 0,
                                                notes: '',
                                              };
                                              setActivities([...activities, newActivity]);
                                              setIsDropdownOpen(false);
                                            }
                                          }}
                                          disabled={isDisabled}
                                          className={cn(
                                            "cursor-pointer",
                                            "text-gray-700 dark:text-gray-200",
                                            !isDisabled && "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100",
                                            "data-[selected=true]:bg-gray-50 dark:data-[selected=true]:bg-gray-800/50",
                                            "data-[selected=true]:text-gray-900 dark:data-[selected=true]:text-gray-100",
                                            isDisabled && "opacity-50 cursor-not-allowed",
                                            "transition-colors"
                                          )}
                                        >
                                          <div className="flex flex-col gap-1 w-full min-w-0">
                                            <div className="flex items-center gap-2">
                                              {isAdded ? (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger>
                                                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent 
                                                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                                      side="right"
                                                    >
                                                      <p className="text-xs text-gray-700 dark:text-gray-300">
                                                        Already added to this session
                                                      </p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              ) : isUsedInOtherSession ? (
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
                                                        Used in another working session
                                                      </p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              ) : (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger>
                                                      <ClipboardList className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent 
                                                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                                      side="right"
                                                    >
                                                      <p className="text-xs text-gray-700 dark:text-gray-300">
                                                        Available activity
                                                      </p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                              <span className="truncate">{activity.activity}</span>
                                            </div>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </div>
                              );
                            })}
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div ref={activitiesRef} className="space-y-2">
                    {activities.map((activity, index) => (
                      <div 
                        key={activity.decision_criteria_activity_id || `custom-${index}`}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md"
                      >
                        <GripVertical className="drag-handle cursor-move h-4 w-4 text-gray-400 flex-shrink-0" />
                        {!activity.decision_criteria_activity_id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={activity.activity || ''}
                              placeholder="Enter activity name"
                              onChange={(e) => {
                                const newActivities = [...activities];
                                newActivities[index] = {
                                  ...activity,
                                  activity: e.target.value
                                };
                                setActivities(newActivities);
                              }}
                              className="flex-1 text-sm border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-2">
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                              {state.pov?.decision_criteria?.find(dc => 
                                dc.activities?.some(a => a.id === activity.decision_criteria_activity_id)
                              )?.activities?.find(a => a.id === activity.decision_criteria_activity_id)?.activity}
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Lock className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                  <p className="text-xs text-gray-700 dark:text-gray-300">Activities associated with a decision criteria are read only. Update the decision criteria to modify associated activities.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => {
                            const newActivities = activities.filter((_, i) => i !== index);
                            setActivities(newActivities);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 px-6 py-4 border-t border-blue-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
              >
                {isSubmitting ? 'Saving...' : editingSession ? 'Save Changes' : 'Add Session'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 