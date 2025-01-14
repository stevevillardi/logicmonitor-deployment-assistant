'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, ListChecks, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const inputBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100";
const buttonBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300";

interface LibraryTemplate {
  id: string;
  title: string;
  success_criteria: string;
  use_case?: string;
  categories: Array<{ category: string }>;
  activities: Array<{ activity: string; order_index: number }>;
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
  const { addDecisionCriteria } = usePOVOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [libraryTemplates, setLibraryTemplates] = useState<LibraryTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchLibraryTemplates = async () => {
      const { data, error } = await supabaseBrowser
        .from('decision_criteria')
        .select(`
          id,
          title,
          success_criteria,
          use_case,
          categories:decision_criteria_categories(category),
          activities:decision_criteria_activities(activity, order_index)
        `)
        .order('title');
      
      if (!error && data) {
        setLibraryTemplates(data as LibraryTemplate[]);
      }
    };

    fetchLibraryTemplates();
  }, []);

  const filterTemplates = (value: string, templates: LibraryTemplate[]) => {
    const search = value.toLowerCase();
    return templates.filter((template) => {
        const title = template.title.toLowerCase();
        const criteria = template.success_criteria?.toLowerCase() || '';
        
        // Exact match should be prioritized
        if (title === search) return true;
        
        // Then check for includes
        return title.includes(search) || 
               criteria.includes(search) ||
               template.categories.some(c => c.category.toLowerCase().includes(search));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedTemplateId) return;

    setIsSubmitting(true);
    try {
      const template = libraryTemplates.find(c => c.id === selectedTemplateId);
      if (template) {
        await addDecisionCriteria({
          title: template.title,
          success_criteria: template.success_criteria,
          use_case: template.use_case,
          pov_id: pov?.id,
          status: 'PENDING',
          categories: template.categories?.map(c => c.category),
          activities: template.activities?.map(a => ({
            activity: a.activity,
            order_index: a.order_index
          }))
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error adding decision criteria from library:', error);
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
        <DialogContent className="max-w-[95vw] w-full sm:max-w-3xl lg:max-w-4xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
          <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
              Add Decision Criteria from Library
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label>Select Decision Criteria</Label>
                <Popover modal={true} open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-left font-normal"
                    >
                      {selectedTemplateId 
                        ? libraryTemplates.find(t => t.id === selectedTemplateId)?.title 
                        : "Select from library..."}
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
                        placeholder="Search templates..." 
                        className="border-none focus:ring-0 dark:bg-gray-900"
                        onValueChange={(search) => {
                          const filtered = filterTemplates(search, libraryTemplates);
                        }}
                      />
                      <CommandEmpty className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                        No templates found.
                      </CommandEmpty>
                      <ScrollArea className="max-h-[300px] overflow-auto">
                        <CommandGroup className="scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                          {libraryTemplates.map((template) => (
                            <CommandItem
                              key={template.id}
                              value={template.title}
                              onSelect={() => {
                                setSelectedTemplateId(template.id);
                                setPopoverOpen(false);
                              }}
                              className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 data-[highlighted]:bg-gray-50 dark:data-[highlighted]:bg-gray-800 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100 transition-colors"
                            >
                              <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-center gap-2">
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      selectedTemplateId === template.id 
                                        ? "opacity-100 text-blue-600 dark:text-blue-400" 
                                        : "opacity-0"
                                    )}
                                  />
                                  <ListChecks className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="font-medium">{template.title}</span>
                                </div>
                                <div className="pl-10 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                                  <span>{template.success_criteria}</span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </ScrollArea>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedTemplateId && (
                <div className="space-y-4 p-4 rounded-md border bg-white dark:bg-gray-900 overflow-x-auto">
                  <h3 className="font-medium text-[#040F4B] dark:text-gray-100">Preview:</h3>
                  {(() => {
                    const template = libraryTemplates.find(c => c.id === selectedTemplateId);
                    return template ? (
                      <div className="space-y-4 text-sm">
                        <div className="space-y-2">
                          <p className="font-medium text-gray-700 dark:text-gray-300">Success Criteria</p>
                          <p className="text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-md">
                            {template.success_criteria}
                          </p>
                        </div>

                        {template.use_case && (
                          <div className="space-y-2">
                            <p className="font-medium text-gray-700 dark:text-gray-300">Use Case</p>
                            <p className="text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-md">
                              {template.use_case}
                            </p>
                          </div>
                        )}

                        {template.categories?.length > 0 && (
                          <div className="space-y-2">
                            <p className="font-medium text-gray-700 dark:text-gray-300">Categories</p>
                            <div className="flex flex-wrap gap-2">
                              {template.categories.map((c, i) => (
                                <Badge 
                                  key={i}
                                  className="bg-[#040F4B]/10 dark:bg-[#040F4B]/20 text-[#040F4B] dark:text-blue-300"
                                >
                                  {c.category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {template.activities?.length > 0 && (
                          <div className="space-y-2">
                            <p className="font-medium text-gray-700 dark:text-gray-300">Activities</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                              {template.activities
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((a, i) => (
                                  <li key={i} className="pl-2">
                                    {a.activity}
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
                      Add Decision Criteria
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