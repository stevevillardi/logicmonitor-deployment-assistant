import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Info, AlertTriangle, Building2, Server, Settings, Calculator } from 'lucide-react';
import { useDeployments } from '@/app/contexts/DeploymentsContext'
import { Config, Site } from '../DeploymentAssistant/types/types';
import { Label } from "@/components/ui/label";
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

interface SaveDeploymentDialogProps {
  config: Config;
  sites: Site[];
  onSaved?: () => void;
  className?: string;
}

export function SaveDeploymentDialog({ config, sites, onSaved, className }: SaveDeploymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [existingDeployment, setExistingDeployment] = useState<{ id: string } | null>(null);
  const { saveDeployment, updateDeployment, deployments } = useDeployments();

  useEffect(() => {
    if (open) {
      setName(config.deploymentName || 'New Deployment');
    }
  }, [open, config.deploymentName]);

  const handleSaveAttempt = async () => {
    if (!name.trim()) return;

    // Check if deployment with this name already exists
    const existing = deployments.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setExistingDeployment(existing);
      setShowOverwriteDialog(true);
      return;
    }

    await performSave();
  };

  const handleOverwriteConfirm = async () => {
    await performSave(true);
    setShowOverwriteDialog(false);
  };

  const performSave = async (isOverwrite = false) => {
    setIsSaving(true);
    try {
      if (isOverwrite && existingDeployment) {
        await updateDeployment(existingDeployment.id, name, config, sites);
      } else {
        await saveDeployment(name, config, sites);
      }
      setOpen(false);
      setName('');
      onSaved?.();
    } catch (error) {
      console.error('Failed to save deployment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={className || "text-blue-600 bg-blue-50 border border-blue-200 truncate hover:bg-blue-100 hover:text-blue-700 w-full sm:w-auto h-9"}
          >
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden xl:inline">Save Deployment</span>
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="max-w-[95vw] w-full lg:max-w-4xl bg-blue-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b border-blue-100 pb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B]">
              Save Deployment Configuration
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Save your current deployment configuration to your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Features Section */}
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Save className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="font-medium text-gray-900">Save to Your Account</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <span>Access from any device</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span>Secure cloud storage</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                    <span>Easy load and modify</span>
                  </div>
                </div>
              </div>

              {/* What's Included Section */}
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="font-medium text-gray-900">What's Included</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Site configs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>Device settings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>System settings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span>Calculations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="space-y-1.5">
                <Label 
                  htmlFor="saveName" 
                  className="text-sm font-medium text-gray-900"
                >
                  Deployment Name
                </Label>
                <Input
                  id="saveName"
                  placeholder="Enter deployment name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-gray-200"
                  autoFocus
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-blue-100 pt-3">
            <Button 
              onClick={handleSaveAttempt}
              disabled={!name.trim() || isSaving}
              className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
            >
              {isSaving ? 'Saving...' : 'Save Deployment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overwrite Confirmation Dialog */}
      <AlertDialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <AlertDialogContent className="bg-yellow-50 border-yellow-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Overwrite Existing Deployment?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-yellow-700">
                  A deployment with the name "<span className="font-medium">{name}</span>" already exists.
                </p>
                <div className="bg-white border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-600">
                    Overwriting will:
                  </p>
                  <ul className="mt-2 text-sm text-yellow-600 list-disc list-inside space-y-1">
                    <li>Replace the existing configuration</li>
                    <li>Update all site settings</li>
                    <li>Cannot be undone</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              className="bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              onClick={() => setShowOverwriteDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-yellow-100 border border-yellow-200 text-yellow-700 hover:bg-yellow-200"
              onClick={handleOverwriteConfirm}
            >
              Overwrite Deployment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 