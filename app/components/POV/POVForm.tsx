'use client'

import { useState } from 'react';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { POV } from '@/app/types/pov';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function POVForm() {
  const { state } = usePOV();
  const { createPOV } = usePOVOperations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<POV>>({
    title: '',
    customer_name: '',
    customer_industry: '',
    customer_region: '',
    business_unit: '',
    start_date: '',
    end_date: '',
    status: 'DRAFT',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.customer_name || !formData.customer_industry) {
        throw new Error('Please fill in all required fields');
      }

      const newPov = await createPOV({
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!newPov?.id) {
        throw new Error('Failed to create POV');
      }

      router.push(`/pov/${newPov.id}`);
    } catch (error) {
      console.error('Error creating POV:', error);
      // Here you might want to show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">POV Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter POV title"
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Enter customer name"
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="customer_industry">Industry</Label>
              <Select
                value={formData.customer_industry}
                onValueChange={(value) => setFormData({ ...formData, customer_industry: value })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                  <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="RETAIL">Retail</SelectItem>
                  <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Creating...' : 'Create POV'}
        </Button>
      </div>
    </form>
  );
} 