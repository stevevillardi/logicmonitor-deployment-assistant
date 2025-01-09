'use client'

import { DeviceScope } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, Monitor, Tag, Hash, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { devLog } from '../../Shared/utils/debug';

interface DeviceScopeListProps {
  devices: DeviceScope[];
  onEdit: (device: DeviceScope) => void;
}

export default function DeviceScopeList({ devices, onEdit }: DeviceScopeListProps) {
  devLog('Devices passed to list:', devices);
  const { deleteDeviceScope } = usePOVOperations();

  const handleDelete = async (deviceId: string) => {
    try {
      await deleteDeviceScope(deviceId);
    } catch (error) {
      console.error('Error deleting device scope:', error);
    }
  };

  if (!devices?.length) {
    return (
      <div className="text-center py-12">
        <Monitor className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No devices</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding devices to the scope
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {devices.map((device) => (
        <Card
          key={device.id}
          className="p-6 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              {/* Device Type and Category */}
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {device.device_type}
                  </h4>
                  <Badge
                    variant="secondary"
                    className="mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100"
                  >
                    {device.category}
                  </Badge>
                </div>
              </div>

              {/* Count and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Count: {device.count}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Priority: {device.priority}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {device.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {device.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onEdit(device)}
                className="h-8 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleDelete(device.id)}
                className="h-8 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
              >
                <Trash className="h-4 w-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 