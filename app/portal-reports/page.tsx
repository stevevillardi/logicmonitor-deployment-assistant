'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Search, FileText, Info, ChevronDown, TableIcon, ChevronLeft, ChevronRight, List, X, Maximize2, Minimize2, Settings } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactDOM from 'react-dom/client';
import PDFTemplate from '../components/PDFReport/PDFTemplate';

interface Device {
  id: number;
  name: string;
  displayName: string;
  systemProperties: PropertyItem[];
  customProperties: PropertyItem[];
  inheritedProperties: PropertyItem[];
  deviceType: number;
}

interface PropertyItem {
  name: string;
  value: string;
}

interface PaginatedResponse {
  items: Device[];
  total: number;
  searchId?: string;
}

const ITEMS_PER_PAGE = 10;

// Add DeviceType mapping
const DEVICE_TYPES: { [key: number]: string } = {
  0: 'Standard',
  2: 'AWS',
  4: 'Azure',
  6: 'Service Insights',
  7: 'GCP',
  8: 'Kubernetes',
  9: 'Push Metrics',
  10: 'SaaS',
  11: 'Synthetics',
  13: 'Log Pipeline',
  14: 'Aruba Central'
};

// Get the badge color based on device type
const getDeviceTypeBadgeColor = (type: number): string => {
  const colors: { [key: number]: string } = {
    0: 'bg-gray-100 text-gray-700',    // Standard
    2: 'bg-orange-100 text-orange-700', // AWS
    4: 'bg-blue-100 text-blue-700',    // Azure
    6: 'bg-purple-100 text-purple-700', // Service Insights
    7: 'bg-red-100 text-red-700',      // GCP
    8: 'bg-green-100 text-green-700',  // Kubernetes
    9: 'bg-yellow-100 text-yellow-700', // Push Metrics
    10: 'bg-pink-100 text-pink-700',   // SaaS
    11: 'bg-indigo-100 text-indigo-700', // Synthetics
    13: 'bg-cyan-100 text-cyan-700',    // Log Pipeline
    14: 'bg-teal-100 text-teal-700'    // Aruba Central
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

interface ColumnConfig {
  id: string;
  label: string;
  originalName: string;
  width?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type SortDirection = 'asc' | 'desc' | null;
interface SortConfig {
  column: string;
  direction: SortDirection;
}

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
  } = useSortable({ 
    id: column.id,
  });

  return (
    <TableHead 
      ref={setNodeRef} 
      style={{ 
        transform: CSS.Transform.toString(transform),
        transition,
        width: column.width || 'auto',
        position: 'relative' as const,
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
          <div 
            className="flex items-center gap-2 flex-1"
          >
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

// Add this helper function to convert glob to regex
const globToRegex = (glob: string): RegExp => {
  const escapedGlob = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
    .replace(/\*/g, '.*')                  // * becomes .*
    .replace(/\?/g, '.');                  // ? becomes .
  return new RegExp(`^${escapedGlob}$`, 'i');
};

const PortalReports = () => {
  const [portalName, setPortalName] = useState('');
  const [bearerToken, setBearerToken] = useState('');

  useEffect(() => {
    // Load stored values after component mounts
    const storedPortal = localStorage.getItem('portalName');
    const storedToken = sessionStorage.getItem('bearerToken');
    
    if (storedPortal) setPortalName(storedPortal);
    if (storedToken) setBearerToken(storedToken);
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (portalName) {
      localStorage.setItem('portalName', portalName);
    }
  }, [portalName]);

  useEffect(() => {
    if (bearerToken) {
      // Use sessionStorage for bearer token (more secure than localStorage)
      sessionStorage.setItem('bearerToken', bearerToken);
    }
  }, [bearerToken]);

  useEffect(() => {
    return () => {
      // Optionally clear token on component unmount
      // sessionStorage.removeItem('bearerToken');
    };
  }, []);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState<'all' | 'system' | 'custom' | 'inherited'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pageSize, setPageSize] = useState(10);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'id', label: 'ID', originalName: 'id' },
    { id: 'type', label: 'Type', originalName: 'type' },
    { id: 'name', label: 'Name', originalName: 'name' },
    { id: 'displayName', label: 'Display Name', originalName: 'displayName' }
  ]);
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyView, setPropertyView] = useState<'grid' | 'list'>('grid');
  const [propertyPageSize, setPropertyPageSize] = useState(20);
  const [propertyPage, setPropertyPage] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [groupNameFilter, setGroupNameFilter] = useState('');
  const [defaultColumns, setDefaultColumns] = useState({
    id: true,
    type: true,
    name: true,
    displayName: true
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: null });
  const [isEditingMode, setIsEditingMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const fetchAllDevices = async () => {
    setLoading(true);
    setIsFetching(true);
    setError('');
    setDevices([]);
    
    try {
      let offset = 0;
      const size = 250;
      const deviceMap = new Map<number, Device>();

      const initialResponse = await fetch(`/santaba/rest/device/devices?offset=${offset}&size=${size}`, {
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
      const total = initialData.total;
      
      initialData.items.forEach(device => deviceMap.set(device.id, device));
      setProgress({ current: deviceMap.size, total });

      while (offset + size < total) {
        offset += size;
        const response = await fetch(`/santaba/rest/device/devices?offset=${offset}&size=${size}`, {
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
        data.items.forEach(device => deviceMap.set(device.id, device));
        setProgress({ current: deviceMap.size, total });
      }

      setDevices(Array.from(deviceMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsFetching(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Get unique property names and their counts
  const getAvailableProperties = () => {
    const propertyMap = new Map<string, number>();
    devices.forEach(device => {
      const propertyTypes = propertyType === 'all' 
        ? ['system', 'custom', 'inherited'] 
        : [propertyType];
        
      propertyTypes.forEach(type => {
        const props = device[`${type}Properties` as keyof Device];
        if (Array.isArray(props)) {  // Add type guard
          props.forEach((prop: PropertyItem) => {
            const currentCount = propertyMap.get(prop.name) || 0;
            propertyMap.set(prop.name, currentCount + 1);
          });
        }
      });
    });
    
    return Array.from(propertyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([prop]) => 
        prop.toLowerCase().includes(propertySearch.toLowerCase())
      );
  };

  // Get property value for a specific device and property name
  const getPropertyValue = (device: Device, propName: string) => {
    if (propertyType === 'all') {
      for (const type of ['system', 'custom', 'inherited']) {
        const props = device[`${type}Properties` as keyof Device] as PropertyItem[];
        const prop = props?.find(p => p.name === propName);
        if (prop) return prop.value;
      }
      return '';
    }
    
    const props = device[`${propertyType}Properties` as keyof Device] as PropertyItem[];
    const prop = props?.find(p => p.name === propName);
    return prop?.value || '';
  };

  // Update the getFilteredDevices function
  const getFilteredDevices = () => {
    if (!groupNameFilter) return devices;
    
    // Check if the filter contains glob characters
    const hasGlobChars = /[*?]/.test(groupNameFilter);
    
    return devices.filter(device => {
      const groupNames = device.systemProperties
        .find(prop => prop.name === 'system.groups')
        ?.value || '';
        
      if (hasGlobChars) {
        // Use glob pattern matching
        const regex = globToRegex(groupNameFilter);
        return groupNames.split(',')
          .map(name => name.trim())
          .some(name => regex.test(name));
      } else {
        // Use simple includes for non-glob filters
        return groupNames.toLowerCase().includes(groupNameFilter.toLowerCase());
      }
    });
  };

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

  // Update columns when properties are selected
  useEffect(() => {
    setColumns(currentColumns => {
      const propertyColumns = selectedProperties.map(prop => ({
        id: prop,
        label: currentColumns.find(col => col.id === prop)?.label || prop,
        originalName: prop
      }));
      
      const baseColumns = [
        { id: 'id', label: currentColumns.find(col => col.id === 'id')?.label || 'ID', originalName: 'id' },
        { id: 'type', label: currentColumns.find(col => col.id === 'type')?.label || 'Type', originalName: 'type' },
        { id: 'name', label: currentColumns.find(col => col.id === 'name')?.label || 'Name', originalName: 'name' },
        { id: 'displayName', label: currentColumns.find(col => col.id === 'displayName')?.label || 'Display Name', originalName: 'displayName' }
      ].filter(col => defaultColumns[col.id as keyof typeof defaultColumns]);

      return [
        ...baseColumns,
        ...propertyColumns
      ];
    });
  }, [selectedProperties, defaultColumns]);

  const handleColumnRename = (columnId: string, newLabel: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, label: newLabel } : col
    ));
  };

  const getPaginatedProperties = () => {
    const allProperties = getAvailableProperties();
    const start = (propertyPage - 1) * propertyPageSize;
    const end = start + propertyPageSize;
    return {
      properties: allProperties.slice(start, end),
      total: allProperties.length,
      totalPages: Math.ceil(allProperties.length / propertyPageSize)
    };
  };

  const getTextWidth = (text: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    
    context.font = '14px Inter, system-ui, sans-serif';
    const metrics = context.measureText(text);
    return Math.ceil(metrics.width);
  };

  const calculateOptimalWidth = (columnId: string): number => {
    const PADDING = 48; // Increased padding for better readability
    const MIN_WIDTH = 100;
    const MAX_WIDTH = 500;

    // Get header width
    const headerWidth = getTextWidth(columns.find(col => col.id === columnId)?.label || '') + PADDING;

    // Get all values for this column
    const contentWidths = devices.map(device => {
      let content = '';
      if (columnId === 'id') {
        content = device.id.toString();
      } else if (columnId === 'type') {
        content = DEVICE_TYPES[device.deviceType] || 'Unknown';
      } else if (columnId === 'name' || columnId === 'displayName') {
        content = device[columnId];
      } else {
        content = getPropertyValue(device, columnId);
      }
      return getTextWidth(content) + PADDING;
    });

    // Get the maximum content width
    const maxContentWidth = Math.max(0, ...contentWidths);
    
    // Return the largest width between header, content, and MIN_WIDTH, but not larger than MAX_WIDTH
    return Math.min(Math.max(headerWidth, maxContentWidth, MIN_WIDTH), MAX_WIDTH);
  };

  const redistributeColumnWidths = () => {
    if (!devices.length) return;
    
    const newColumns = columns.map(column => ({
      ...column,
      width: calculateOptimalWidth(column.id)
    }));
    setColumns(newColumns);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const exportToCSV = () => {
    // Get headers
    const headers = columns.map(col => col.label);
    
    // Get data rows
    const rows = filteredDevices.map(device => 
      columns.map(column => {
        if (column.id === 'id') return device.id;
        if (column.id === 'type') return DEVICE_TYPES[device.deviceType] || 'Unknown';
        if (column.id === 'name' || column.id === 'displayName') return device[column.id];
        return getPropertyValue(device, column.originalName);
      })
    );

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `device-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the current page's styles
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    // Write the HTML with styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Device Inventory Report</title>
          <style>${styles}</style>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', sans-serif;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);

    const root = ReactDOM.createRoot(printWindow.document.getElementById('root')!);
    root.render(
      <PDFTemplate
        devices={filteredDevices}
        columns={columns}
        getPropertyValue={getPropertyValue}
        date={new Date().toLocaleDateString()}
      />
    );

    // Wait for content and styles to load
    setTimeout(() => {
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 1000);
  };

  const handleDefaultColumnToggle = (columnId: keyof typeof defaultColumns) => {
    setDefaultColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleSort = (columnId: string) => {
    setSortConfig(current => {
      if (current.column === columnId) {
        // Cycle through: asc -> desc -> none
        const nextDirection = current.direction === 'asc' ? 'desc' : 
                            current.direction === 'desc' ? null : 'asc';
        return { column: columnId, direction: nextDirection };
      }
      // New column, start with ascending
      return { column: columnId, direction: 'asc' };
    });
  };

  const getSortedDevices = (devices: Device[]) => {
    if (!sortConfig.direction) return devices;

    return [...devices].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.column === 'id') {
        aValue = a.id;
        bValue = b.id;
      } else if (sortConfig.column === 'type') {
        aValue = DEVICE_TYPES[a.deviceType] || 'Unknown';
        bValue = DEVICE_TYPES[b.deviceType] || 'Unknown';
      } else if (sortConfig.column === 'name' || sortConfig.column === 'displayName') {
        aValue = a[sortConfig.column];
        bValue = b[sortConfig.column];
      } else {
        aValue = getPropertyValue(a, sortConfig.column);
        bValue = getPropertyValue(b, sortConfig.column);
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  };

  const filteredDevices = getSortedDevices(getFilteredDevices());
  const totalPages = Math.ceil(filteredDevices.length / pageSize);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#040F4B]">
      <Card className="w-full max-w-[1440px] bg-white shadow-lg m-6">
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
                <span className="font-medium">Device Property Report</span>
              </div>
              <p className="text-sm text-blue-600">
                Generate a custom report of device properties. Select the property type and specific properties you want to include in your report.
              </p>
            </div>

            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Portal Name</label>
                <div className="relative">
                  <Input
                    placeholder="Enter portal name..."
                    value={portalName}
                    onChange={(e) => setPortalName(e.target.value)}
                    className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bearer Token</label>
                <Input
                  type="password"
                  placeholder="Enter your bearer token..."
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
            </div>

            <Button 
              onClick={fetchAllDevices}
              disabled={loading || !(portalName && bearerToken)}
              className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span>Loading...</span>
                  {isFetching && progress.total > 0 && (
                    <span className="text-sm">
                      ({progress.current} / {progress.total} devices)
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Load Devices
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {devices.length > 0 && (
              <div className="space-y-4">
                {/* Property Selection Section */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="w-full p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-700" />
                        <span className="font-medium text-gray-900">Property Selection</span>
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
                      <Select
                        value={propertyType}
                        onValueChange={(value: 'all' | 'system' | 'custom' | 'inherited') => {
                          setPropertyType(value);
                        }}
                      >
                        <SelectTrigger className="w-[200px] bg-white border-gray-200">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All Properties</SelectItem>
                          <SelectItem value="system">System Properties</SelectItem>
                          <SelectItem value="custom">Custom Properties</SelectItem>
                          <SelectItem value="inherited">Inherited Properties</SelectItem>
                        </SelectContent>
                      </Select>
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

                      {/* Property List - update the mapping to use paginated results */}
                      {propertyView === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {getPaginatedProperties().properties.map(([prop, count]) => (
                            <div 
                              key={prop} 
                              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer
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
                              <Checkbox
                                id={prop}
                                checked={selectedProperties.includes(prop)}
                                className="pointer-events-none"
                              />
                              <div className="flex-1 flex justify-between items-center min-w-0">
                                <label className="text-sm text-gray-700 truncate">
                                  {prop}
                                </label>
                                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full shrink-0">
                                  {count}
                                </span>
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
                                  id={prop}
                                  checked={selectedProperties.includes(prop)}
                                  className="pointer-events-none"
                                />
                                <span className="text-sm text-gray-700">{prop}</span>
                              </div>
                              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pagination Controls */}
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

                      {getAvailableProperties().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No properties found matching your search
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* After Property Selection and before Results Table */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-700" />
                      <span className="font-medium text-gray-900">Display Options</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Default Columns</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-id"
                            checked={defaultColumns.id}
                            onCheckedChange={() => handleDefaultColumnToggle('id')}
                          />
                          <label htmlFor="show-id" className="text-sm text-gray-600">
                            ID
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-type"
                            checked={defaultColumns.type}
                            onCheckedChange={() => handleDefaultColumnToggle('type')}
                          />
                          <label htmlFor="show-type" className="text-sm text-gray-600">
                            Type
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-name"
                            checked={defaultColumns.name}
                            onCheckedChange={() => handleDefaultColumnToggle('name')}
                          />
                          <label htmlFor="show-name" className="text-sm text-gray-600">
                            Name
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-displayName"
                            checked={defaultColumns.displayName}
                            onCheckedChange={() => handleDefaultColumnToggle('displayName')}
                          />
                          <label htmlFor="show-displayName" className="text-sm text-gray-600">
                            Display Name
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className={`bg-white rounded-lg border border-gray-200 ${
                  isFullScreen ? 'fixed inset-0 z-50 flex flex-col' : ''
                }`}>
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TableIcon className="w-5 h-5 text-blue-700" />
                          <span className="font-medium text-gray-900">Device Inventory</span>
                        </div>
                        <div className="relative w-[300px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Filter by group name..."
                            value={groupNameFilter}
                            onChange={(e) => setGroupNameFilter(e.target.value)}
                            className="pl-9 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingMode(!isEditingMode)}
                          className={`bg-white border-gray-200 gap-1.5 ${
                            isEditingMode 
                              ? 'text-blue-700 border-blue-200 hover:bg-blue-50' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          {isEditingMode ? 'Done Editing' : 'Edit Labels'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={redistributeColumnWidths}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1.5"
                        >
                          <TableIcon className="w-4 h-4" />
                          Auto-fit Columns
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
                          onClick={toggleFullScreen}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-1.5"
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
                          {filteredDevices.length} {filteredDevices.length === 1 ? 'device' : 'devices'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex-1 overflow-auto ${isFullScreen ? 'h-[calc(100vh-120px)]' : ''}`}>
                    <div className="overflow-x-auto">
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
                                    onSort={handleSort}
                                    isEditingMode={isEditingMode}
                                  />
                                ))}
                              </SortableContext>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedDevices.length > 0 ? (
                              paginatedDevices.map((device) => (
                                <TableRow key={device.id}>
                                  {columns.map((column) => {
                                    let content;
                                    if (column.id === 'id') {
                                      content = <span className="font-medium">{device.id}</span>;
                                    } else if (column.id === 'type') {
                                      content = (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeviceTypeBadgeColor(device.deviceType)}`}>
                                          {DEVICE_TYPES[device.deviceType] || 'Unknown'}
                                        </span>
                                      );
                                    } else if (column.id === 'name' || column.id === 'displayName') {
                                      content = device[column.id];
                                    } else {
                                      content = getPropertyValue(device, column.originalName);
                                    }

                                    return (
                                      <TableCell 
                                        key={column.id} 
                                        style={{ 
                                          width: column.width,
                                          maxWidth: column.width,
                                          minWidth: column.width 
                                        }}
                                      >
                                        {content}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell 
                                  colSpan={columns.length} 
                                  className="h-24 text-center text-gray-500"
                                >
                                  {devices.length > 0 ? (
                                    <div className="flex flex-col items-center gap-2">
                                      <Search className="w-5 h-5 text-gray-400" />
                                      <span>No devices match the current filter</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-2">
                                      <TableIcon className="w-5 h-5 text-gray-400" />
                                      <span>Load devices to view the report</span>
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

                  {/* Pagination section */}
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
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
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
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, devices.length)} of {devices.length} devices
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalReports;