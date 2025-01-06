import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Download, Loader2 } from 'lucide-react';

const ScopingDocTest = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const createTestDocument = async () => {
    if (!user?.email) {
      console.error('No user email found');
      return;
    }

    setIsLoading(true);
    try {
      const testContent = [
        {
          type: 'heading',
          content: 'Evaluation Progress Tracking'
        },
        // Table of Contents
        {
          type: 'table',
          content: [
            ['Executive Summary', '3'],
            ['Success Definition', '4'],
            ['Success Tracking/Progress', '5'],
            ['Scope of Architecture POC', '6'],
            ['Scope of Architecture POC', '7'],
            ['POV Project Plan', '8']
          ]
        },
        {
          type: 'heading',
          content: 'Executive Summary'
        },
        {
          type: 'table',
          content: [
            ['Key Business Success Metrics', 'Status'],
            ['Metric 1', 'In Progress'],
            ['Metric 2', 'Complete'],
          ]
        },
        {
          type: 'heading',
          content: 'Success Definition'
        },
        {
          type: 'table',
          content: [
            ['Success Criteria', 'Description', 'Status'],
            ['Technical Success', 'Description here...', 'In Progress'],
            ['Business Success', 'Description here...', 'Complete'],
            ['Operational Success', 'Description here...', 'Not Started']
          ]
        },
        {
          type: 'heading',
          content: 'Success Tracking/Progress'
        },
        {
          type: 'table',
          content: [
            ['Date', 'Progress Notes', 'Status', 'Next Steps'],
            ['2024-03-21', 'Initial meeting completed', 'In Progress', 'Schedule follow-up'],
          ]
        },
        {
          type: 'heading',
          content: 'Scope of Architecture POC'
        },
        {
          type: 'table',
          content: [
            ['Component', 'Description', 'Status'],
            ['Component 1', 'Description...', 'In Scope'],
            ['Component 2', 'Description...', 'Out of Scope'],
          ]
        },
        {
          type: 'heading',
          content: 'POV Project Plan'
        },
        {
          type: 'table',
          content: [
            ['Task', 'Owner', 'Start Date', 'End Date', 'Status'],
            ['Task 1', 'Owner 1', '2024-03-21', '2024-03-28', 'In Progress'],
          ]
        }
      ];

      const response = await fetch('/api/docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'POV Scoping Document - Test',
          contents: testContent,
          userEmail: user.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'POV-Scoping-Document.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Document Generation</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Generate a Word document with various formatting styles and tables.
        </p>
        {lastGenerated && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last generated: {lastGenerated.toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <Button 
          onClick={createTestDocument}
          className="bg-blue-600 hover:bg-blue-700 text-white w-fit"
          disabled={isLoading || !user?.email}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Document...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Document
            </>
          )}
        </Button>

        {!user?.email && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Please sign in to create documents.
          </p>
        )}
      </div>
    </div>
  );
};

export default ScopingDocTest;