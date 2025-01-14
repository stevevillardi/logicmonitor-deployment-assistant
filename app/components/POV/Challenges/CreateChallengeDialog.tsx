'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { POVChallenge } from '@/app/types/pov';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Plus, Minus, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AITextarea } from "@/app/components/ui/ai-textarea";
import { toast } from 'react-hot-toast';

const DEFAULT_CHALLENGE_CATEGORIES = [
  "Agentless Monitoring",
  "Alert Routing",
  "Cloud Monitoring",
  "Correlated Insights",
  "Customer Partnership",
  "Resource Auto-Discovery",
  "Ecosystem Integration",
  "Enterprise Capabilities",
  "Full-Stack Visibility",
  "High-Availability",
  "Hybrid Monitoring",
  "Predictive Analytics",
  "Real-Time Visibility",
  "Future-Proof/Roadmap Details",
  "Scalability",
  "Service and Ops Views",
  "Versatility",
  "Actionable Alerts"
];

const inputBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400";
const buttonBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300";

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingChallenge?: POVChallenge | null;
  onClose?: () => void;
}

interface FormData {
  title: string;
  challenge_description: string;
  business_impact: string;
  example: string;
  categories: string[];
  outcomes: string[];
  addToLibrary?: boolean;
}

export default function CreateChallengeDialog({
  open,
  onOpenChange,
  editingChallenge,
  onClose
}: CreateChallengeDialogProps) {
  const { state } = usePOV();
  const { pov } = state;
  const { addChallenge, updateChallenge } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    challenge_description: '',
    business_impact: '',
    example: '',
    categories: [],
    outcomes: [],
    addToLibrary: true
  });

  useEffect(() => {
    if (editingChallenge) {
      const challenge = pov?.challenges?.find(c => c.id === editingChallenge.id);
      
      if (challenge) {
        setFormData({
          title: challenge.title || '',
          challenge_description: challenge.challenge_description || '',
          business_impact: challenge.business_impact || '',
          example: challenge.example || '',
          categories: challenge.categories?.map(c => c.category) || [],
          outcomes: challenge.outcomes
            ?.sort((a, b) => a.order_index - b.order_index)
            .map(o => o.outcome) || [],
          addToLibrary: false
        });
      }
    }
  }, [editingChallenge, pov]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title || !formData.challenge_description || !formData.business_impact || 
        !formData.categories.length || !formData.outcomes.length) {
        toast.error('Please fill in all required fields: Title, Description, Business Impact, Categories, and at least one Outcome');
        return;
    }

    setIsSubmitting(true);
    try {
      if (editingChallenge) {
        await updateChallenge(editingChallenge.id, {
          ...formData,
          pov_id: pov?.id,
          status: editingChallenge.status,
          outcomes: formData.outcomes.map((outcome, index) => ({
            outcome,
            order_index: index
          }))
        });
      } else {
        await addChallenge({
          ...formData,
          pov_id: pov?.id,
          status: 'OPEN',
          outcomes: formData.outcomes.map((outcome, index) => ({
            outcome,
            order_index: index
          }))
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
      example: '',
      categories: [],
      outcomes: [],
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
            {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
            Fill in the details below to {editingChallenge ? 'update' : 'create'} your challenge.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {!editingChallenge && (
                <div className="bg-gradient-to-r from-[#040F4B]/5 to-transparent dark:from-[#040F4B]/20 border border-[#040F4B]/10 dark:border-[#040F4B]/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#040F4B] dark:text-gray-100">
                        Add to Content Library
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Make this challenge available as a template for future POVs for all SE team members to use.
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
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter challenge title"
                    className={inputBaseStyles}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <AITextarea
                    label="Challenge Description"
                    labelSuffix={<span className="text-red-500">*</span>}
                    id="challenge_description"
                    value={formData.challenge_description}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, challenge_description: value }))}
                    placeholder="Describe the challenge"
                    reason="Enhance challenge description to be more precise and highlight key pain points"
                    className={inputBaseStyles}
                  />
                </div>

                {/* Business Impact */}
                <div className="space-y-2">
                  <AITextarea
                    label="Business Impact"
                    labelSuffix={<span className="text-red-500">*</span>}
                    id="business_impact"
                    value={formData.business_impact}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, business_impact: value }))}
                    placeholder="Describe the business impact"
                    reason="Enhance business impact description to focus on the negative impact of not having the solution"
                    className={inputBaseStyles}
                  />
                </div>

                {/* Example */}
                <div className="space-y-2">
                  <AITextarea
                    label="Example"
                    id="example"
                    value={formData.example}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, example: value }))}
                    placeholder="Provide an example"
                    reason="Enhance example to be more concrete and relatable to common use cases"
                    className={inputBaseStyles}
                  />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="pr-2">Categories (Required Capabilities) <span className="text-red-500">*</span></Label>
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
                        <select
                          value={category}
                          onChange={(e) => {
                            const newCategories = [...formData.categories];
                            newCategories[index] = e.target.value;
                            setFormData(prev => ({ ...prev, categories: newCategories }));
                          }}
                          className={`flex-1 h-10 rounded-md border ${inputBaseStyles}`}
                        >
                          <option value="">Select category...</option>
                          {DEFAULT_CHALLENGE_CATEGORIES
                            .filter(cat => !formData.categories.includes(cat) || cat === category)
                            .map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))
                          }
                        </select>
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

                {/* Outcomes */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="pr-2">Desired Outcomes <span className="text-red-500">*</span></Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        outcomes: [...prev.outcomes, '']
                      }))}
                      className={buttonBaseStyles}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Outcome
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.outcomes.map((outcome, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={outcome}
                          onChange={(e) => {
                            const newOutcomes = [...formData.outcomes];
                            newOutcomes[index] = e.target.value;
                            setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
                          }}
                          placeholder="Enter desired outcome"
                          className={`flex-1 ${inputBaseStyles}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOutcomes = formData.outcomes.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
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
                    {editingChallenge ? 'Save Changes' : 'Create Challenge'}
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