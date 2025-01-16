'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Library, Sparkles, ListChecks, Lightbulb, Target, CheckCircle2, Badge } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import DecisionCriteriaList from './DecisionCriteriaList';
import CreateDecisionCriteriaDialog from './CreateDecisionCriteriaDialog';
import AddFromLibraryDialog from './AddFromLibraryDialog';
import { POVDecisionCriteria, POVDecisionCriteriaActivity } from '@/app/types/pov';
import { toast } from 'react-hot-toast';

type GenerateResponse = {
  recommendations: Array<{
    id?: string;
    isExisting: boolean;
    title: string;
    use_case: string;
    success_criteria: string;
    activities: POVDecisionCriteriaActivity[];
  }>;
};

export default function DecisionCriteria() {
  const { state } = usePOV();
  const { pov } = state;
  const decisionCriteria = pov?.decision_criteria || [];
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<POVDecisionCriteria | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<GenerateResponse['recommendations']>([]);

  const handleEdit = (criteria: POVDecisionCriteria) => {
    setEditingCriteria(criteria);
    setIsCreateDialogOpen(true);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingCriteria(null);
      }, 0);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!pov?.customer_notes) {
      toast.error('Please add customer notes to generate recommendations');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/pov/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: pov.customer_notes,
          type: 'decision_criteria' 
        })
      });
      const data: GenerateResponse = await response.json();
      setAiRecommendations(data.recommendations);
      if (data.recommendations.length > 0) {
        toast.success('AI recommendations generated successfully');
      } else {
        toast.error('No recommendations generated');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearRecommendations = () => setAiRecommendations([]);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Decision Criteria
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage decision criteria for {pov?.title}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Recommend via AI'}
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              Create New
            </Button>
            <Button
              onClick={() => setIsLibraryDialogOpen(true)}
              className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Library className="h-4 w-4" />
              Add from Library
            </Button>
          </div>
        </div>
      </Card>

      {aiRecommendations?.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              AI Recommendations
            </h3>
            <Button
              variant="ghost"
              onClick={clearRecommendations}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear Recommendations
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiRecommendations.map((item, index) => (
              <Card
                key={index}
                className="p-6 bg-white dark:bg-gray-900 border-2 border-dashed border-blue-300 dark:border-blue-600"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </h4>
                        <Badge
                          className="mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100"
                        >
                          AI Generated
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Success Criteria:
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.success_criteria}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Use Case:
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.use_case}
                        </p>
                      </div>
                    </div>

                    {item.activities?.length > 0 && (
                      <div className="flex items-start gap-3">
                        <ListChecks className="h-5 w-5 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Activities:
                          </span>
                          <div className="space-y-2 mt-1">
                            {item.activities.map((activity, idx) => (
                              <div key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                                {activity}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setIsCreateDialogOpen(true);
                      setEditingCriteria({
                        ...item,
                        id: '', // Will be generated when saved
                        pov_id: pov?.id || '',
                        status: 'OPEN',
                        created_at: new Date().toISOString(),
                        use_case: item.use_case,
                        success_criteria: item.success_criteria,
                        activities: item.activities.map(activity => ({
                          pov_decision_criteria_id: '', 
                          activity: activity,
                          created_at: new Date().toISOString(),
                        })),
                        categories: item.categories
                      });
                    }}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add to POV
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DecisionCriteriaList 
          decisionCriteria={decisionCriteria} 
          onEdit={handleEdit}
        />
      </div>

      <CreateDecisionCriteriaDialog 
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        editingCriteria={editingCriteria}
        onClose={() => {
          setEditingCriteria(null);
        }}
      />

      <AddFromLibraryDialog
        open={isLibraryDialogOpen}
        onOpenChange={setIsLibraryDialogOpen}
        onClose={() => setIsLibraryDialogOpen(false)}
      />
    </div>
  );
} 