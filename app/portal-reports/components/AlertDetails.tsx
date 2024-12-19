import { Alert } from './AlertReport';
import { getSeverityDisplay } from './AlertReport';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { X, Info, Server, AlertCircle, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertDetailsProps {
  alert: Alert;
  open: boolean;
  onClose: () => void;
}

const formatTimestamp = (value: any, key: string) => {
  if (key.toLowerCase().includes('epoch') && typeof value === 'number' && value !== 0) {
    return new Date(value * 1000).toLocaleString();
  }
  return String(value ?? 'N/A');
};

const EXCLUDED_FIELDS = ['id', '_type', '_accountId', '_version', 'monitorObjectGroups'];

const AlertDetails = ({ alert, open, onClose }: AlertDetailsProps) => {
  if (!alert) return null;

  const { text: severityText, color: severityColor } = getSeverityDisplay(alert);

  const isValidValue = (value: any, key: string) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && (!value.trim() || value === 'N/A' || value == "undefined")) return false;
    if (key === 'monitorObjectGroups' && Array.isArray(value)) return true;
    return true;
  };

  const formatGroups = (groups: any[]) => {
    return groups.map(group => group.name || group.fullPath).join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl bg-blue-50 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-100 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-700" />
            Alert Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          {/* Alert Summary */}
          <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColor}`}>
                {severityText}
              </span>
              <span className="text-sm text-gray-500">
                {formatTimestamp(alert.startEpoch, 'startEpoch')}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{alert.monitorObjectName}</h3>
              <p className="text-sm text-gray-600">{alert.dataPointName}</p>
            </div>
          </div>

          {/* Alert Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#040F4B] flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-700" />
                Resource Details
              </h4>
              <dl className="space-y-2 bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Resource</dt>
                  <dd className="mt-1">{alert.monitorObjectName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">DataSource</dt>
                  <dd className="mt-1">{alert.resourceTemplateName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Instance</dt>
                  <dd className="mt-1">{alert.instanceName}</dd>
                </div>
              </dl>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#040F4B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-700" />
                Alert Details
              </h4>
              <dl className="space-y-2 bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div>
                  <dt className="text-sm font-medium text-gray-500">DataPoint</dt>
                  <dd className="mt-1">{alert.dataPointName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Value</dt>
                  <dd className="mt-1">{alert.alertValue}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColor}`}>
                      {severityText}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Member of Groups Section */}
          {alert.monitorObjectGroups && alert.monitorObjectGroups.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#040F4B] flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                Group Membership
              </h4>
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {alert.monitorObjectGroups.map((group: any, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-sm"
                    >
                      {group.name || group.fullPath}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Properties */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#040F4B] flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              All Fields
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              {Object.entries(alert)
                .sort(([a], [b]) => a.localeCompare(b))
                .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
                .filter(([key, value]) => isValidValue(value, key))
                .map(([key, value]) => (
                  <div key={key} className="overflow-hidden">
                    <dt className="text-sm font-medium text-gray-500 truncate">{key}</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-words">
                      {formatTimestamp(value, key)}
                    </dd>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-blue-100 pt-3">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDetails; 