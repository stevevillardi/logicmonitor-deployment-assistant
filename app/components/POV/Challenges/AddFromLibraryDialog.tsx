'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Challenge } from '@/app/types/pov';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabaseBrowser } from '@/app/lib/supabase/client';

const inputBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400";
const buttonBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300";

interface LibraryTemplate extends Omit<Challenge, 'categories' | 'outcomes'> {
  categories: Array<{ category: string }>;
  outcomes: Array<{ outcome: string; order_index: number }>;
}

interface AddFromLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}

export default function AddFromLibraryDialog({
  open,
  onOpenChange,
  onClose
}: AddFromLibraryDialogProps) {
  const { state } = usePOV();
  const { pov } = state;
  const { addChallenge } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [libraryTemplates, setLibraryTemplates] = useState<LibraryTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibraryTemplates = async () => {
      const { data, error } = await supabaseBrowser
        .from('challenges')
        .select(`
          *,
          categories:challenge_categories(category),
          outcomes:challenge_outcomes(outcome, order_index)
        `)
        .order('title');
      
      if (!error && data) {
        setLibraryTemplates(data);
      }
    };

    fetchLibraryTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedTemplateId) return;

    setIsSubmitting(true);
    try {
      const template = libraryTemplates.find(c => c.id === selectedTemplateId);

      if (template) {
        await addChallenge({
          title: template.title,
          challenge_description: template.challenge_description,
          business_impact: template.business_impact,
          pov_id: pov?.id,
          status: 'OPEN',
          selectedTemplateId,
          example: template.example,
          categories: template.categories.map(c => c.category),
          outcomes: template.outcomes.map(o => ({
            outcome: o.outcome,
            order_index: o.order_index
          }))
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error adding challenge from library:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplateId(null);
    onClose?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            Add Challenge from Library
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
            Select a challenge from the content library to add to your POV.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label>Select Challenge</Label>
              <Select
                value={selectedTemplateId || ''}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger className={inputBaseStyles}>
                  <SelectValue placeholder="Select from library..." />
                </SelectTrigger>
                <SelectContent className={`${inputBaseStyles} border-0`}>
                  {libraryTemplates.map((challenge) => (
                    <SelectItem 
                      key={challenge.id} 
                      value={challenge.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {challenge.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplateId && (
              <div className="space-y-4 p-4 rounded-md border bg-white dark:bg-gray-900">
                <h3 className="font-medium text-[#040F4B] dark:text-gray-100">Preview:</h3>
                {(() => {
                  const template = libraryTemplates.find(c => c.id === selectedTemplateId);
                  return template ? (
                    <div className="space-y-4 text-sm">
                      <div className="space-y-2">
                        <p className="font-medium text-gray-700 dark:text-gray-300">Description</p>
                        <p className="text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-md">
                          {template.challenge_description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-gray-700 dark:text-gray-300">Business Impact</p>
                        <p className="text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-md">
                          {template.business_impact}
                        </p>
                      </div>

                      {template.categories.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-gray-700 dark:text-gray-300">Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {template.categories.map((c, i) => (
                              <span 
                                key={i}
                                className="px-2 py-1 rounded-md text-xs bg-[#040F4B]/10 dark:bg-[#040F4B]/20 text-[#040F4B] dark:text-blue-300"
                              >
                                {c.category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {template.outcomes.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-gray-700 dark:text-gray-300">Desired Outcomes</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                            {template.outcomes
                              .sort((a, b) => a.order_index - b.order_index)
                              .map((o, i) => (
                                <li key={i} className="pl-2">
                                  {o.outcome}
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3">
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
                disabled={isSubmitting || !selectedTemplateId}
                className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Challenge
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