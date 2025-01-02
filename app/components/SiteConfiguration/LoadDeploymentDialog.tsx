import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderOpen, Info, AlertTriangle, Clock, Building2, Server, Bot, Gauge, MessageSquare, Activity, Network } from 'lucide-react';
import { useDeploymentsContext, type Deployment } from '@/app/contexts/DeploymentsContext'
import { Config, Site } from '../DeploymentAssistant/types/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LoadDeploymentDialogProps {
  onLoadConfig: (config: Config, sites: Site[]) => void;
  className?: string;
}

export function LoadDeploymentDialog({ onLoadConfig, className }: LoadDeploymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const { deployments, isLoading } = useDeploymentsContext();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSiteSummary = (sites: Site[]) => {
    const summary = sites.reduce((acc, site) => {
      // Count polling devices (all devices that aren't log/netflow devices)
      const pollingDevices = Object.entries(site.devices).reduce((sum, [type, device]) => {
        return sum + (device.count || 0);
      }, 0);

      // Count log devices
      const logDevices = Object.entries(site.logs?.devices || {}).reduce((sum, [type, count]) => {
        if (type !== 'netflowdevices') {
          return sum + (count || 0);
        }
        return sum;
      }, 0);

      // Get EPS and FPS
      const eps = site.logs?.events?.eps || 0;
      const fps = site.logs?.netflow?.fps || 0;

      return {
        siteCount: acc.siteCount + 1,
        pollingDevices: acc.pollingDevices + pollingDevices,
        logDevices: acc.logDevices + logDevices,
        totalEps: acc.totalEps + eps,
        totalFps: acc.totalFps + fps,
      };
    }, {
      siteCount: 0,
      pollingDevices: 0,
      logDevices: 0,
      totalEps: 0,
      totalFps: 0,
    });

    return summary;
  };

  const handleLoad = (deployment: Deployment) => {
    const warnings: string[] = [];
    
    // Create a new config object with the saved name
    const configWithName = {
        ...deployment.config,
        deploymentName: deployment.name  // Use the saved name from Supabase
    };

    if (warnings.length > 0) {
        setWarnings(warnings);
        setWarningDialogOpen(true);
    }

    // Pass the updated config with the correct name
    onLoadConfig(configWithName, deployment.sites);
    setOpen(false);
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
            <FolderOpen className="w-4 h-4 mr-2" />
            <span className="hidden xl:inline">Load Deployment</span>
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="max-w-[95vw] w-full lg:max-w-4xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
              Load Saved Deployment
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
              Select a previously saved deployment configuration to load
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
              </div>
            ) : deployments.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Info className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-2">No Saved Deployments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You haven't saved any deployments yet.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {deployments.map((deployment) => {
                    const summary = getSiteSummary(deployment.sites);
                    return (
                      <div
                        key={deployment.id}
                        className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all cursor-pointer group"
                        onClick={() => handleLoad(deployment)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                {deployment.name}
                              </h3>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatDate(deployment.updated_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                          

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Sites</span>
                                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{summary.siteCount}</p>
                            </div>

                            <div className="bg-indigo-50 dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Polling Devices</span>
                                <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">{summary.pollingDevices.toLocaleString()}</p>
                            </div>

                            <div className="bg-purple-50 dark:bg-gray-700 border border-purple-100 dark:border-gray-600 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Logs Devices</span>
                                <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">{summary.logDevices.toLocaleString()}</p>
                            </div>

                            <div className="bg-rose-50 dark:bg-gray-700 border border-rose-100 dark:border-gray-600 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-rose-700 dark:text-rose-300">Max Load</span>
                                <Gauge className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              </div>
                              <p className="text-lg font-semibold text-rose-900 dark:text-rose-100">{deployment.config.maxLoad}%</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                            <div className="bg-emerald-50 dark:bg-gray-700 border border-emerald-100 dark:border-gray-600 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Events/sec</span>
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">{summary.totalEps.toLocaleString()}</p>
                            </div>

                            <div className="bg-cyan-50 dark:bg-gray-700 border border-cyan-100 dark:border-gray-600 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Flows/sec</span>
                                <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <p className="text-lg font-semibold text-cyan-900 dark:text-cyan-100">{summary.totalFps.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <AlertDialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <AlertDialogContent className="bg-yellow-50 border-yellow-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Load Warnings
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <span className="text-sm text-yellow-600">
                  Please review the following warnings:
                </span>
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-600">{warning}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setWarningDialogOpen(false)}
              className="bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100"
            >
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 