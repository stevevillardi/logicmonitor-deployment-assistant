import React from 'react';
import Image from 'next/image';

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

interface ColumnConfig {
  id: string;
  label: string;
  originalName: string;
  width?: number;
}

interface PDFTemplateProps {
  groups: ResourceGroup[];
  columns: ColumnConfig[];
  getPropertyValue: (group: ResourceGroup, propName: string) => string;
  title?: string;
  date: string;
}

const getGroupTypeBadgeColor = (type: 'Standard' | 'Dynamic'): string => {
  const colors: { [key: string]: string } = {
    Standard: 'bg-gray-100 text-gray-700',
    Dynamic: 'bg-blue-100 text-blue-700'
  };
  return colors[type];
};

const PDFTemplate: React.FC<PDFTemplateProps> = ({ 
  groups, 
  columns, 
  getPropertyValue,
  title = 'Resource Group Inventory Report',
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
            <span className="text-gray-600">Total Groups:</span>
            <span className="ml-2 font-medium">{groups.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Properties Selected:</span>
            <span className="ml-2 font-medium">{columns.length - 5}</span>
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
            {groups.map((group) => (
              <tr key={group.id}>
                {columns.map((column) => {
                  let content;
                  if (column.id === 'id') {
                    content = group.id;
                  } else if (column.id === 'name') {
                    content = group.name;
                  } else if (column.id === 'type') {
                    const type = group.appliesTo ? 'Dynamic' : 'Standard';
                    content = (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupTypeBadgeColor(type)} print-color-adjust`}>
                        {type}
                      </span>
                    );
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
        }
      `}</style>
    </div>
  );
};

export default PDFTemplate; 