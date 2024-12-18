import React from 'react';
import Image from 'next/image';

interface Device {
  id: number;
  name: string;
  displayName: string;
  deviceType: number;
  systemProperties: PropertyItem[];
  customProperties: PropertyItem[];
  inheritedProperties: PropertyItem[];
}

interface PropertyItem {
  name: string;
  value: string;
}

interface ColumnConfig {
  id: string;
  label: string;
  originalName: string;
  width?: number;
}

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

interface PDFTemplateProps {
  devices: Device[];
  columns: ColumnConfig[];
  getPropertyValue: (device: Device, propName: string) => string;
  title?: string;
  date: string;
}

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

const PDFTemplate: React.FC<PDFTemplateProps> = ({ 
  devices, 
  columns, 
  getPropertyValue,
  title = 'Device Inventory Report',
  date 
}) => {
  return (
    <div className="p-8 bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b pb-6">
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
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Report Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Devices:</span>
            <span className="ml-2 font-medium">{devices.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Properties Selected:</span>
            <span className="ml-2 font-medium">{columns.length - 4}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.map((device) => (
              <tr key={device.id}>
                {columns.map((column) => {
                  let content;
                  if (column.id === 'id') {
                    content = device.id;
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
                    <td
                      key={column.id}
                      className={`px-4 py-2 text-sm text-gray-900 whitespace-normal ${
                        column.id === 'type' ? 'print-color-adjust: exact' : ''
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-sm text-gray-500 text-center">
        <p>Confidential - For Internal Use Only</p>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          .print-color-adjust {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFTemplate; 