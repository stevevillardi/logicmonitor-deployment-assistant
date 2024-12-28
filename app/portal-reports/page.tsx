'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, ChevronLeft, Info, Eye, EyeOff } from 'lucide-react';
import DeviceReport from './components/DeviceReport';
import ResourceGroupReport from './components/ResourceGroupReport';
import AlertReport from './components/AlertReport';
import ProtectedRoute from '../components/Shared/ProtectedRoute';

type ReportType = 'device-inventory' | 'alerts-report' | 'resource-groups' | null;

const PortalReports = () => {
  const [portalName, setPortalName] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [reportType, setReportType] = useState<ReportType>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    // Load stored values after component mounts
    const savedPortalName = localStorage.getItem('portalName');
    const savedAuth = localStorage.getItem('authorized');
    
    if (savedPortalName) setPortalName(savedPortalName);
    if (savedAuth) {
      try {
        // Validate that we have a non-empty string before parsing
        if (typeof savedAuth === 'string' && savedAuth.trim()) {
          const parsedAuth = JSON.parse(savedAuth);
          // Validate the expected structure exists
          if (parsedAuth && 
              typeof parsedAuth === 'object' && 
              parsedAuth.BearerToken?.value &&
              typeof parsedAuth.BearerToken.value === 'string') {
            setBearerToken(parsedAuth.BearerToken.value);
          } else {
            console.warn('Invalid bearer token structure in localStorage');
          }
        }
      } catch (err) {
        console.error('Error parsing bearer token from localStorage:', err);
        // Optionally clear invalid data
        localStorage.removeItem('authorized');
      }
    }
  }, []); 

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

    localStorage.setItem('authorized', JSON.stringify(authorizedData));
  };

  useEffect(() => {
    if (portalName) {
      localStorage.setItem('portalName', portalName);
    }
  }, [portalName]);

  return (
    <ProtectedRoute>
    <div className="min-h-screen w-full flex items-center justify-center bg-[#040F4B]">
      <Card className="w-full max-w-[1700px] bg-white shadow-lg m-6">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-700" />
              <CardTitle>Portal Reports (Beta)</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Deployment Assistant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 min-h-[800px]">
          <div className="space-y-6">
            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Info className="w-5 h-5" />
                <span className="font-medium">Report Examples</span>
              </div>
              <p className="text-sm text-blue-600">
                This section demonstrates how to use the LMv3 API to fetch and display data in customizable report formats. Enter your portal name and associated Bearer token to get started. Choose a report type to see an example implementation.
              </p>
            </div>

            {/* Report Details Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Portal Name</label>
                    <Input
                      placeholder="Enter portal name..."
                      value={portalName}
                      onChange={(e) => setPortalName(e.target.value.replace('.logicmonitor.com', ''))}
                      className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bearer Token</label>
                    <div className="relative">
                      <Input
                        type={showToken ? "text" : "password"}
                        placeholder="Enter your bearer token..."
                        value={bearerToken}
                        onChange={handleBearerTokenChange}
                        className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Report Type</label>
                    <Select
                      value={reportType || ''}
                      onValueChange={(value: string) => setReportType(value === '' ? null : value as ReportType)}
                    >
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                        <SelectValue placeholder="Select a report type to begin" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="device-inventory">Device Inventory Report</SelectItem>
                        <SelectItem value="alerts-report">Alerts Report</SelectItem>
                        <SelectItem value="resource-groups">Resource Group Inventory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Components */}
            {!reportType && (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Report Selected</h3>
                <p className="text-sm text-gray-600">
                  Please select a report type from the dropdown above to get started.
                </p>
              </div>
            )}

            {reportType === 'device-inventory' && (
              <DeviceReport 
                portalName={portalName}
                bearerToken={bearerToken}
              />
            )}

            {reportType === 'alerts-report' && (
              <AlertReport
                portalName={portalName}
                bearerToken={bearerToken}
              />
            )}

            {reportType === 'resource-groups' && (
              <ResourceGroupReport 
                portalName={portalName}
                bearerToken={bearerToken}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
};

export default PortalReports;