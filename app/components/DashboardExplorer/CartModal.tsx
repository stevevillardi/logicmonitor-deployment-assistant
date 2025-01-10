import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input, Button } from "@/components/ui/enhanced-components";
import { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { Loader2, Check, X, AlertCircle, Layout, LayoutDashboard, Eye, EyeOff, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { devError, devLog } from "../Shared/utils/debug";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DashboardImportStatus {
  path: string;
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  error?: string;
}

// Helper functions for API calls
const createDashboardGroup = async (portalName: string, bearerToken: string, groupName: string) => {
  const response = await fetch('/santaba/rest/dashboard/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lm-company': portalName,
      'Authorization': bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`
    },
    body: JSON.stringify({
      name: groupName,
      parentId: 1,
      description: "Dashboards imported via LM Deployment Assistant"
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to create dashboard group (${response.status})`);
  }

  return (await response.json()).id;
};

const findOrCreateDashboardGroup = async (portalName: string, bearerToken: string, groupName: string) => {
  // First check if group exists
  const groupsResponse = await fetch('/santaba/rest/dashboard/groups', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-lm-company': portalName,
      'Authorization': bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`
    }
  });

  if (!groupsResponse.ok) {
    const errorData = await groupsResponse.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch dashboard groups (${groupsResponse.status})`);
  }

  const groups = await groupsResponse.json();
  const existingGroup = groups.items?.find((g: any) => g.name === groupName);

  if (existingGroup) {
    return existingGroup.id;
  }

  return createDashboardGroup(portalName, bearerToken, groupName);
};

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { selectedDashboards, clearCart, removeDashboard } = useCart();
  const [portalName, setPortalName] = useState("");
  const [dashboardGroupName, setDashboardGroupName] = useState("LMDA Dashboards");
  const [bearerToken, setBearerToken] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatuses, setImportStatuses] = useState<DashboardImportStatus[]>([]);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load persistent settings from localStorage
      const savedPortalName = localStorage.getItem('portalName');
      const savedGroupName = localStorage.getItem('lmda_dashboard_group_name');
      const savedAuth = localStorage.getItem('authorized');
      
      if (savedAuth) {
        try {
          const parsedAuth = JSON.parse(savedAuth);

          if (parsedAuth?.BearerToken?.value) {
            setBearerToken(parsedAuth.BearerToken.value);
          }
        } catch (err) {
          devError('Error parsing bearer token:', err);
        }
      }

      if (savedPortalName) setPortalName(savedPortalName);
      if (savedGroupName) setDashboardGroupName(savedGroupName);

      // Reset import statuses
      setImportStatuses(
        selectedDashboards.map(d => ({
          path: d.path,
          name: d.name,
          status: 'pending'
        }))
      );
    }
  }, [isOpen, selectedDashboards]);

  const processPortalName = (input: string): string => {
    return input.replace('.logicmonitor.com', '').trim();
  };

  const handleImport = async () => {
    if (!portalName || !bearerToken) {
      setError("Please fill in all fields");
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      // Fetch full dashboard details from Supabase

      const { data: dashboardDetails, error: fetchError } = await supabaseBrowser
        .from('dashboard-configs')
        .select('*')
        .in('path', selectedDashboards.map(d => d.path));

      if (fetchError) throw fetchError;

      // Reset import statuses
      setImportStatuses(
        selectedDashboards.map(d => ({
          path: d.path,
          name: d.name,
          status: 'pending'
        }))
      );

      // Find or create dashboard group
      const groupId = await findOrCreateDashboardGroup(portalName, bearerToken, dashboardGroupName);

      // Import each dashboard
      for (const minimalDashboard of selectedDashboards) {
        try {
          const fullDashboard = dashboardDetails.find(d => d.path === minimalDashboard.path);
          if (!fullDashboard) throw new Error(`Dashboard details not found for ${minimalDashboard.name}`);

          const result = await importDashboard(portalName, bearerToken, groupId, fullDashboard);
          
          setImportStatuses(prev => 
            prev.map(s => 
              s.path === minimalDashboard.path 
                ? { 
                    ...s, 
                    status: result?.warning ? 'warning' : 'success',
                    error: result?.warning ? result.message : undefined
                  } 
                : s
            )
          );
        } catch (err) {
          setImportStatuses(prev => 
            prev.map(s => 
              s.path === minimalDashboard.path 
                ? { ...s, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' } 
                : s
            )
          );
        }
      }
    } catch (err) {
      let errorMessage = 'Failed to import dashboards';
      
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          errorMessage = 'Invalid credentials. Please check your portal name and bearer token.';
        } else if (err.message.includes('403')) {
          errorMessage = 'Access denied. Please check your bearer token permissions.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Portal not found. Please check the portal name.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handlePortalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = processPortalName(e.target.value);
    setPortalName(value);
    localStorage.setItem('portalName', value);
  };

  const handleDashboardGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDashboardGroupName(value);
    localStorage.setItem('lmda-dashboard-group-name', value);
  };

  const handleBearerTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBearerToken(value);
    
    // Rebuild the authorized object structure
    const authorizedData = {
      BearerToken: {
        name: "BearerToken",
        schema: {
          type: "http",
          scheme: "bearer"
        },  
        value: value
      }
    };
    devLog('authorizedData', authorizedData);
    // Save to localStorage
    localStorage.setItem('authorized', JSON.stringify(authorizedData));
  };

  const importDashboard = async (portalName: string, bearerToken: string, groupId: number, dashboard: any) => {
    const dashboardData = {
      description: dashboard.content.description,
      groupId: groupId,
      groupName: dashboardGroupName,
      name: dashboard.content.name,
      sharable: true,
      owner: "",
      template: {
        ...dashboard.content,
        group: undefined
      },
      widgetTokens: dashboard.content.widgetTokens || [],
      widgetsConfigVersion: dashboard.content.widgetsConfigVersion || 1
    };

    const response = await fetch('/santaba/rest/dashboard/dashboards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lm-company': portalName,
        'Authorization': bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`
      },
      body: JSON.stringify(dashboardData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 409) {
        return {
          warning: true,
          message: `Dashboard "${dashboard.content.name}" already exists in this portal`
        };
      }
      if (response.status === 400) {
        return {
          warning: true,
          message: `Dashboard imported but some widgets could not be created - check LogicModule dependencies`
        };
      }
      if (response.status === 401) {
        return {
          warning: true,
          message: `Invalid credentials. Please check your portal name and bearer token.`
        };
      }
      if (response.status === 403) {
        return {
          warning: true,
          message: `Access denied. Please check your bearer token permissions.`
        };
      }
      throw new Error(errorData?.message || `API Error (${response.status})`);
    }

    return response.json();
  };

  const handleClose = () => {
    if (!isImporting) {
      // Remove both successful and warning status dashboards from cart
      const completedPaths = importStatuses
        .filter(status => status.status === 'success' || status.status === 'warning')
        .map(status => status.path);

      // Remove completed dashboards from cart
      completedPaths.forEach(path => removeDashboard(path));
      
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0">
        <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-blue-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Import Dashboards
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-700 dark:text-blue-300">
            Import selected dashboards into your LogicMonitor portal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm p-3">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-medium text-blue-900 dark:text-gray-100">
                Selected Dashboards ({selectedDashboards.length})
              </h3>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {importStatuses.map(dashboard => (
                <div key={dashboard.path} 
                  className="text-sm text-blue-700 dark:text-blue-300 flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    {dashboard.name}
                  </div>
                  <div className="flex-shrink-0">
                    {dashboard.status === 'pending' && !isImporting && (
                      <div className="w-5 h-5" />
                    )}
                    {dashboard.status === 'pending' && isImporting && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    )}
                    {dashboard.status === 'success' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {dashboard.status === 'error' && (
                      <div className="flex items-center gap-1">
                        <X className="w-5 h-5 text-red-500" />
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent 
                              side="left" 
                              sideOffset={5}
                              className="bg-gray-900 text-white border-none shadow-lg"
                            >
                              {dashboard.error}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    {dashboard.status === 'warning' && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-amber-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent 
                              side="left" 
                              sideOffset={5}
                              className="bg-gray-900 text-white border-none shadow-lg"
                            >
                              {dashboard.error}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm p-3 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900 dark:text-gray-100">Dashboard Group Name</label>
              <Input
                value={dashboardGroupName}
                onChange={handleDashboardGroupNameChange}
                placeholder="LMDA Dashboards"
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Enter the name of the dashboard group to import the dashboards into
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900 dark:text-gray-100">Portal Name</label>
              <Input
                value={portalName}
                onChange={handlePortalNameChange}
                placeholder="company"
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Enter your portal name (e.g., &quot;company&quot; from company.logicmonitor.com)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900 dark:text-gray-100">Bearer Token</label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={bearerToken}
                  onChange={handleBearerTokenChange}
                  placeholder="Bearer Token..."
                  className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex gap-2 text-xs sm:text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-blue-100 dark:border-gray-700 pt-3 mt-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            >
              Close
            </Button>
            <Button 
              onClick={handleImport}
              disabled={isImporting || !portalName || !bearerToken}
              className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Dashboards'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal; 