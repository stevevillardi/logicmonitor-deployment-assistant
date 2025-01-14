import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { createElement } from 'react';

interface StatusOption {
    value: string;
    icon?: LucideIcon;
    label?: string;
}

interface StatusDropdownProps {
    currentStatus: string;
    statuses: (string | StatusOption)[];
    onStatusChange: (status: string) => void;
    getStatusColor: (status: string) => string;
    align?: "start" | "end" | "center";
    buttonSize?: "default" | "sm" | "lg" | "icon";
    formatStatus?: (status: string) => string;
    showIcon?: boolean;
    getCurrentIcon?: (status: string) => LucideIcon | null;
    className?: string;
    getMenuItemColor?: (status: string) => string;
}

export function StatusDropdown({
    currentStatus,
    statuses,
    onStatusChange,
    getStatusColor,
    align = "end",
    buttonSize = "sm",
    formatStatus = (status) => status.replace(/_/g, ' '),
    showIcon = false,
    getCurrentIcon,
    className,
    getMenuItemColor = getStatusColor
}: StatusDropdownProps) {
    const getStatusOption = (status: string | StatusOption): StatusOption => {
        if (typeof status === 'string') {
            return {
                value: status,
                label: formatStatus(status)
            };
        }
        return {
            ...status,
            label: status.label || formatStatus(status.value)
        };
    };

    const currentIcon = getCurrentIcon?.(currentStatus);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size={buttonSize}
                    className={cn(
                        "text-xs font-bold dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-700 hover:bg-gray-100",
                        getStatusColor(currentStatus),
                        className
                    )}
                >
                    {showIcon && currentIcon && createElement(currentIcon, {
                        className: "mr-2 h-4 w-4"
                    })}
                    {formatStatus(currentStatus)}
                    <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align={align}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
                {statuses.map((status) => {
                    const option = getStatusOption(status);
                    const Icon = option.icon || (getCurrentIcon?.(option.value));
                    
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onStatusChange(option.value)}
                            className={cn(
                                "gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                                getMenuItemColor(option.value)
                            )}
                        >
                            {(showIcon && Icon) && (
                                <Icon className="h-4 w-4" />
                            )}
                            {option.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 