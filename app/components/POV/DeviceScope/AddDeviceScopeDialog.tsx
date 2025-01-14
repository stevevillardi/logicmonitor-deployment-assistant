'use client'

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePOV } from '@/app/contexts/POVContext';
import { DeviceScope } from '@/app/types/pov';
import { Monitor, Tag, Hash, FileText, Server } from 'lucide-react';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Check, ChevronsUpDown } from "lucide-react";
import { fetchSystemCredentials } from '@/app/lib/device-utils';
import { cn } from '@/lib/utils';

interface AddDeviceScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDevice?: DeviceScope | null;
  onClose?: () => void;
}

interface SystemCredential {
    name: string;
    description: string;
    category: string;
}

export default function AddDeviceScopeDialog({ 
  open, 
  onOpenChange, 
  editingDevice, 
  onClose 
}: AddDeviceScopeDialogProps) {
  const { state } = usePOV();
  const { addDeviceScope, updateDeviceScope } = usePOVOperations();
  const { pov } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<DeviceScope>>({
    device_type: '',
    category: '',
    count: 1,
    priority: 'LOW',
    notes: '',
    specifications: {},
  });
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const [systemCredentials, setSystemCredentials] = useState<SystemCredential[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resetState = () => {
    setFormData({
      device_type: '',
      category: '',
      count: 1,
      priority: 'LOW',
      notes: '',
      specifications: {},
    });
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (editingDevice && open) {
      setFormData(editingDevice);
    }
  }, [editingDevice, open]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
    return () => {
      if (open) {
        resetState();
      }
    };
  }, [open]);

  useEffect(() => {
    async function loadCredentials() {
        try {
            setIsLoading(true);
            const credentials = await fetchSystemCredentials();
            if (Array.isArray(credentials)) {
                setSystemCredentials(credentials);
            }
        } catch (error) {
            console.error('Error loading credentials:', error);
            setSystemCredentials([]);
        } finally {
            setIsLoading(false);
        }
    }
    loadCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingDevice) {
        await updateDeviceScope(editingDevice.id, {
          ...formData,
          pov_id: pov?.id
        });
      } else {
        await addDeviceScope({
          ...formData,
          pov_id: pov?.id
        });
      }
      resetState();
      onClose?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving device scope:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        resetState();
        onClose?.();
      }, 0);
    }
    onOpenChange(open);
  };

  const quickAddSection = (
    <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <Label className="text-gray-900 dark:text-gray-100">Quick Add from Template</Label>
        </div>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-left font-normal"
                >
                    {formData.device_type || "Select device type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" 
                align="start"
                sideOffset={5}
            >
                <Command className="border-none h-full">
                    <CommandInput 
                        placeholder="Search device types..." 
                        className="border-none focus:ring-0 dark:bg-gray-900"
                    />
                    <CommandEmpty className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                        No device type found.
                    </CommandEmpty>
                    <CommandGroup className="overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                        {isLoading ? (
                            <CommandItem disabled className="text-sm text-gray-500 dark:text-gray-400">
                                Loading...
                            </CommandItem>
                        ) : systemCredentials.length === 0 ? (
                            <CommandItem disabled className="text-sm text-gray-500 dark:text-gray-400">
                                No device types found
                            </CommandItem>
                        ) : (
                            systemCredentials.map((cred) => (
                                <CommandItem
                                    key={cred.name}
                                    value={cred.name}
                                    onSelect={() => {
                                        setFormData({
                                            ...formData,
                                            onboarding_template_device: true,
                                            device_type: cred.name,
                                            category: cred.category
                                        });
                                        setPopoverOpen(false);
                                    }}
                                    className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center gap-2">
                                            <Check
                                                className={cn(
                                                    "h-4 w-4",
                                                    formData.device_type === cred.name 
                                                        ? "opacity-100 text-blue-600 dark:text-blue-400" 
                                                        : "opacity-0"
                                                )}
                                            />
                                            <Monitor className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium">{cred.name}</span>
                                        </div>
                                        <div className="pl-10 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                            <Server className="h-3 w-3 shrink-0" />
                                            <span>{cred.category}</span>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))
                        )}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            {editingDevice ? 'Edit Device' : 'Add Device'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {quickAddSection}

            <div className="grid gap-4">
              {/* Device Type */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="device_type" className="text-gray-900 dark:text-gray-100">Device Type</Label>
                </div>
                <Input
                  id="device_type"
                  ref={initialFocusRef}
                  value={formData.device_type}
                  onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  placeholder="Enter device type"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="category" className="text-gray-900 dark:text-gray-100">Category</Label>
                </div>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  placeholder="Enter category"
                  required
                />
              </div>

              {/* Count */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="count" className="text-gray-900 dark:text-gray-100">Count</Label>
                </div>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="priority" className="text-gray-900 dark:text-gray-100">Priority</Label>
                </div>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW'
                  })}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
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
                  placeholder="Enter notes"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3">
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
                {isSubmitting ? 'Saving...' : editingDevice ? 'Save Changes' : 'Add Device'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 