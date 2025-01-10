'use client'

import { KeyBusinessService } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, Building2, User, Target, ClipboardList } from 'lucide-react';
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

interface BusinessServiceListProps {
  services: KeyBusinessService[];
  onEdit: (service: KeyBusinessService) => void;
}

export default function BusinessServiceList({ services, onEdit }: BusinessServiceListProps) {
  const { deleteBusinessService } = usePOVOperations();

  const handleDelete = async (serviceId: string) => {
    try {
      await deleteBusinessService(serviceId);
    } catch (error) {
      console.error('Error deleting business service:', error);
    }
  };

  if (!services?.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No services</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding a new business service
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              {/* Header */}
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {service.name}
                </h4>
              </div>

              {/* Description */}
              {service.description && (
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {service.description}
                  </p>
                </div>
              )}

              {/* Technical Owner */}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Technical Owner:</span> {service.tech_owner}
                </span>
              </div>

              {/* KPIs */}
              {service.desired_kpis && service.desired_kpis.length > 0 && (
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">
                      Desired KPIs:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {service.desired_kpis.map((kpi, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800"
                        >
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onEdit(service)}
                className="h-8 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleDelete(service.id)}
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