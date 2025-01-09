'use client'

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePOV } from '@/app/contexts/POVContext';
import { WorkingSession } from '@/app/types/pov';
import { Calendar, Clock, FileText, Tag } from 'lucide-react';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';

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
  const { pov } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkingSession>>({
    title: '',
    status: 'SCHEDULED',
    session_date: new Date().toISOString(),
    duration: 60,
    notes: '',
  });
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFormData({
      title: '',
      status: 'SCHEDULED',
      session_date: new Date().toISOString().split('T')[0],
      duration: 60,
      notes: '',
    });
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (editingSession && open) {
      setFormData(editingSession);
    }
  }, [editingSession, open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingSession) {
        await updateWorkingSession(editingSession.id, {
          ...formData,
          pov_id: pov?.id
        });
      } else {
        await addWorkingSession({
          ...formData,
          pov_id: pov?.id
        });
      }
      resetState();
      onClose?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving working session:', error);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
            {editingSession ? 'Edit Session' : 'Add Session'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">Title</Label>
                </div>
                <Input
                  id="title"
                  ref={initialFocusRef}
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
                  value={formData.session_date?.split('T')[0]}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    session_date: new Date(e.target.value).toISOString()
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
                {isSubmitting ? 'Saving...' : editingSession ? 'Save Changes' : 'Add Session'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 