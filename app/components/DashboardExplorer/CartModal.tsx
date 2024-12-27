import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { Loader2, ShoppingCart, Check, X, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DashboardImportStatus {
  path: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { selectedDashboards, clearCart } = useCart();
  const [portalName, setPortalName] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatuses, setImportStatuses] = useState<DashboardImportStatus[]>([]);

  useEffect(() => {
    if (isOpen) {
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

    const processedPortalName = processPortalName(portalName);
    let groupId: number;

    try {
      // First check if LMDA Dashboards group exists
      const groupsResponse = await fetch('/santaba/rest/dashboard/groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-lm-company': processedPortalName,
          'Authorization': bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`
        }
      });

      if (!groupsResponse.ok) {
        const errorData = await groupsResponse.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Failed to fetch dashboard groups (${groupsResponse.status}: ${groupsResponse.statusText})`
        );
      }

      const groups = await groupsResponse.json();
      const existingGroup = groups.items?.find((g: any) => g.name === "LMDA Dashboards");

      if (existingGroup) {
        groupId = existingGroup.id;
      } else {
        // Create new dashboard group if it doesn't exist
        const createGroupResponse = await fetch('/santaba/rest/dashboard/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-lm-company': processedPortalName,
            'Authorization': bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`
          },
          body: JSON.stringify({
            name: "LMDA Dashboards",
            parentId: 1,
            description: "Dashboards imported via LM Deployment Assistant"
          })
        });

        if (!createGroupResponse.ok) {
          const errorData = await createGroupResponse.json().catch(() => null);
          throw new Error(
            errorData?.message || 
            `Failed to create dashboard group (${createGroupResponse.status}: ${createGroupResponse.statusText})`
          );
        }

        const newGroup = await createGroupResponse.json();
        groupId = newGroup.id;
      }

      // Reset import statuses
      setImportStatuses(
        selectedDashboards.map(d => ({
          path: d.path,
          name: d.name,
          status: 'pending'
        }))
      );

      for (const dashboard of selectedDashboards) {
        try {
          // Format the dashboard data according to the API requirements
          const dashboardData = {
            description: dashboard.content.description,
            groupId: groupId,
            groupName: "LMDA Dashboards",
            name: dashboard.content.name,
            sharable: true,
            owner: "",
            template: {
              ...dashboard.content,
              group: undefined  // Exclude group property
            },
            widgetTokens: dashboard.content.widgetTokens || [],
            widgetsConfigVersion: dashboard.content.widgetsConfigVersion || 1
          };

          const dashboardResponse = await fetch('/santaba/rest/dashboard/dashboards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-lm-company': processedPortalName,
              'Authorization': bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`
            },
            body: JSON.stringify(dashboardData)
          });

          if (!dashboardResponse.ok) {
            const errorData = await dashboardResponse.json().catch(() => null);
            throw new Error(
              errorData?.message || 
              `API Error (${dashboardResponse.status}: ${dashboardResponse.statusText})`
            );
          }

          // Update status to success
          setImportStatuses(prev => 
            prev.map(s => 
              s.path === dashboard.path 
                ? { ...s, status: 'success' } 
                : s
            )
          );
        } catch (err) {
          // Update status to error with message
          setImportStatuses(prev => 
            prev.map(s => 
              s.path === dashboard.path 
                ? { ...s, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' } 
                : s
            )
          );
        }
      }

      // Check if all imports were successful before closing
      const allSuccessful = importStatuses.every(s => s.status === 'success');

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
    setPortalName(processPortalName(e.target.value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-0 overflow-visible bg-white dark:bg-gray-950 border-none shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold">Import Dashboards</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
              Selected Dashboards ({selectedDashboards.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border bg-gray-50/50 dark:bg-gray-900/50 p-3">
              {importStatuses.map(dashboard => (
                <div key={dashboard.path} 
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between gap-2 p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm"
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
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Portal Name</label>
            <Input
              value={portalName}
              onChange={handlePortalNameChange}
              placeholder="company"
              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your portal name (e.g., &quot;company&quot; from company.logicmonitor.com)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Bearer Token</label>
            <Input
              type="password"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              placeholder="Bearer Token..."
              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (!isImporting) {
                clearCart();
                onClose();
              }
            }}
            disabled={isImporting}
            className="bg-white dark:bg-gray-800"
          >
            Close
          </Button>
          <Button 
            onClick={handleImport}
            disabled={isImporting || !portalName || !bearerToken}
            className="bg-blue-600 text-white hover:bg-blue-700"
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
      </DialogContent>
    </Dialog>
  );
};

export default CartModal; 