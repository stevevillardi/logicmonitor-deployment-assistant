'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePOV } from '@/app/contexts/POVContext';
import { KeyBusinessService } from '@/app/types/pov';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { X, Plus, Minus } from 'lucide-react';

interface AddBusinessServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddBusinessServiceDialog({ open, onOpenChange }: AddBusinessServiceDialogProps) {
  const { state, dispatch } = usePOV();
  const { user } = useAuth();
  const { pov } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<KeyBusinessService>>({
    name: '',
    description: '',
    tech_owner: '',
    desired_kpis: [],
  });
  const [kpiInput, setKpiInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabaseBrowser
        .from('pov_key_business_services')
        .insert({
          ...formData,
          pov_id: pov?.id,
          created_at: new Date().toISOString(),
          created_by: user?.id,
          desired_kpis: formData.desired_kpis,
        })
        .select()
        .single();

      console.log(user?.id);
      if (error) throw error;

      dispatch({ 
        type: 'ADD_BUSINESS_SERVICE', 
        payload: data as KeyBusinessService 
      });

      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        tech_owner: '',
        desired_kpis: [],
      });
    } catch (error) {
      console.error('Error adding business service:', error);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700"
      >
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            Add Business Service
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter service name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">Description</Label>
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
                <Label htmlFor="tech_owner" className="text-gray-900 dark:text-gray-100">Technical Owner</Label>
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
                <Label htmlFor="desired_kpis" className="text-gray-900 dark:text-gray-100">Desired KPIs</Label>
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
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
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
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add Service'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 