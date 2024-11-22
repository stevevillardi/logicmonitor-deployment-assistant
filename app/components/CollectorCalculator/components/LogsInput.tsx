import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, AlertTriangle, MessageSquare } from 'lucide-react';

interface LogsInputProps {
    logs: {
        netflow: number;
        syslog: number;
        traps: number;
    };
    onUpdate: (logs: LogsInputProps['logs']) => void;
}

export const LogsInput = ({ logs, onUpdate }: LogsInputProps) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'netflow':
                return <Activity className="w-5 h-5 text-blue-700" />;
            case 'syslog':
                return <MessageSquare className="w-5 h-5 text-blue-700" />;
            case 'traps':
                return <AlertTriangle className="w-5 h-5 text-blue-700" />;
            default:
                return null;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'netflow':
                return 'NetFlow';
            case 'syslog':
                return 'Syslog';
            case 'traps':
                return 'SNMP Traps';
            default:
                return type;
        }
    };

    return (
        <div className="grid grid-cols-3 gap-6">
            {Object.entries(logs).map(([type, eps]) => (
                <div 
                    key={type} 
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="flex items-center gap-3 mb-4">
                        {getIcon(type)}
                        <Label className="font-medium text-lg text-gray-900">
                            {getLabel(type)}
                        </Label>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm text-gray-600">
                            Events Per Second (EPS)
                        </Label>
                        <Input
                            type="text"
                            value={eps}
                            onChange={(e) => {
                                const newLogs = {
                                    ...logs,
                                    [type]: parseInt(e.target.value) || 0,
                                };
                                onUpdate(newLogs);
                            }}
                            className="bg-white border-gray-200 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 text-gray-900 placeholder:text-gray-400"
                            placeholder="Enter EPS..."
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};