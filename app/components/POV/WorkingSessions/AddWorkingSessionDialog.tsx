'use client'

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePOV } from '@/app/contexts/POVContext';
import { WorkingSession, SessionActivity } from '@/app/types/pov';
import { Calendar, Clock, FileText, Tag, GripVertical, ChevronDown, Plus, Lock } from 'lucide-react';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddWorkingSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSession?: WorkingSession | null;
  onClose?: () => void;
}

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
    
    // Debug log to check what sessions we're looking at
    console.log('Current POV sessions:', state.pov?.working_sessions);
    
    state.pov?.working_sessions?.forEach(session => {
      // Skip activities from the current session if editing
      if (editingSession && session.id === editingSession.id) {
        console.log('Skipping current session:', session.id);
        return;
      }
      
      // Debug log to check activities in each session
      console.log('Session activities:', session.session_activities);
      
      session.session_activities?.forEach(activity => {
        if (activity.decision_criteria_activity_id) {
          console.log('Adding activity to used set:', activity.decision_criteria_activity_id);
          usedActivities.add(activity.decision_criteria_activity_id);
        }
      });
    });
    
    // Debug log to check final set of used activities
    console.log('Used activities:', Array.from(usedActivities));
    
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-900 dark:text-gray-100">Activities</Label>
                    <div className="relative w-96">
                      <Button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                        variant="outline"
                      >
                        <span className="truncate">Add activities...</span>
                        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                      </Button>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700 max-h-[300px] overflow-y-auto">
                          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                          {state.pov?.decision_criteria?.map(dc => {
                            const usedActivities = getUsedActivities();
                            
                            return (
                              <div key={dc.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800">
                                <div 
                                  className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                  onClick={() => addActivitiesFromGroup(dc.id)}
                                >
                                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate mr-2">
                                    {dc.title}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addActivitiesFromGroup(dc.id);
                                    }}
                                  >
                                    Add All
                                  </Button>
                                </div>
                                {dc.activities?.map(activity => {
                                  const isAdded = activities.some(
                                    a => a.decision_criteria_activity_id === activity.id
                                  );
                                  const isUsedInOtherSession = usedActivities.has(activity.id);
                                  const isDisabled = isAdded || isUsedInOtherSession;
                                  
                                  return (
                                    <div
                                      key={activity.id}
                                      className={`px-4 py-2.5 text-sm cursor-pointer ${
                                        isDisabled 
                                          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/30' 
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                      }`}
                                      onClick={() => {
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
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 shrink-0">
                                          {isAdded ? '✓' : isUsedInOtherSession ? '⚡' : ''}
                                        </span>
                                        <span className="truncate">{activity.activity}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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