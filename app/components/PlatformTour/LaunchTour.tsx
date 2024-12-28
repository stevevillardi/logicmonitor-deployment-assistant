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

export const LaunchTour = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm text-blue-700"
                    aria-label="Launch Platform Tour"
                >
                    <Play className="w-4 h-4 text-blue-700" />
                    <span className="hidden 2xl:inline">Platform Tour</span>
                </Button>
            </DialogTrigger>
            <DialogContent className={cn(
                isFullScreen ? "max-w-[95vw] h-[90vh]" : "max-w-[90vw] sm:max-w-lg lg:max-w-4xl",
                "bg-blue-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0",
                "transition-all duration-300",
                "[&>button]:hidden"
            )}>
                <DialogHeader className="border-b border-blue-100 pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B]">
                                <div className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />

                                    
                                    LogicMonitor Platform Tour
                                </div>
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600">
                                Explore the key components and features of the LogicMonitor platform
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="p-2 rounded-lg hover:bg-blue-100/50 text-blue-700 border border-blue-200"
                                title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                            >
                                {isFullScreen ? (
                                    <Minimize2 className="w-5 h-5" />
                                ) : (
                                    <Maximize2 className="w-5 h-5" />
                                )}
                            </button>
                            <DialogPrimitive.Close className="p-2 rounded-lg hover:bg-blue-100/50 text-blue-700 border border-blue-200">
                                <X className="w-5 h-5" />
                            </DialogPrimitive.Close>
                        </div>
                    </div>
                </DialogHeader>

                <div className={cn(
                    "py-4",
                    isFullScreen && "overflow-y-auto"
                )}>
                    <PlatformTour isFullScreen={isFullScreen} />
                </div>

                <div className="border-t border-blue-100 pt-3 mt-4">
                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                        <div className="flex gap-2 text-xs sm:text-sm text-blue-700">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>Click on different areas of the diagram to learn more about each component.</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 