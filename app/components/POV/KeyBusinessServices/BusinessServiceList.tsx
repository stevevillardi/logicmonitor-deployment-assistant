'use client'

import { KeyBusinessService } from '@/app/types/pov';
import { Building2, MoreVertical, Pencil, Trash, User, Target, ClipboardList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePOV } from '@/app/contexts/POVContext';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface BusinessServiceListProps {
  services: KeyBusinessService[];
  onEdit: (service: KeyBusinessService) => void;
}

export default function BusinessServiceList({ services, onEdit }: BusinessServiceListProps) {
  const { dispatch } = usePOV();

  const handleDelete = async (serviceId: string) => {
    try {
      const { error } = await supabaseBrowser
        .from('pov_key_business_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      dispatch({ 
        type: 'DELETE_BUSINESS_SERVICE', 
        payload: serviceId 
      });
    } catch (error) {
      console.error('Error deleting business service:', error);
    }
  };

  if (!services?.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
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
          className="p-6 bg-white dark:bg-gray-800 shadow-sm"
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
                  <ClipboardList className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {service.description}
                  </p>
                </div>
              )}

              {/* Technical Owner */}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Technical Owner:</span> {service.tech_owner}
                </span>
              </div>

              {/* KPIs */}
              {service.desired_kpis && service.desired_kpis.length > 0 && (
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">
                      Desired KPIs:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {service.desired_kpis.map((kpi, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
} 