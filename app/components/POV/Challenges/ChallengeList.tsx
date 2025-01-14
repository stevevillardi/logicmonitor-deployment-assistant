'use client'

import { POVChallenge } from '@/app/types/pov';
import { MoreVertical, Pencil, Trash, AlertCircle, MessageSquare, Target, Tags, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { devLog } from '../../Shared/utils/debug';
import { cn } from '@/lib/utils';

interface ChallengeListProps {
  challenges: POVChallenge[];
  onEdit: (challenge: POVChallenge) => void;
}

const badgeClassName = "pointer-events-none select-none";

export default function ChallengeList({ challenges, onEdit }: ChallengeListProps) {
  devLog('Challenges passed to list:', challenges);
  const { deleteChallenge } = usePOVOperations();

  const handleDelete = async (challengeId: string) => {
    try {
      await deleteChallenge(challengeId);
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  if (!challenges?.length) {
    return (
      <Card className="col-span-1 md:col-span-2 p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No challenges</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding challenges
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {challenges.map((challenge) => (
        <Card
          key={challenge.id}
          className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              {/* Title and Status */}
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {challenge.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={cn(
                        `mt-1 ${
                            challenge.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : challenge.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                        }`,
                        badgeClassName
                    )}
                  >
                    {challenge.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <div className="w-5 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {challenge.challenge_description}
                </p>
              </div>

              {/* Business Impact */}
              {challenge.business_impact && (
                <div className="flex items-start gap-3">
                  <div className="w-5 flex-shrink-0">
                    <LineChart className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Business Impact:
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                      {challenge.business_impact}
                    </p>
                  </div>
                </div>
              )}

              {/* Categories */}
              {challenge.categories && challenge.categories.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-5 flex-shrink-0">
                    <Tags className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Categories:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {challenge.categories.map(cat => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className={cn(
                            "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800",
                            badgeClassName
                          )}
                        >
                          {cat.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Outcomes */}
              {challenge.outcomes && challenge.outcomes.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-5 flex-shrink-0">
                    <Target className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Outcomes:
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {challenge.outcomes.map(out => out.outcome).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onEdit(challenge)}
                className="h-8 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleDelete(challenge.id)}
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