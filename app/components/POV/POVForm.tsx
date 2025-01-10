'use client'

import { useState } from 'react';
import { usePOV } from '@/app/contexts/POVContext';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { POV } from '@/app/types/pov';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Save, Building2, User, Briefcase, CalendarRange, Building, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

const formatDateForInput = (dateString: string | undefined) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

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

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const date = new Date(value + 'T12:00:00');
    setFormData(prev => ({ ...prev, [field]: date.toISOString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.customer_name || !formData.customer_industry || !formData.customer_region) {
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
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Create New POV
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter the initial details for your Proof of Value
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <Label 
                htmlFor="title" 
                className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
              >
                <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                POV Title
              </Label>
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
                <Label 
                  htmlFor="customer_name" 
                  className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                >
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Customer Name
                </Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label 
                  htmlFor="customer_industry" 
                  className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                >
                  <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Industry
                </Label>
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
                <Label 
                  htmlFor="customer_region" 
                  className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                >
                  <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Region
                </Label>
                <Select
                  value={formData.customer_region}
                  onValueChange={(value) => setFormData({ ...formData, customer_region: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <SelectItem value="NORTH AMERICA">North America</SelectItem>
                    <SelectItem value="SOUTH AMERICA">South America</SelectItem>
                    <SelectItem value="EUROPE">Europe</SelectItem>
                    <SelectItem value="ASIA PACIFIC">Asia Pacific</SelectItem>
                    <SelectItem value="MIDDLE_EAST">Middle East</SelectItem>
                    <SelectItem value="AFRICA">Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label 
                  htmlFor="business_unit" 
                  className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                >
                  <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Business Unit
                </Label>
                <Input
                  id="business_unit"
                  value={formData.business_unit}
                  onChange={(e) => setFormData({ ...formData, business_unit: e.target.value })}
                  placeholder="Enter business unit"
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <Label 
                  htmlFor="start_date" 
                  className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                >
                  <CalendarRange className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formatDateForInput(formData.start_date)}
                  onChange={(e) => handleDateChange('start_date', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <Label 
                  htmlFor="end_date" 
                  className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                >
                  <CalendarRange className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formatDateForInput(formData.end_date)}
                  onChange={(e) => handleDateChange('end_date', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create POV'}
          </Button>
        </div>
      </form>
    </div>
  );
} 