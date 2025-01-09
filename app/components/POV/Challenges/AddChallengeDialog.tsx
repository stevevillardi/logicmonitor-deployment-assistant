'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { POVChallenge } from '@/app/types/pov';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { AlertCircle, MessageSquare, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabaseBrowser } from '@/app/lib/supabase/client';

interface AddChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingChallenge?: POVChallenge | null;
  onClose?: () => void;
}

export default function AddChallengeDialog({ 
  open, 
  onOpenChange, 
  editingChallenge, 
  onClose 
}: AddChallengeDialogProps) {
  const { state } = usePOV();
  const { pov } = state;
  const { addChallenge, updateChallenge } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<POVChallenge>>({
    title: '',
    challenge_description: '',
    business_impact: '',
    status: 'OPEN',
  });
  const [existingChallenges, setExistingChallenges] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  useEffect(() => {
    if (editingChallenge && open) {
      setFormData(editingChallenge);
    }
  }, [editingChallenge, open]);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data, error } = await supabaseBrowser
        .from('challenges')
        .select('*')
        .eq('is_template', true)
        .order('title');
      
      if (!error && data) {
        setExistingChallenges(data);
      }
    };

    fetchChallenges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingChallenge) {
        await updateChallenge(editingChallenge.id, {
          ...formData,
          pov_id: pov?.id
        });
      } else {
        await addChallenge({
          ...formData,
          pov_id: pov?.id,
          saveAsTemplate
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error saving challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      challenge_description: '',
      business_impact: '',
      status: 'OPEN',
    });
    onClose?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            {editingChallenge ? 'Edit Challenge' : 'Add Challenge'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            {!editingChallenge && (
              <div className="mb-6 space-y-4">
                <div>
                  <Label>Select existing challenge template (optional)</Label>
                  <Select
                    value={selectedTemplate || ''}
                    onValueChange={(value) => {
                      setSelectedTemplate(value);
                      const template = existingChallenges.find(c => c.id === value);
                      if (template) {
                        setFormData({
                          title: template.title,
                          challenge_description: template.challenge_description,
                          business_impact: template.business_impact,
                          status: 'OPEN'
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {existingChallenges.map((challenge) => (
                        <SelectItem key={challenge.id} value={challenge.id}>
                          {challenge.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="template-mode"
                    checked={saveAsTemplate}
                    onCheckedChange={setSaveAsTemplate}
                  />
                  <Label htmlFor="template-mode">
                    Save as reusable challenge template
                  </Label>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">Title</Label>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  placeholder="Enter challenge title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">Description</Label>
                </div>
                <Textarea
                  id="description"
                  value={formData.challenge_description}
                  onChange={(e) => setFormData({ ...formData, challenge_description: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 min-h-[100px]"
                  placeholder="Describe the challenge"
                  required
                />
              </div>

              {/* Business Impact */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <Label htmlFor="impact" className="text-gray-900 dark:text-gray-100">Business Impact</Label>
                </div>
                <Textarea
                  id="impact"
                  value={formData.business_impact}
                  onChange={(e) => setFormData({ ...formData, business_impact: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 min-h-[100px]"
                  placeholder="Describe the business impact"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <Label htmlFor="status" className="text-gray-900 dark:text-gray-100">Status</Label>
                </div>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
                  })}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                  required
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
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
                {isSubmitting ? 'Saving...' : editingChallenge ? 'Save Changes' : 'Add Challenge'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 