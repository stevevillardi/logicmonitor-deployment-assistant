'use client'

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePOV } from '@/app/contexts/POVContext';
import { KeyBusinessService } from '@/app/types/pov';
import { Building2, User, Target, ClipboardList, Plus, Minus } from 'lucide-react';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';

interface AddBusinessServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingService?: KeyBusinessService | null;
  onClose?: () => void;
}

export default function AddBusinessServiceDialog({ 
  open, 
  onOpenChange, 
  editingService, 
  onClose 
}: AddBusinessServiceDialogProps) {
  const { state } = usePOV();
  const { addBusinessService, updateBusinessService } = usePOVOperations();
  const { pov } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<KeyBusinessService>>({
    name: '',
    description: '',
    tech_owner: '',
    desired_kpis: [],
  });
  const [kpiInput, setKpiInput] = useState('');
  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        tech_owner: '',
        desired_kpis: [],
      });
      setKpiInput('');
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (editingService && open) {
      setFormData(editingService);
    }
  }, [editingService, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingService) {
        await updateBusinessService(editingService.id, {
          ...formData,
          pov_id: pov?.id
        });
      } else {
        await addBusinessService({
          ...formData,
          pov_id: pov?.id
        });
      }
      onClose?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving business service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddKpi = (kpi: string) => {
    if (kpi && !formData.desired_kpis?.includes(kpi)) {
      setFormData({
        ...formData,
        desired_kpis: [...(formData.desired_kpis || []), kpi]
      });
    }
    setKpiInput('');
  };

  const handleRemoveKpi = (kpiToRemove: string) => {
    setFormData({
      ...formData,
      desired_kpis: formData.desired_kpis?.filter(kpi => kpi !== kpiToRemove) || []
    });
  };

  const resetState = () => {
    setFormData({
      name: '',
      description: '',
      tech_owner: '',
      desired_kpis: [],
    });
    setKpiInput('');
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
      onClose?.();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-0 my-0 max-h-[90vh] overflow-y-auto will-change-transform"
      >
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            {editingService ? 'Edit Business Service' : 'Add Business Service'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">Service Name</Label>
                </div>
                <Input
                  id="name"
                  ref={initialFocusRef}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter service name"
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">Description</Label>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="tech_owner" className="text-gray-900 dark:text-gray-100">Technical Owner</Label>
                </div>
                <Input
                  id="tech_owner"
                  value={formData.tech_owner}
                  onChange={(e) => setFormData({ ...formData, tech_owner: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter technical owner"
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="desired_kpis" className="text-gray-900 dark:text-gray-100">Desired KPIs</Label>
                </div>
                <div className="space-y-2">
                  {formData.desired_kpis?.map((kpi, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={kpi || ''}
                        onChange={(e) => {
                          const newKpis = [...(formData.desired_kpis || [])];
                          newKpis[index] = e.target.value;
                          setFormData(prev => ({ ...prev, desired_kpis: newKpis }));
                        }}
                        placeholder="Enter KPI"
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newKpis = (formData.desired_kpis || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, desired_kpis: newKpis }));
                        }}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      desired_kpis: [...(prev.desired_kpis || []), '']
                    }))}
                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add KPI
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3">
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  document.body.focus();
                  onOpenChange(false);
                }}
                className="w-full sm:w-auto bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                {isSubmitting ? 'Saving...' : editingService ? 'Save Changes' : 'Add Service'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 