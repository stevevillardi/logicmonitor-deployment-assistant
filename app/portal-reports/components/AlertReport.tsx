'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Search, FileText, TableIcon, ChevronDown, ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactDOM from 'react-dom/client';
import PDFTemplate from './AlertPDFTemplate';

interface AlertReportProps {
  portalName: string;
  bearerToken: string;
}

interface Alert {
  id: string;
  severity: number;
  startEpoch: number;
  monitorObjectName: string;
  resourceTemplateName: string;
  instanceName: string;
  dataPointName: string;
  alertValue: string;
  [key: string]: any; // Allow for additional properties
}

interface PaginatedResponse {
  items: Alert[];
  total: number;
  searchId?: string;
}

interface ColumnConfig {
  id: string;
  label: string;
  originalName: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
}

type SortDirection = 'asc' | 'desc' | null;
interface SortConfig {
  column: string;
  direction: SortDirection;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Get the severity badge color
const getSeverityBadgeColor = (severity: number): string => {
  const colors: { [key: number]: string } = {
    4: 'bg-red-100 text-red-700',    // Critical
    2: 'bg-yellow-100 text-yellow-700', // Warning
    3: 'bg-blue-100 text-orange-700',    // Error
  };
  return colors[severity] || 'bg-gray-100 text-gray-700';
};

// Get severity display text and color
const getSeverityDisplay = (alert: Alert) => {
  if (alert.cleared) {
    return {
      text: 'Cleared',
      color: 'bg-green-100 text-green-700'
    };
  }
  
  return {
    text: alert.severity === 4 ? 'Critical' : 
          alert.severity === 3 ? 'Error' : 
          alert.severity === 2 ? 'Warning' : 'Unknown',
    color: getSeverityBadgeColor(alert.severity)
  };
};

// SortableHeader component (same as ResourceGroup)
const SortableHeader = ({ 
  column,
  handleColumnRename,
  sortConfig,
  onSort,
  isEditingMode,
}: { 
  column: ColumnConfig;
  handleColumnRename: (columnId: string, newLabel: string) => void;
  sortConfig: SortConfig;
  onSort: (columnId: string) => void;
  isEditingMode: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  return (
    <TableHead 
      ref={setNodeRef} 
      style={{ 
        transform: CSS.Transform.toString(transform),
        transition,
        width: typeof column.width === 'number' ? `${column.width}px` : column.width,
        position: 'relative',
      }} 
      className="cursor-pointer select-none"
      onMouseDown={(e) => {
        if (e.button === 0 && !isEditingMode) {
          e.stopPropagation();
          onSort(column.id);
        }
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        {isEditingMode ? (
          <input
            type="text"
            className="w-full px-2 py-1 text-sm border rounded"
            value={column.label}
            onChange={(e) => {
              e.stopPropagation();
              handleColumnRename(column.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span>{column.label}</span>
            {sortConfig.column === column.id && sortConfig.direction && (
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${
                  sortConfig.direction === 'desc' ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
        )}
      </div>
    </TableHead>
  );
};

const AlertReport = ({ portalName, bearerToken }: AlertReportProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pageSize, setPageSize] = useState(10);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'severity', label: 'Severity', originalName: 'severity' },
    { id: 'startEpoch', label: 'Start Time', originalName: 'startEpoch' },
    { id: 'monitorObjectName', label: 'Resource', originalName: 'monitorObjectName' },
    { id: 'resourceTemplateName', label: 'DataSource', originalName: 'resourceTemplateName' },
    { id: 'instanceName', label: 'Instance', originalName: 'instanceName' },
    { id: 'dataPointName', label: 'DataPoint', originalName: 'dataPointName' },
    { id: 'alertValue', label: 'Value', originalName: 'alertValue' }
  ]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [alertFilter, setAlertFilter] = useState('');
  const [includeClearedAlerts, setIncludeClearedAlerts] = useState(false);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: null });
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);
  const [showProperties, setShowProperties] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const redistributeColumnWidths = useCallback(() => {
    if (!tableRef.current) return;
    
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    
    // First reset all column widths to auto to get natural widths
    setColumns(prev => prev.map(col => ({ 
      ...col, 
      width: 'auto',
      minWidth: col.id === 'severity' ? 100 : 150,  // Set minimum widths
      maxWidth: col.id === 'severity' ? 120 : 400   // Set maximum widths
    })));
    
    // Wait for a render cycle
    setTimeout(() => {
      if (!tableRef.current) return;
      const table = tableRef.current.querySelector('table');
      if (!table) return;

      // Get all rows including header and data
      const rows = table.querySelectorAll('tr');
      const columnCount = columns.length;
      const columnWidths = new Array(columnCount).fill(0);
  
      // Calculate maximum width needed for each column
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        cells.forEach((cell, index) => {
          if (index < columnCount) {
            const width = cell.getBoundingClientRect().width;
            columnWidths[index] = Math.max(columnWidths[index], width);
          }
        });
      });
  
      // Update column widths with constraints
      setColumns(prev => prev.map((col, i) => {
        const calculatedWidth = Math.ceil(columnWidths[i] + 24); // Add padding
        const minWidth = col.id === 'severity' ? 100 : 150;
        const maxWidth = col.id === 'severity' ? 120 : 400;
        return { 
          ...col, 
          width: Math.min(Math.max(calculatedWidth, minWidth), maxWidth)
        };
      }));
    }, 0);
  }, [columns.length]);

  // Call redistributeColumnWidths after initial render and when data changes
  useEffect(() => {
    if (alerts.length > 0) {
      // Wait for table to render
      setColumns(prev => prev.map((col, i) => ({
        ...col,
        width: undefined
      })));

      // Then calculate widths in next frame
      requestAnimationFrame(() => {
        redistributeColumnWidths();
      });
    }
  }, [alerts.length, redistributeColumnWidths]);

  const fetchAlerts = async () => {
    setLoading(true);
    setIsFetching(true);
    setError('');
    setAlerts([]);
    
    try {
      let offset = 0;
      const size = 250;
      const alertMap = new Map<string, Alert>();
      const propertySet = new Set<string>();

      // Build query parameters
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        size: size.toString(),
        sort: '+resourceId'
      });
      
      // Build filter string parts
      const filterParts = [];
      
      if (startTime) {
        filterParts.push(`startEpoch>:${Math.floor(startTime.getTime() / 1000)}`);
      }
      if (endTime) {
        filterParts.push(`startEpoch<:${Math.floor(endTime.getTime() / 1000)}`);
      }
      
      // Always add rule and type wildcards
      filterParts.push('rule:"*"');
      filterParts.push('type:"*"');
      
      // Add cleared status
      filterParts.push(`cleared:"${includeClearedAlerts}"`);
      
      // Combine all filter parts
      if (filterParts.length > 0) {
        queryParams.append('filter', filterParts.join(','));
      }

      const initialResponse = await fetch(`/santaba/rest/alert/alerts?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'X-Version': '3',
          'x-lm-company': portalName,
        },
      });

      if (!initialResponse.ok) {
        throw new Error(`HTTP error! status: ${initialResponse.status}`);
      }

      const initialData: PaginatedResponse = await initialResponse.json();
      let total = Math.abs(initialData.total);
      let hasMoreAlerts = initialData.total < 0;
      
      initialData.items.forEach(alert => {
        alertMap.set(alert.id, alert);
        Object.keys(alert).forEach(key => propertySet.add(key));
      });
      setProgress({ current: alertMap.size, total });

      while (hasMoreAlerts || offset + size < total) {
        offset += size;
        queryParams.set('offset', offset.toString());
        const response = await fetch(`/santaba/rest/alert/alerts?${queryParams}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'X-Version': '3',
            'x-lm-company': portalName,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PaginatedResponse = await response.json();
        if (data.total < 0) {
          total = Math.abs(data.total);
          hasMoreAlerts = true;
        } else {
          total = data.total;
          hasMoreAlerts = false;
        }
        
        if (data.items.length === 0) {
          break;
        }
        
        data.items.forEach(alert => alertMap.set(alert.id, alert));
        setProgress({ current: alertMap.size, total });
      }

      setAlerts(Array.from(alertMap.values()));
      const existingProps = new Set(columns.map(col => col.originalName));
      setAvailableProperties(Array.from(propertySet)
        .filter(prop => !existingProps.has(prop))
        .sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsFetching(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Filter function
  const getFilteredAlerts = useCallback(() => {
    if (!alertFilter) return alerts;
    
    return alerts.filter(alert => 
      alert.monitorObjectName.toLowerCase().includes(alertFilter.toLowerCase()) ||
      alert.resourceTemplateName.toLowerCase().includes(alertFilter.toLowerCase())
    );
  }, [alerts, alertFilter]);

  // Sorting function
  const getSortedAlerts = useCallback(() => {
    const filtered = getFilteredAlerts();
    if (!sortConfig.column || !sortConfig.direction) return filtered;

    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [getFilteredAlerts, sortConfig]);

  // Pagination
  const getPaginatedAlerts = useCallback(() => {
    const sorted = getSortedAlerts();
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [getSortedAlerts, currentPage, pageSize]);

  // Export functions
  const exportToCSV = () => {
    const filteredData = getFilteredAlerts();
    
    // Prepare headers
    const headers = columns.map(col => col.label);
    
    // Prepare rows
    const rows = filteredData.map(alert => {
      return columns.map(column => {
        if (column.id === 'severity') {
          const { text } = getSeverityDisplay(alert);
          return text;
        }
        if (column.id === 'startEpoch' || column.id === 'endEpoch') {
          return new Date(alert[column.id] * 1000).toLocaleString();
        }
        const value = alert[column.originalName];
        return typeof value === 'object' ? 
          JSON.stringify(value) : 
          String(value ?? '');
      });
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `alert_report_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const doc = printWindow.document;
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Alert History Report</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);
    doc.close();

    const root = ReactDOM.createRoot(doc.getElementById('root')!);
    root.render(
      <PDFTemplate
        alerts={getFilteredAlerts()}
        columns={columns}
        title="Alert History Report"
        date={new Date().toLocaleString()}
      />
    );

    const style = doc.createElement('style');
    style.textContent = `
      @media print {
        @page { size: landscape; margin: 0.5in; }
        body { 
          font-family: 'Inter', sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    doc.head.appendChild(style);

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Column management
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleColumnRename = (columnId: string, newLabel: string) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { ...col, label: newLabel }
          : col
      )
    );
  };

  const addPropertyColumn = (propertyName: string) => {
    setSelectedProperties(prev => [...prev, propertyName]);
  };

  const removePropertyColumn = (propertyName: string) => {
    setSelectedProperties(prev => prev.filter(p => p !== propertyName));
  };

  // Update columns when selected properties change
  useEffect(() => {
    const baseColumns = [
      { id: 'severity', label: 'Severity', originalName: 'severity' },
      { id: 'startEpoch', label: 'Start Time', originalName: 'startEpoch' },
      { id: 'monitorObjectName', label: 'Resource', originalName: 'monitorObjectName' },
      { id: 'resourceTemplateName', label: 'DataSource', originalName: 'resourceTemplateName' },
      { id: 'instanceName', label: 'Instance', originalName: 'instanceName' },
      { id: 'dataPointName', label: 'DataPoint', originalName: 'dataPointName' },
      { id: 'alertValue', label: 'Value', originalName: 'alertValue' }
    ];
    
    const additionalColumns = selectedProperties.map(prop => ({
      id: prop,
      label: prop,
      originalName: prop
    }));
    
    setColumns([...baseColumns, ...additionalColumns]);
  }, [selectedProperties]);

  // Helper function to format date to local ISO string
  const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // Helper function to convert local datetime-local input value to Date
  const fromLocalDateTime = (dateString: string): Date => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  };

  // Function to set last 24 hours
  const setLast24Hours = () => {
    const end = new Date();
    const start = new Date(end);
    start.setHours(end.getHours() - 24);
    setStartTime(start);
    setEndTime(end);
  };

  // Update the datetime inputs

  // Add a function to format property values
  const formatPropertyValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value.toString();
    return String(value);
  };

  // Fields to exclude from the expanded view
  const EXCLUDED_FIELDS = ['monitorObjectGroups'];

  // Update the expanded row section:

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <CardTitle>Alert History</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Report Options */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-700" />
                <span className="font-medium text-gray-900">Report Options</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Time Range</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="datetime-local"
                        value={startTime ? toLocalISOString(startTime) : ''}
                        onChange={(e) => setStartTime(e.target.value ? fromLocalDateTime(e.target.value) : undefined)}
                        max={endTime ? toLocalISOString(endTime) : undefined}
                        className="w-full bg-white border-gray-200"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="datetime-local"
                        value={endTime ? toLocalISOString(endTime) : ''}
                        onChange={(e) => setEndTime(e.target.value ? fromLocalDateTime(e.target.value) : undefined)}
                        min={startTime ? toLocalISOString(startTime) : undefined}
                        className="w-full bg-white border-gray-200"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={setLast24Hours}
                        className="whitespace-nowrap bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                      >
                        Last 24 Hours
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeCleared"
                      checked={includeClearedAlerts}
                      onChange={(e) => setIncludeClearedAlerts(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeCleared" className="text-sm text-gray-700">
                      Include Cleared Alerts
                    </label>
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <Button 
                    onClick={fetchAlerts}
                    disabled={loading || !(portalName && bearerToken)}
                    className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <span>Loading...</span>
                        {isFetching && progress.total > 0 && (
                          <span className="text-sm">
                            ({progress.current} / {progress.total} alerts)
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Load Alerts
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {!loading && alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-4">
              <FileText className="w-12 h-12" />
              <div className="text-center">
                <p className="font-medium">No Alerts Loaded</p>
                <p className="text-sm">Click the &quot;Load Alerts&quot; button above to fetch alert data</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Property Selection Section */}
              {alerts.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-700" />
                        <span className="font-medium text-gray-900">Properties</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {selectedProperties.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedProperties.map((prop) => (
                              <Button
                                key={prop}
                                variant="outline"
                                size="sm"
                                onClick={() => removePropertyColumn(prop)}
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300"
                              >
                                {prop}
                                <X className="w-3 h-3 ml-2" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {availableProperties
                          .filter(prop => !selectedProperties.includes(prop))
                          .map((prop) => (
                            <Button
                              key={prop}
                              variant="outline"
                              size="sm"
                              onClick={() => addPropertyColumn(prop)}
                              className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {prop}
                            </Button>
                          ))}
                        {availableProperties.length === 0 && (
                          <span className="text-sm text-gray-500">No additional properties available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Table */}
              <div className={`bg-white rounded-lg border border-gray-200 ${
                isFullScreen ? 'fixed inset-0 z-50 flex flex-col' : ''
              }`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <TableIcon className="w-5 h-5 text-blue-700" />
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Alerts</span>
                      </div>
                      <div className="relative w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Filter alerts..."
                          value={alertFilter}
                          onChange={(e) => setAlertFilter(e.target.value)}
                          className="pl-9 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={redistributeColumnWidths}
                        className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1.5"
                      >
                        Auto-fit Columns
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingMode(!isEditingMode)}
                        className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1.5"
                      >
                        {isEditingMode ? 'Done' : 'Edit Columns'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToPDF}
                        className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        Export PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {isFullScreen ? (
                          <>
                            <Minimize2 className="w-4 h-4" />
                            Exit Full Screen
                          </>
                        ) : (
                          <>
                            <Maximize2 className="w-4 h-4" />
                            Full Screen
                          </>
                        )}
                      </Button>
                      <span className="text-sm text-gray-600">
                        {getFilteredAlerts().length} {getFilteredAlerts().length === 1 ? 'alert' : 'alerts'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`flex-1 overflow-auto ${isFullScreen ? 'h-[calc(100vh-120px)]' : ''}`}>
                  <div className="overflow-x-auto" ref={tableRef}>
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <SortableContext 
                              items={columns} 
                              strategy={horizontalListSortingStrategy}
                            >
                              {columns.map((column) => (
                                <SortableHeader 
                                  key={column.id} 
                                  column={column} 
                                  handleColumnRename={handleColumnRename}
                                  sortConfig={sortConfig}
                                  onSort={(columnId) => {
                                    setSortConfig(current => ({
                                      column: columnId,
                                      direction: 
                                        current.column === columnId
                                          ? current.direction === 'asc' 
                                            ? 'desc' 
                                            : current.direction === 'desc'
                                              ? null
                                              : 'asc'
                                          : 'asc'
                                    }));
                                  }}
                                  isEditingMode={isEditingMode}
                                />
                              ))}
                            </SortableContext>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedAlerts().length > 0 ? (
                            getPaginatedAlerts().map((alert) => (
                              <>
                                <TableRow 
                                  key={alert.id}
                                  className="cursor-pointer hover:bg-gray-50"
                                  onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                                >
                                  {columns.map((column) => {
                                    let content;
                                    if (column.id === 'severity') {
                                      const { text, color } = getSeverityDisplay(alert);
                                      content = (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                                          {text}
                                        </span>
                                      );
                                    } else if (column.id === 'startEpoch' || column.id === 'endEpoch' || column.id === "achedEpoch") {
                                      content = new Date(alert[column.id] * 1000).toLocaleString();
                                    } else {
                                      const value = alert[column.originalName];
                                      content = formatPropertyValue(value);
                                    }

                                    return (
                                      <TableCell 
                                        key={column.id} 
                                        style={{ 
                                          width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                                          minWidth: column.minWidth,
                                          maxWidth: column.maxWidth,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {content}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                                {expandedAlertId === alert.id && (
                                  <TableRow>
                                    <TableCell colSpan={columns.length} className="bg-gray-50 p-4">
                                      <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
                                          {Object.entries(alert)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
                                            .map(([key, value]) => (
                                              <div key={key} className="flex flex-col">
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                  {key}
                                                </div>
                                                <div className="mt-1 text-sm text-gray-900 break-words">
                                                  {formatPropertyValue(value)}
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-500 italic">
                                          Click row to collapse details
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell 
                                colSpan={columns.length} 
                                className="h-24 text-center text-gray-500"
                              >
                                {alerts.length > 0 ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Search className="w-5 h-5 text-gray-400" />
                                    <span>No alerts match the current filter</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <TableIcon className="w-5 h-5 text-gray-400" />
                                    <span>Load alerts to view the report</span>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </DndContext>
                  </div>
                </div>

                {/* Table Pagination */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 order-2 sm:order-1">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(getFilteredAlerts().length / pageSize), p + 1))}
                          disabled={currentPage === Math.ceil(getFilteredAlerts().length / pageSize)}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page:</span>
                        <Select
                          value={pageSize.toString()}
                          onValueChange={(value) => {
                            setPageSize(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[70px] h-8 bg-white border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {PAGE_SIZE_OPTIONS.map((size) => (
                              <SelectItem key={size} value={size.toString()}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 order-1 sm:order-2">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, getFilteredAlerts().length)} of {getFilteredAlerts().length} alerts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertReport; 