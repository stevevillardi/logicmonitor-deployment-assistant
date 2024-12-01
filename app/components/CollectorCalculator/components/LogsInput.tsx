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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(logs).map(([type, eps]) => (
                <div
                    key={type}
                    className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                            {getIcon(type)}
                        </div>
                        <Label className="font-medium text-base sm:text-lg text-gray-900">
                            {getLabel(type)}
                        </Label>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm text-gray-600 block">
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
                            className="w-full bg-white border-gray-200 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 text-gray-900 placeholder:text-gray-400"
                            placeholder="Enter EPS..."
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};