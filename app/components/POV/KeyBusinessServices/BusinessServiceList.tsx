'use client'

import { KeyBusinessService } from '@/app/types/pov';
import { Building2, MoreVertical, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface BusinessServiceListProps {
  services: KeyBusinessService[];
}

export default function BusinessServiceList({ services }: BusinessServiceListProps) {
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
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
        >
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {service.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {service.tech_owner}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
} 