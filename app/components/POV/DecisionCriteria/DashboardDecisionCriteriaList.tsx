'use client'

import { DeviceScope, POVDecisionCriteria } from '@/app/types/pov';
import { Target, CheckCircle2, Tags, ListChecks, AlertCircle, Clock, Ban, XCircle, CircleDot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor } from '@/app/lib/utils';
import { StatusDropdown } from '@/app/components/Shared/StatusDropdown';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';

const deviceStatuses = [
    { value: 'NOT_STARTED', icon: CircleDot, label: 'Not Started' },
    { value: 'IN_PROGRESS', icon: Clock, label: 'In Progress' },
    { value: 'COMPLETE', icon: CheckCircle2, label: 'Complete' },
    { value: 'PENDING', icon: CircleDot, label: 'Pending' }
];

const getStatusColor = (status: string) => {
    switch (status as POVDecisionCriteria['status']) {
        case 'NOT_STARTED':
            return 'text-gray-600 dark:text-gray-400';
        case 'IN_PROGRESS':
            return 'text-blue-600 dark:text-blue-400';
        case 'COMPLETE':
            return 'text-green-600 dark:text-green-400';
        case 'PENDING':
            return 'text-yellow-600 dark:text-yellow-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

interface DashboardDecisionCriteriaListProps {
  decisionCriteria: POVDecisionCriteria[];
}

export default function DashboardDecisionCriteriaList({ 
  decisionCriteria
}: DashboardDecisionCriteriaListProps) {
  const { updateDecisionCriteriaStatus } = usePOVOperations();

  // Add this className to disable hover effects
  const badgeClassName = "pointer-events-none select-none";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {decisionCriteria.map((criteria) => (
        <Card
          key={criteria.id}
          className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-5 flex-shrink-0">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {criteria.title}
                </h4>
                <StatusDropdown
                  statuses={deviceStatuses}
                  onStatusChange={(newStatus) => updateDecisionCriteriaStatus(criteria.id, newStatus)}
                  getStatusColor={getStatusColor}
                  showIcon={true}
                  currentStatus={criteria.status}
                  buttonSize="sm"
                />
              </div>
            </div>

            {/* Success Criteria */}
            <div className="flex items-start gap-3">
              <div className="w-5 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Success Criteria:
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                  {criteria.success_criteria}
                </p>
              </div>
            </div>

            {/* Activities */}
            {criteria.activities && criteria.activities.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-5 flex-shrink-0">
                  <ListChecks className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activities:
                  </span>
                  <div className="space-y-2 mt-1">
                    {criteria.activities
                      .sort((a, b) => a.order_index - b.order_index)
                      .map(activity => (
                        <div 
                          key={activity.id} 
                          className="flex items-center gap-2"
                        >
                          <Badge 
                            variant="secondary"
                            className={`${getStatusBadgeColor(activity.status)} ${badgeClassName}`}
                          >
                            {activity.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {activity.activity}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 