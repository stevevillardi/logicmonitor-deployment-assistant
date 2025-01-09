'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Trash2, Info, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabaseBrowser } from '@/app/lib/supabase/client';

interface ValidationSection {
  name: string;
  isValid: boolean;
  tabName: string;
}

export default function POVHeader() {
  const { state } = usePOV();
  const { pov } = state;
  const router = useRouter();
  const { deletePOV } = usePOVOperations();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pov?.id || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deletePOV(pov.id);
      router.push('/pov');
    } catch (error) {
      console.error('Error deleting POV:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleCancel = () => {
    router.push('/pov');
  };

  const handleBack = () => {
    router.push('/pov');
  };

  const handleSubmitPOV = async () => {
    console.log("Submit POV clicked");
    console.log("Current state:", state);

    const validations: ValidationSection[] = [
      {
        name: "Team Members",
        isValid: state.teamMembers.length > 0,
        tabName: "team"
      },
      {
        name: "Business Services",
        isValid: state.keyBusinessServices.length > 0,
        tabName: "business-services"
      },
      {
        name: "Device Scope",
        isValid: state.deviceScopes.length > 0,
        tabName: "device-scope"
      },
      {
        name: "Working Sessions",
        isValid: state.workingSessions.length > 0,
        tabName: "working-sessions"
      }
    ];

    const invalidSections = validations.filter(v => !v.isValid);
    console.log("Invalid sections:", invalidSections);

    if (invalidSections.length > 0) {
      // Simple alert for debugging
      alert(`Missing sections:\n${invalidSections.map(s => s.name).join('\n')}`);
      return;
    }

    try {
      console.log("Attempting to update POV status");
      await supabaseBrowser
        .from('pov')
        .update({ 
          status: 'SUBMITTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', state.pov?.id);
        
      alert('POV submitted successfully');
    } catch (error) {
      console.error('Error submitting POV:', error);
      alert('Failed to submit POV');
    }
  };

  return (
    <>
      <header className="border-b border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to POV List
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-[#040F4B] dark:text-gray-100">
                {pov ? pov.title : 'New POV'}
              </h1>
              {pov && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pov.customer_name} • {pov.customer_industry}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium
              ${getStatusColor(pov?.status)}`}>
              {pov?.status?.replace(/_/g, ' ') || 'DRAFT'}
            </span>
            {!pov ? (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                Cancel
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteAlert(true)}
                  className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete POV
                </Button>
                <Button
                  onClick={handleSubmitPOV}
                  className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Submit POV
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="max-w-[95vw] mx-4 bg-blue-50 dark:bg-gray-800 sm:max-w-2xl">
          <AlertDialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
            <AlertDialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
              Delete POV
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-300">
              This will permanently delete this POV and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <div className="flex gap-2 text-sm text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-gray-700 p-4">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">The following will be deleted:</p>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside pl-1 mt-2">
                  <li>Key business services</li>
                  <li>Team members</li>
                  <li>Device scopes</li>
                  <li>Working sessions</li>
                  <li>All other associated data</li>
                </ul>
              </div>
            </div>
          </div>
          <AlertDialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3 flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#040F4B] dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 mt-0 w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors duration-200 w-full sm:w-auto"
            >
              {isDeleting ? 'Deleting...' : 'Delete POV'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'COMPLETE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
    case 'TECHNICALLY_SELECTED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400';
    case 'NOT_SELECTED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
  }
} 