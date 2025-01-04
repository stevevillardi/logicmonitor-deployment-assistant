import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';

const ScopingDocTest = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

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
          content: 'POV Scoping Document'
        },
        {
          type: 'paragraph',
          content: 'This is a test document generated to demonstrate the Google Docs API integration.'
        },
        {
          type: 'heading',
          content: 'Project Overview'
        },
        {
          type: 'image',
          content: 'https://github.com/stevevillardi/LogicMonitor-Dashboards/blob/main/Images/PSTTThumbnail.png?raw=true',
          imageOptions: {
            width: 400,
            height: 300
          }
        },
        {
          type: 'bulletList',
          content: [
            'Key objective 1',
            'Key objective 2',
            'Key objective 3'
          ]
        },
        {
          type: 'heading',
          content: 'Project Steps'
        },
        {
          type: 'numberedList',
          content: [
            'Planning phase',
            'Implementation phase',
            'Testing phase',
            'Deployment phase'
          ]
        },
        // {
        //   type: 'table',
        //   content: [
        //     ['Metric', 'Current', 'Target'],
        //     ['Performance', '85%', '95%'],
        //     ['Adoption', '60%', '80%'],
        //     ['Satisfaction', '3.8/5', '4.5/5']
        //   ]
        // },
        {
          type: 'heading',
          content: 'Key Findings'
        },
        {
          type: 'paragraph',
          content: 'Here are the key findings from our initial analysis...'
        }
      ];

      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'POV Scoping Document - Test',
          contents: testContent,
          userEmail: user.email,
          documentId: documentId
        })
      });

      const result = await response.json();
      if (result.url) {
        setDocUrl(result.url);
        setDocumentId(result.documentId);
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Document Creation (Work in Progress)</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {documentId 
            ? 'Update the existing document with new content.'
            : 'Generate a test document with various formatting styles and tables.'
          }
        </p>
        {documentId && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Document ID: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{documentId}</code>
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
              {documentId ? 'Updating Document...' : 'Generating Document...'}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {documentId ? 'Update Document' : 'Generate Test Document'}
            </>
          )}
        </Button>

        {docUrl && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Document {documentId ? 'Updated' : 'Created'} Successfully!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Your document has been {documentId ? 'updated' : 'created'} and opened in a new tab.
            </p>
            <Button
              onClick={() => window.open(docUrl, '_blank')}
              className="w-fit"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Google Docs
            </Button>
          </div>
        )}

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