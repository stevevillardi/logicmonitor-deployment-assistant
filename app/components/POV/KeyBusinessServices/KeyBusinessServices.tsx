'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import BusinessServiceList from './BusinessServiceList';
import AddBusinessServiceDialog from './AddBusinessServiceDialog';
import { KeyBusinessService } from '@/app/types/pov';

export default function KeyBusinessServices() {
  const { state } = usePOV();
  const keyBusinessServices = state.keyBusinessServices;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<KeyBusinessService | null>(null);

  const handleEdit = (service: KeyBusinessService) => {
    setEditingService(service);
    setIsAddDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      // Use setTimeout to ensure state updates happen after the dialog closes
      setTimeout(() => {
        setEditingService(null);
      }, 0);
    }
  };

  const handleAddNewClick = () => {
    setEditingService(null);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
              Key Business Services
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage key business services for {state.pov?.title}
            </p>
          </div>
          <Button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <BusinessServiceList 
          services={keyBusinessServices} 
          onEdit={handleEdit}
        />
      </Card>

      <AddBusinessServiceDialog 
        open={isAddDialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingService={editingService}
        onClose={() => {
          setEditingService(null);
        }}
      />
    </div>
  );
} 