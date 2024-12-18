import React from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface PDFTemplateProps {
  alerts: Alert[];
  title?: string;
  date: string;
  columns: ColumnConfig[];
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ 
  alerts,
  title = 'Alert Report',
  date,
  columns
}) => {
  const getSeverityBadgeColor = (severity: number): string => {
    const colors: { [key: number]: string } = {
      4: 'bg-red-100 text-red-700',
      3: 'bg-yellow-100 text-yellow-700',
      2: 'bg-blue-100 text-blue-700',
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