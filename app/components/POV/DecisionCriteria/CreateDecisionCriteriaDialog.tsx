'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Minus, Plus } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { POVDecisionCriteria } from '@/app/types/pov';
import { AITextarea } from '@/app/components/ui/ai-textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const inputBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100";
const buttonBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300";

interface FormData {
  title: string;
  success_criteria: string;
  use_case: string;
  categories: string[];
  activities: Array<{ activity: string; order_index: number }>;
  addToLibrary?: boolean;
}

interface CreateDecisionCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCriteria?: POVDecisionCriteria | null;
  onClose?: () => void;
}

export default function CreateDecisionCriteriaDialog({
  open,
  onOpenChange,
  editingCriteria,
  onClose
}: CreateDecisionCriteriaDialogProps) {
  const { state } = usePOV();
  const { pov } = state;
  const { addDecisionCriteria, updateDecisionCriteria } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    success_criteria: '',
    use_case: '',
    categories: [],
    activities: [],
    addToLibrary: true
  });

  useEffect(() => {
    if (editingCriteria) {
      setFormData({
        title: editingCriteria.title,
        success_criteria: editingCriteria.success_criteria,
        use_case: editingCriteria.use_case || '',
        categories: editingCriteria.categories?.map(c => c.category) || [],
        activities: editingCriteria.activities?.map(a => ({
          id: a.id,
          activity: a.activity,
          order_index: a.order_index
        })) || [],
        addToLibrary: false
      });
    }
  }, [editingCriteria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingCriteria) {
        await updateDecisionCriteria(editingCriteria.id, {
          ...formData,
          pov_id: pov?.id
        });
      } else {
        await addDecisionCriteria({
          ...formData,
          pov_id: pov?.id
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error saving decision criteria:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      success_criteria: '',
      use_case: '',
      categories: [],
      activities: [],
      addToLibrary: true
    });
    onClose?.();
    onOpenChange(false);
  };

  return (
    <Dialog modal={false} open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 px-6 py-4">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            {editingCriteria ? 'Edit Decision Criteria' : 'Create New Decision Criteria'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
            Fill in the details below to {editingCriteria ? 'update' : 'create'} your decision criteria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {!editingCriteria && (
                <div className="bg-gradient-to-r from-[#040F4B]/5 to-transparent dark:from-[#040F4B]/20 border border-[#040F4B]/10 dark:border-[#040F4B]/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#040F4B] dark:text-gray-100">
                        Add to Content Library
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Make this criteria available as a template for future POVs
                      </p>
                    </div>
                    <Switch
                      id="library-mode"
                      checked={formData.addToLibrary}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, addToLibrary: checked }))}
                      className="data-[state=checked]:bg-blue-500 [&:not([data-state=checked])]:border-gray-300 dark:[&:not([data-state=checked])]:border-gray-700"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={inputBaseStyles}
                    placeholder="Enter title"
                    required
                  />
                </div>

                {/* Success Criteria */}
                <div className="space-y-2">
                  <AITextarea
                    label="Success Criteria"
                    value={formData.success_criteria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, success_criteria: value }))}
                    className={`min-h-[100px] ${inputBaseStyles}`}
                    placeholder="Enter success criteria"
                    reason="Enhance success criteria to be more specific and measurable"
                    required
                  />
                </div>

                {/* Use Case */}
                <div className="space-y-2">
                  <AITextarea
                    label="Use Case"
                    value={formData.use_case}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, use_case: value }))}
                    className={`min-h-[100px] ${inputBaseStyles}`}
                    placeholder="Enter use case"
                    reason="Enhance use case to be more specific and relatable"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Categories</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        categories: [...prev.categories, '']
                      }))}
                      className={buttonBaseStyles}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.categories.map((category, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={category}
                          onChange={(e) => {
                            const newCategories = [...formData.categories];
                            newCategories[index] = e.target.value;
                            setFormData(prev => ({ ...prev, categories: newCategories }));
                          }}
                          className={`flex-1 ${inputBaseStyles}`}
                          placeholder="Enter category"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newCategories = formData.categories.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, categories: newCategories }));
                          }}
                          className={buttonBaseStyles}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Portal Activities</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        activities: [...prev.activities, { activity: '', order_index: prev.activities.length }]
                      }))}
                      className={buttonBaseStyles}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.activities.map((activity, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={activity.activity}
                          onChange={(e) => {
                            const newActivities = [...formData.activities];
                            newActivities[index] = { ...activity, activity: e.target.value };
                            setFormData(prev => ({ ...prev, activities: newActivities }));
                          }}
                          className={`flex-1 ${inputBaseStyles}`}
                          placeholder="Enter activity"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newActivities = formData.activities.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, activities: newActivities }));
                          }}
                          className={buttonBaseStyles}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-blue-100 dark:border-gray-700 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className={buttonBaseStyles}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCriteria ? 'Save Changes' : 'Create Criteria'}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 