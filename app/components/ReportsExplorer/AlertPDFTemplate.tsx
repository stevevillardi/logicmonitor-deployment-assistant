import React from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface Alert {
  id: string;
  severity: number;
  startEpoch: number;
  monitorObjectName: string;
  resourceTemplateName: string;
  instanceName: string;
  dataPointName: string;
  alertValue: string;
  [key: string]: any;
}

interface ColumnConfig {
  id: string;
  label: string;
  originalName: string;
}

interface TimelineData {
  timestamp: number;
  count: number;
}

interface PDFTemplateProps {
  alerts: Alert[];
  columns: ColumnConfig[];
  title: string;
  date: string;
  timelineData: TimelineData[];
}

const preprocessTimelineData = (data: TimelineData[]) => {
  if (data.length === 0) return [];
  
  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
  
  // Get time range
  const startTime = sortedData[0].timestamp;
  const endTime = sortedData[sortedData.length - 1].timestamp;
  const timeRange = endTime - startTime;
  
  // Create evenly distributed points
  const numPoints = 20; // Adjust this number for more/fewer points
  const points: TimelineData[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const timestamp = startTime + (timeRange * i / (numPoints - 1));
    
    // Find the closest actual data point
    const closestPoint = sortedData.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp) ? curr : prev;
    });
    
    points.push({
      timestamp,
      count: closestPoint.count
    });
  }
  
  return points;
};

const PDFTemplate: React.FC<PDFTemplateProps> = ({ 
  alerts,
  title = 'Alert Report',
  date,
  columns,
  timelineData
}) => {
  const processedData = preprocessTimelineData(timelineData);

  const getSeverityBadgeColor = (severity: number): string => {
    const colors: { [key: number]: string } = {
        4: 'bg-red-100 text-red-700',    // Critical
        2: 'bg-yellow-100 text-yellow-700', // Warning
        3: 'bg-orange-100 text-orange-700',    // Error
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

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

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-6 border-b">
        <Image
          src="/lmlogo.webp"
          alt="LogicMonitor"
          width={200}
          height={37}
          className="object-contain"
        />
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Generated on {date}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="p-8 pb-0">
        <h2 className="text-lg font-semibold mb-2">Report Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Alerts:</span>
            <span className="ml-2 font-medium">{alerts.length}</span>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="p-8 pb-0">
        <h2 className="text-lg font-semibold mb-4">Alert Timeline</h2>
        <div style={{ 
          width: '100%', 
          height: '250px', 
          position: 'relative',
          backgroundColor: 'white'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={processedData} 
              margin={{ top: 10, right: 40, left: 60, bottom: 40 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatTimeLabel(value)}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                stroke="#E5E7EB"
                type="number"
                domain={['dataMin', 'dataMax']}
                ticks={processedData.map(d => d.timestamp)}
                dy={10}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                stroke="#E5E7EB"
                label={{ 
                  value: 'Alert Count', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -45,
                  style: { 
                    fontSize: 11,
                    fill: '#6B7280'
                  }
                }}
                domain={[0, 'dataMax']}
              />
              <Area
                type="basis"
                dataKey="count"
                stroke="#1D4ED8"
                strokeWidth={2}
                fill="#1D4ED8"
                fillOpacity={0.08}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert Table */}
      <div className="p-8">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className="bg-gray-50 text-xs font-medium text-gray-500 uppercase"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                {columns.map((column) => {
                  let content;
                  if (column.id === 'severity') {
                    const { text, color } = getSeverityDisplay(alert);
                    content = (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {text}
                      </span>
                    );
                  } else if (column.id === 'startEpoch' || column.id === 'endEpoch' || column.id === "achedEpoch") {
                    content = new Date(alert[column.id] * 1000).toLocaleString();
                  } else {
                    content = alert[column.originalName];
                  }

                  return (
                    <TableCell key={column.id} className="text-sm">
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="p-8 pt-4 border-t text-sm text-gray-500 text-center">
        <p>Confidential - For Internal Use Only</p>
      </div>
    </div>
  );
};

export default PDFTemplate; 