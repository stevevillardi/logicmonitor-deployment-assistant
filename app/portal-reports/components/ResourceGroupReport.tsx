'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Search, FileText, TableIcon, ChevronDown, ChevronLeft, ChevronRight, List, X, Maximize2, Minimize2, Settings } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactDOM from 'react-dom/client';
import PDFTemplate from './ResourceGroupPDFTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResourceGroupReportProps {
  portalName: string;
  bearerToken: string;
}

interface ResourceGroup {
  id: number;
  name: string;
  numOfHosts: number;
  appliesTo: string;
  description: string;
  customProperties: PropertyItem[];
}

interface PropertyItem {
  name: string;
  value: string;
}

interface PaginatedResponse {
  items: ResourceGroup[];
  total: number;
  searchId?: string;
}

interface ColumnConfig {
  id: string;
  label: string;
  originalName: string;
  width?: number;
}

type SortDirection = 'asc' | 'desc' | null;
interface SortConfig {
  column: string;
  direction: SortDirection;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Helper function to convert glob to regex
const globToRegex = (glob: string): RegExp => {
  const escapedGlob = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escapedGlob}$`, 'i');
};

// SortableHeader component
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
        width: column.width,
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

const getGroupTypeBadgeColor = (type: 'Standard' | 'Dynamic'): string => {
  const colors: { [key: string]: string } = {
    Standard: 'bg-gray-100 text-gray-700',
    Dynamic: 'bg-blue-100 text-blue-700'
  };
  return colors[type];
};

const ResourceGroupReport = ({ portalName, bearerToken }: ResourceGroupReportProps) => {
  // State declarations
  const [groups, setGroups] = useState<ResourceGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pageSize, setPageSize] = useState(10);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'id', label: 'ID', originalName: 'id' },
    { id: 'type', label: 'Type', originalName: 'type' },
    { id: 'name', label: 'Name', originalName: 'name' },
    { id: 'numOfHosts', label: 'Hosts', originalName: 'numOfHosts' }
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
    numOfHosts: true,
    appliesTo: false,
    description: false
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: null });
  const [isEditingMode, setIsEditingMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Fetch function
  const fetchAllGroups = async () => {
    setLoading(true);
    setIsFetching(true);
    setError('');
    setGroups([]);
    
    try {
      let offset = 0;
      const size = 250;
      const groupMap = new Map<number, ResourceGroup>();

      const initialResponse = await fetch(`/santaba/rest/device/groups?offset=${offset}&size=${size}`, {
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
      
      initialData.items.forEach(group => groupMap.set(group.id, group));
      setProgress({ current: groupMap.size, total });

      while (offset + size < total) {
        offset += size;
        const response = await fetch(`/santaba/rest/device/groups?offset=${offset}&size=${size}`, {
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
        data.items.forEach(group => groupMap.set(group.id, group));
        setProgress({ current: groupMap.size, total });
      }

      setGroups(Array.from(groupMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsFetching(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // After fetchAllGroups...

  // Get property value for a specific group and property name
  const getPropertyValue = (group: ResourceGroup, propName: string) => {
    if (propName === 'appliesTo') return group.appliesTo;
    if (propName === 'description') return group.description;
    
    const prop = group.customProperties?.find(p => p.name === propName);
    return prop?.value || '';
  };

  // Filter function
  const getFilteredGroups = () => {
    if (!groupNameFilter) return groups;
    
    const hasGlobChars = /[*?]/.test(groupNameFilter);
    
    return groups.filter(group => {
      if (hasGlobChars) {
        const regex = globToRegex(groupNameFilter);
        return regex.test(group.name);
      } else {
        return group.name.toLowerCase().includes(groupNameFilter.toLowerCase());
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

  const handleColumnRename = (columnId: string, newLabel: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, label: newLabel } : col
    ));
  };

  const getPaginatedProperties = () => {
    const allProperties = groups.reduce((acc, group) => {
      if (group.customProperties) {
        group.customProperties.forEach(prop => {
          const currentCount = acc.get(prop.name) || 0;
          acc.set(prop.name, currentCount + 1);
        });
      }
      return acc;
    }, new Map<string, number>());

    const filteredProperties = Array.from(allProperties.entries())
      .filter(([prop]) => prop.toLowerCase().includes(propertySearch.toLowerCase()));

    const start = (propertyPage - 1) * propertyPageSize;
    const end = start + propertyPageSize;
    
    return {
      properties: filteredProperties.slice(start, end),
      total: filteredProperties.length,
      totalPages: Math.ceil(filteredProperties.length / propertyPageSize)
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
    const PADDING = 48;
    const MIN_WIDTH = 100;
    const MAX_WIDTH = 500;

    const headerWidth = getTextWidth(columns.find(col => col.id === columnId)?.label || '') + PADDING;

    const contentWidths = groups.map(group => {
      let content = '';
      if (columnId === 'id') {
        content = group.id.toString();
      } else if (columnId === 'name') {
        content = group.name;
      } else if (columnId === 'type') {
        content = group.appliesTo ? 'Dynamic' : 'Standard';
      } else if (columnId === 'numOfHosts') {
        content = group.numOfHosts.toString();
      } else if (columnId === 'appliesTo') {
        content = group.appliesTo;
      } else if (columnId === 'description') {
        content = group.description;
      } else {
        content = getPropertyValue(group, columnId);
      }
      return getTextWidth(content) + PADDING;
    });

    const maxContentWidth = Math.max(0, ...contentWidths);
    return Math.min(Math.max(headerWidth, maxContentWidth, MIN_WIDTH), MAX_WIDTH);
  };

  const redistributeColumnWidths = () => {
    if (!groups.length) return;
    
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
    const headers = columns.map(col => col.label);
    
    const rows = filteredGroups.map(group => 
      columns.map(column => {
        if (column.id === 'id') return group.id;
        if (column.id === 'type') return group.appliesTo ? 'Dynamic' : 'Standard';
        if (column.id === 'name') return group.name;
        if (column.id === 'numOfHosts') return group.numOfHosts;
        if (column.id === 'appliesTo') return group.appliesTo;
        if (column.id === 'description') return group.description;
        return getPropertyValue(group, column.originalName);
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resource-group-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resource Group Inventory Report</title>
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
        groups={filteredGroups}
        columns={columns}
        getPropertyValue={getPropertyValue}
        date={new Date().toLocaleDateString()}
      />
    );

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
        const nextDirection = current.direction === 'asc' ? 'desc' : 
                          current.direction === 'desc' ? null : 'asc';
        return { column: columnId, direction: nextDirection };
      }
      return { column: columnId, direction: 'asc' };
    });
  };

  const getSortedGroups = (groups: ResourceGroup[]) => {
    if (!sortConfig.direction) return groups;

    return [...groups].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.column === 'id') {
        aValue = a.id;
        bValue = b.id;
      } else if (sortConfig.column === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortConfig.column === 'numOfHosts') {
        aValue = a.numOfHosts;
        bValue = b.numOfHosts;
      } else if (sortConfig.column === 'appliesTo') {
        aValue = a.appliesTo;
        bValue = b.appliesTo;
      } else if (sortConfig.column === 'description') {
        aValue = a.description;
        bValue = b.description;
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

  // Effects
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
        { id: 'numOfHosts', label: currentColumns.find(col => col.id === 'numOfHosts')?.label || 'Hosts', originalName: 'numOfHosts' },
        { id: 'appliesTo', label: currentColumns.find(col => col.id === 'appliesTo')?.label || 'Applies To', originalName: 'appliesTo' },
        { id: 'description', label: currentColumns.find(col => col.id === 'description')?.label || 'Description', originalName: 'description' }
      ].filter(col => defaultColumns[col.id as keyof typeof defaultColumns]);

      return [
        ...baseColumns,
        ...propertyColumns
      ];
    });
  }, [selectedProperties, defaultColumns]);

  const filteredGroups = getSortedGroups(getFilteredGroups());
  const totalPages = Math.ceil(filteredGroups.length / pageSize);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <CardTitle>Resource Group Inventory</CardTitle>
          </div>
          <Button 
            onClick={fetchAllGroups}
            disabled={loading || !(portalName && bearerToken)}
            className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span>Loading...</span>
                {isFetching && progress.total > 0 && (
                  <span className="text-sm">
                    ({progress.current} / {progress.total} groups)
                  </span>
                )}
              </div>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Load Groups
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {!loading && groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-4">
              <TableIcon className="w-12 h-12" />
              <div className="text-center">
                <p className="font-medium">No Resource Groups Loaded</p>
                <p className="text-sm">Click the "Load Groups" button above to fetch resource group data</p>
              </div>
            </div>
          ) : (
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

                    {/* Property Grid/List View */}
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
                            <span className="text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded shrink-0 ml-2">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getPaginatedProperties().properties.map(([prop, count]) => (
                          <div
                            key={prop}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:border-blue-200 ${
                              selectedProperties.includes(prop)
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200'
                            }`}
                            onClick={() => {
                              setSelectedProperties(prev =>
                                prev.includes(prop)
                                  ? prev.filter(p => p !== prop)
                                  : [...prev, prop]
                              );
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Checkbox
                                checked={selectedProperties.includes(prop)}
                                className="pointer-events-none shrink-0"
                              />
                              <span className="text-sm text-gray-700 truncate max-w-[300px]">{prop}</span>
                            </div>
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full shrink-0">
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
                              {[15, 30, 90].map((size) => (
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

                    {getPaginatedProperties().properties.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No properties found matching your search
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Display Options */}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
                          id="show-numOfHosts"
                          checked={defaultColumns.numOfHosts}
                          onCheckedChange={() => handleDefaultColumnToggle('numOfHosts')}
                        />
                        <label htmlFor="show-numOfHosts" className="text-sm text-gray-600">
                          Host Count
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="show-appliesTo"
                          checked={defaultColumns.appliesTo}
                          onCheckedChange={() => handleDefaultColumnToggle('appliesTo')}
                        />
                        <label htmlFor="show-appliesTo" className="text-sm text-gray-600">
                          Applies To
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="show-description"
                          checked={defaultColumns.description}
                          onCheckedChange={() => handleDefaultColumnToggle('description')}
                        />
                        <label htmlFor="show-description" className="text-sm text-gray-600">
                          Description
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
                        <span className="font-medium text-gray-900">Resource Groups</span>
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
                        {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
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
                          {paginatedGroups.length > 0 ? (
                            paginatedGroups.map((group) => (
                              <TableRow key={group.id}>
                                {columns.map((column) => {
                                  let content;
                                  if (column.id === 'id') {
                                    content = <span className="font-medium">{group.id}</span>;
                                  } else if (column.id === 'type') {
                                    const type = group.appliesTo ? 'Dynamic' : 'Standard';
                                    content = (
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupTypeBadgeColor(type)}`}>
                                        {type}
                                      </span>
                                    );
                                  } else if (column.id === 'name') {
                                    content = group.name;
                                  } else if (column.id === 'numOfHosts') {
                                    content = group.numOfHosts;
                                  } else if (column.id === 'appliesTo') {
                                    content = group.appliesTo;
                                  } else if (column.id === 'description') {
                                    content = group.description;
                                  } else {
                                    content = getPropertyValue(group, column.originalName);
                                  }

                                  return (
                                    <TableCell 
                                      key={column.id} 
                                      style={{ 
                                        width: column.width,
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
                                {groups.length > 0 ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Search className="w-5 h-5 text-gray-400" />
                                    <span>No groups match the current filter</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <TableIcon className="w-5 h-5 text-gray-400" />
                                    <span>Load groups to view the report</span>
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
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, groups.length)} of {groups.length} groups
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

export default ResourceGroupReport;