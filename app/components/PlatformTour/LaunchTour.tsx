import React, { useState } from 'react';
import { Play, Info, Minimize2, Maximize2, X } from 'lucide-react';
import { PlatformTour } from './PlatformTour';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { PlatformArchitecture } from './PlatformArchitecture';
export const LaunchTour = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-sm text-blue-700 dark:text-blue-400"
                    aria-label="Launch Platform Tour"
                >
                    <Play className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <span className="hidden 2xl:inline">LM Envision Platform Tour</span>
                </Button>
            </DialogTrigger>
            <DialogContent className={cn(
                isFullScreen ? "max-w-[95vw] h-[90vh]" : "max-w-[90vw] sm:max-w-lg lg:max-w-4xl",
                "bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0",
                "transition-all duration-300",
                "[&>button]:hidden"
            )}>
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-gray-700"
                                title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                            >
                                {isFullScreen ? (
                                    <Minimize2 className="w-5 h-5" />
                                ) : (
                                    <Maximize2 className="w-5 h-5" />
                                )}
                            </button>
                            <DialogPrimitive.Close className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-gray-700">
                                <X className="w-5 h-5" />
                            </DialogPrimitive.Close>
                        </div>
                    </div>
                </DialogHeader>

                <div className={cn(
                    "py-4",
                    isFullScreen && "overflow-y-auto"
                )}>
                    {/* <PlatformTour isFullScreen={isFullScreen} /> */}
                    <PlatformArchitecture />
                </div>
            </DialogContent>
        </Dialog>
    );
}; 