'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Library, Sparkles } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import ChallengeList from './ChallengeList';
import CreateChallengeDialog from './CreateChallengeDialog';
import AddFromLibraryDialog from './AddFromLibraryDialog';
import { POVChallenge } from '@/app/types/pov';
import { devLog } from '../../Shared/utils/debug';
import { AlertCircle, MessageSquare, LineChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

type GenerateResponse = {
  recommendations: Array<{
    id?: string;
    isExisting: boolean;
    title: string;
    challenge_description: string;
    business_impact: string;
    example: string;
  }>;
};

export default function Challenges() {
  const { state } = usePOV();
  const pov = state.pov;
  const challenges = pov?.challenges || [];
  devLog('Challenges in state:', challenges);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<POVChallenge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<GenerateResponse['recommendations']>([]);

  const handleEdit = (challenge: POVChallenge) => {
    setEditingChallenge(challenge);
    setIsCreateDialogOpen(true);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingChallenge(null);
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
          type: 'challenges' 
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
              Challenges
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Manage challenges for {pov?.title}
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
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100"
                        >
                          AI Generated
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.challenge_description}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <LineChart className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Impact:
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.business_impact}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setIsCreateDialogOpen(true);
                      setEditingChallenge({
                        ...item,
                        id: '', // Will be generated when saved
                        pov_id: pov?.id || '',
                        status: 'OPEN',
                        created_at: new Date().toISOString(),
                        updated_at: null,
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
        <ChallengeList 
          challenges={challenges} 
          onEdit={handleEdit}
        />
      </div>

      <CreateChallengeDialog 
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        editingChallenge={editingChallenge}
        onClose={() => {
          setEditingChallenge(null);
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