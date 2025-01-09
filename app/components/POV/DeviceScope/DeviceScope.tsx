'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import DeviceScopeList from '@/app/components/POV/DeviceScope/DeviceScopeList';
import AddDeviceScopeDialog from '@/app/components/POV/DeviceScope/AddDeviceScopeDialog';
import { DeviceScope as DeviceScopeType } from '@/app/types/pov';
import { devLog } from '../../Shared/utils/debug';

export default function DeviceScope() {
  const { state } = usePOV();
  const deviceScopes = state.deviceScopes;
  devLog('Device Scopes in state:', deviceScopes);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceScopeType | null>(null);

  const handleEdit = (device: DeviceScopeType) => {
    setEditingDevice(device);
    setIsAddDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingDevice(null);
      }, 0);
    }
  };

  const handleAddNewClick = () => {
    setEditingDevice(null);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
              Device Scope
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage device scope for {state.pov?.title}
            </p>
          </div>
          <Button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
          >
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <DeviceScopeList 
          devices={deviceScopes} 
          onEdit={handleEdit}
        />
      </Card>

      <AddDeviceScopeDialog 
        open={isAddDialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingDevice={editingDevice}
        onClose={() => {
          setEditingDevice(null);
        }}
      />
    </div>
  );
} 