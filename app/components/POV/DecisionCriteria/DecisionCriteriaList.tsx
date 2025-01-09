'use client'

import { POVDecisionCriteria } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      console.error('Error deleting decision criteria:', error);
    }
  };

  if (!decisionCriteria?.length) {
    return (
      <Card className="col-span-1 md:col-span-2 p-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
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
          className="p-6 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {criteria.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={`mt-1 ${
                      criteria.status === 'MET' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : criteria.status === 'NOT_MET'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {criteria.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {criteria.success_criteria}
                </p>
              </div>

              {criteria.use_case && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use Case:
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
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