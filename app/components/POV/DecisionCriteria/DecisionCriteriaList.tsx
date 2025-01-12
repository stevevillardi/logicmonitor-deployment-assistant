'use client'

import { POVDecisionCriteria } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, AlertCircle, MessageSquare, Target, Lightbulb, CheckCircle2, Tags, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "react-hot-toast";
import { getStatusBadgeColor } from '@/app/lib/utils';

interface DecisionCriteriaListProps {
  decisionCriteria: POVDecisionCriteria[];
  onEdit: (criteria: POVDecisionCriteria) => void;
}

export default function DecisionCriteriaList({ 
  decisionCriteria, 
  onEdit 
}: DecisionCriteriaListProps) {
  const { deleteDecisionCriteria } = usePOVOperations();

  const handleDelete = async (criteriaId: string) => {
    try {
      await deleteDecisionCriteria(criteriaId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete criteria', {
        duration: 4000,
        position: 'top-center',
      });
    }
  };

  if (!decisionCriteria?.length) {
    return (
      <Card className="col-span-1 md:col-span-2 p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No decision criteria</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding decision criteria
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {decisionCriteria.map((criteria) => (
        <Card
          key={criteria.id}
          className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
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

              {/* Categories */}
              {criteria.categories && criteria.categories.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-5 flex-shrink-0">
                    <Tags className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Categories:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {criteria.categories.map(cat => (
                        <Badge 
                          key={cat.category} 
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800"
                        >
                          {cat.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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

              {criteria.use_case && (
                <div className="flex items-start gap-3">
                  <div className="w-5 flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use Case:
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                      {criteria.use_case}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onEdit(criteria)}
                className="h-8 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleDelete(criteria.id)}
                className="h-8 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
              >
                <Trash className="h-4 w-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
} 