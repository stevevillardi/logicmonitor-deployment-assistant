declare global {
  interface Window {
    tailwindLoaded: boolean;
  }
}

'use client';
import React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { List, Grid } from 'lucide-react';
import AlertDetails from './AlertDetails';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AlertReportProps {
  portalName: string;
  bearerToken: string;
}

export interface Alert {
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
    3: 'bg-orange-100 text-orange-700',    // Error
  };
  return colors[severity] || 'bg-gray-100 text-gray-700';
};

// Get severity display text and color
export const getSeverityDisplay = (alert: Alert) => {
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

interface TimelineData {
  timestamp: number;
  count: number;
}

const formatTimeLabel = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    return date.toLocaleDateString(undefined, { 
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    });
  } else if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString(undefined, { 
      hour: 'numeric',
      minute: '2-digit'
    })}`;
  } else {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'startEpoch', direction: 'desc' });
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);
  const [showProperties, setShowProperties] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [propertyView, setPropertyView] = useState<'grid' | 'list'>('grid');
  const [propertySearch, setPropertySearch] = useState('');
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [propertyPageSize, setPropertyPageSize] = useState(20);
  const [propertyPage, setPropertyPage] = useState(1);
  const [showTimeline, setShowTimeline] = useState(true);

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
      const size = 1000;
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
            @media print {
              @page { size: landscape; margin: 0.5in; }
            }
            .loading {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-align: center;
              font-family: Inter, sans-serif;
            }
          </style>
        </head>
        <body>
          <div id="root">
            <div class="loading">
              <h2>Generating Report...</h2>
              <p>Processing ${getFilteredAlerts().length} alerts</p>
            </div>
          </div>
          <script>
            window.tailwindLoaded = false;
            window.addEventListener('load', () => {
              window.tailwindLoaded = true;
            });
          </script>
        </body>
      </html>
    `);
    doc.close();

    const checkTailwind = () => {
      if (printWindow.tailwindLoaded) {
        const alerts = getFilteredAlerts();
        // Only process first 1000 alerts for PDF
        const limitedAlerts = alerts.slice(0, 10000);
        
        const root = ReactDOM.createRoot(doc.getElementById('root')!);
        root.render(
          <PDFTemplate
            alerts={limitedAlerts}
            columns={columns}
            title={`Alert History Report ${limitedAlerts.length < alerts.length ? `(Showing first ${limitedAlerts.length} of ${alerts.length} alerts)` : ''}`}
            date={new Date().toLocaleString()}
            timelineData={getTimelineData()}
          />
        );

        setTimeout(() => {
          printWindow.print();
        }, 1500);
      } else {
        setTimeout(checkTailwind, 100);
      }
    };

    checkTailwind();
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

  // Utility function to format timestamps
  const formatTimestamp = (value: any, fieldName: string): string => {
    // Handle epoch timestamps and fields ending with "On"
    if (fieldName.toLowerCase().includes('epoch') || fieldName.endsWith('On')) {
      const epoch = parseInt(value);
      if (!isNaN(epoch) && epoch !== 0) {
        return new Date(epoch * 1000).toLocaleString();
      } else if (epoch === 0) {
        return 'N/A';
      }
    }
    return String(value ?? 'N/A');
  };

  // Helper function to get paginated properties
  const getPaginatedProperties = () => {
    const filteredProps = availableProperties
      .filter(prop => prop.toLowerCase().includes(propertySearch.toLowerCase()));
    
    const total = filteredProps.length;
    const totalPages = Math.ceil(total / propertyPageSize);
    const start = (propertyPage - 1) * propertyPageSize;
    const end = start + propertyPageSize;
    
    return {
      properties: filteredProps
        .slice(start, end)
        .map(prop => [prop, 1] as [string, number]),
      total,
      totalPages
    };
  };

  // Generate timeline data from alerts
  const getTimelineData = useCallback((): TimelineData[] => {
    if (!alerts.length) return [];
    
    // Group alerts by hour
    const hourGroups = alerts.reduce((acc, alert) => {
      const hour = Math.floor(alert.startEpoch / 3600) * 3600;
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Convert to array and sort by timestamp
    return Object.entries(hourGroups)
      .map(([timestamp, count]) => ({
        timestamp: parseInt(timestamp),
        count
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [alerts]);

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
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="w-full p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-700" />
                      <span className="font-medium text-gray-900">Alert Fields</span>
                    </div>
                    <div className="relative w-[300px]" onClick={e => e.stopPropagation()}>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search properties..."
                        value={propertySearch}
                        onChange={(e) => setPropertySearch(e.target.value)}
                        className="pl-9 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPropertyView('grid')}
                        className={`${
                          propertyView === 'grid' 
                            ? 'bg-white text-blue-700 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        } px-3 py-1.5 rounded`}
                      >
                        <TableIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPropertyView('list')}
                        className={`${
                          propertyView === 'list' 
                            ? 'bg-white text-blue-700 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        } px-3 py-1.5 rounded`}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform cursor-pointer ${
                        isPropertiesOpen ? 'transform rotate-180' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPropertiesOpen(!isPropertiesOpen);
                      }}
                    />
                  </div>
                </div>
                
                {isPropertiesOpen && (
                  <div className="space-y-4 p-4">
                    {/* Selected Properties Preview */}
                    {selectedProperties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProperties.map(prop => (
                          <div 
                            key={prop}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm"
                          >
                            <span>{prop}</span>
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-blue-900"
                              onClick={() => setSelectedProperties(prev => prev.filter(p => p !== prop))}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Property List */}
                    {propertyView === 'grid' ? (
                      <div className="grid grid-cols-4 gap-2">
                        {getPaginatedProperties().properties.map(([prop, count]) => (
                          <div
                            key={prop}
                            className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors hover:border-blue-200 ${
                              selectedProperties.includes(prop)
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                            onClick={() => {
                              setSelectedProperties(prev =>
                                prev.includes(prop)
                                  ? prev.filter(p => p !== prop)
                                  : [...prev, prop]
                              );
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                              <Checkbox
                                checked={selectedProperties.includes(prop)}
                                className="pointer-events-none shrink-0"
                              />
                              <span className="text-xs text-gray-700 truncate">{prop}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {count}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {getPaginatedProperties().properties.map(([prop, count]) => (
                          <div 
                            key={prop}
                            className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer
                              ${selectedProperties.includes(prop) 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}
                            onClick={() => {
                              setSelectedProperties(prev => 
                                prev.includes(prop) 
                                  ? prev.filter(p => p !== prop)
                                  : [...prev, prop]
                              );
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedProperties.includes(prop)}
                                className="pointer-events-none"
                              />
                              <span className="text-sm text-gray-700">{prop}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {count}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Property Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 order-2 sm:order-1">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPropertyPage(p => Math.max(1, p - 1))}
                            disabled={propertyPage === 1}
                            className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPropertyPage(p => Math.min(getPaginatedProperties().totalPages, p + 1))}
                            disabled={propertyPage === getPaginatedProperties().totalPages}
                            className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Items per page:</span>
                          <Select
                            value={propertyPageSize.toString()}
                            onValueChange={(value) => {
                              setPropertyPageSize(Number(value));
                              setPropertyPage(1);
                            }}
                          >
                            <SelectTrigger className="w-[70px] h-8 bg-white border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {[20, 50, 100].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 order-1 sm:order-2">
                        Showing {((propertyPage - 1) * propertyPageSize) + 1} to {Math.min(propertyPage * propertyPageSize, getPaginatedProperties().total)} of {getPaginatedProperties().total} properties
                      </div>
                    </div>

                    {availableProperties.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No properties found matching your search
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline Graph */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="w-full p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <span className="font-medium text-gray-900">Alert Timeline</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform cursor-pointer ${
                      showTimeline ? 'transform rotate-180' : ''
                    }`}
                    onClick={() => setShowTimeline(!showTimeline)}
                  />
                </div>
                {showTimeline && (
                  <div className="p-4">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getTimelineData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="alertCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(value) => formatTimeLabel(value)}
                            interval="preserveStartEnd"
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis 
                            allowDecimals={false} 
                            tick={{ fontSize: 11 }}
                            label={{ 
                              value: 'Alert Count', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fontSize: 12 }
                            }}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-lg">
                                    <p className="text-sm text-gray-600">
                                      {new Date(payload[0].payload.timestamp * 1000).toLocaleString()}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {payload[0].value} alerts
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#1D4ED8"
                            fillOpacity={1}
                            fill="url(#alertCount)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

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
                <div className={`flex-1 ${isFullScreen ? 'h-[calc(100vh-120px)]' : ''}`}>
                  <div className="overflow-x-auto overflow-y-visible" style={{ 
                    maxWidth: '100%',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }} ref={tableRef}>
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
                              <React.Fragment key={alert.id}>
                                <TableRow 
                                  className="cursor-pointer hover:bg-gray-50"
                                  onClick={() => setSelectedAlert(alert)}
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
                                    } else {
                                      const value = alert[column.originalName];
                                      content = formatTimestamp(value, column.originalName);
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
                              </React.Fragment>
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

              {/* Alert Details Dialog */}
              <AlertDetails
                alert={selectedAlert!}
                open={selectedAlert !== null}
                onClose={() => setSelectedAlert(null)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertReport; 