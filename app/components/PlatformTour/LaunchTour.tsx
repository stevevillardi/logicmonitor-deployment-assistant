import React, { useState } from 'react';
import { Play, Info } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { PlatformArchitecture } from './PlatformArchitecture';
import { cn } from '@/lib/utils';

interface LaunchTourProps {
    variant?: 'default' | 'landing';
}

export const LaunchTour = ({ variant = 'default' }: LaunchTourProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const buttonStyles = {
        default: "flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-sm text-blue-700 dark:text-blue-400",
        landing: "bg-white text-[#040F4B] hover:bg-blue-50 px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 antialiased"
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant={variant === 'default' ? 'outline' : 'ghost'}
                    className={buttonStyles[variant]}
                    aria-label="Launch Platform Tour"
                >
                    <Play className={cn(
                        "w-4 h-4",
                        variant === 'default' && "text-blue-700 dark:text-blue-400"
                    )} />
                    <span className={variant === 'default' ? "hidden 2xl:inline" : ""}>
                       LM Envision Platform Tour
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-4xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0 transition-all duration-300">
                <DialogHeader className="border-b border-blue-200 dark:border-gray-700 pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-blue-900 dark:text-gray-100">
                                <div className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                    LogicMonitor Envision Platform Tour
                                </div>
                            </DialogTitle>
                            <DialogDescription className="text-sm text-blue-700 dark:text-blue-400">
                                Explore the key components and features of the LogicMonitor platform
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <PlatformArchitecture />
                </div>
            </DialogContent>
        </Dialog>
    );
}; 