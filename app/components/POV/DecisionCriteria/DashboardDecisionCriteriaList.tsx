'use client'

import { POVDecisionCriteria } from '@/app/types/pov';
import { Target, CheckCircle2, Tags, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor } from '@/app/lib/utils';

interface DashboardDecisionCriteriaListProps {
  decisionCriteria: POVDecisionCriteria[];
}

export default function DashboardDecisionCriteriaList({ 
  decisionCriteria
}: DashboardDecisionCriteriaListProps) {
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
                <Badge
                  variant="secondary"
                  className={`mt-1 ${getStatusBadgeColor(criteria.status)}`}
                >
                  {criteria.status}
                </Badge>
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
                            className={getStatusBadgeColor(activity.status)}
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