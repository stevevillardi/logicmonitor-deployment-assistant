'use client'

import { DeviceScope } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, Monitor, Tag, Hash, FileText, Link2 } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DeviceScopeListProps {
  devices: DeviceScope[];
  onEdit: (device: DeviceScope) => void;
}

const badgeClassName = "pointer-events-none select-none";

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
      <Card className="col-span-1 md:col-span-3 p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <Monitor className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No devices</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding devices to the scope
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((device) => (
        <Card
          key={device.id}
          className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full"
        >
          <div className="flex flex-col h-full">
            {/* Header with Title and Actions */}
            <div className="flex justify-between items-start">
              {/* Device Type and Category */}
              <div className="flex items-center gap-3">
                <div className="w-5 flex-shrink-0">
                  <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {device.device_type}
                    </h4>
                    {device.onboarding_template_device && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Link2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800">
                            <p>Added from onboarding template, eligible for onboarding pre-requisites.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                        "mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800",
                        badgeClassName
                    )}
                  >
                    {device.category}
                  </Badge>
                </div>
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

            {/* Content */}
            <div className="space-y-4 mt-4">
              {/* Count and Priority */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 flex-shrink-0">
                    <Hash className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Count: {device.count}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 flex-shrink-0">
                    <Tag className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <Badge 
                    variant="secondary"
                    className={cn(
                        `${
                            device.priority === 'HIGH' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800'
                                : device.priority === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800'
                        }`,
                        badgeClassName
                    )}
                  >
                    {device.priority} Priority
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {device.notes && (
                <div className="flex items-start gap-3">
                  <div className="w-5 flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {device.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 