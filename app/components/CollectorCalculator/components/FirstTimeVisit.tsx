import React from 'react';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FirstTimeVisitProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const FirstTimeVisit = ({ isOpen, onOpenChange }: FirstTimeVisitProps) => {
    const steps = [
        {
            title: "Add Sites",
            description: "Create sites to represent your monitoring locations",
            icon: <ArrowRight className="w-4 h-4 text-blue-600" />,
        },
        {
            title: "Configure Devices",
            description: "Specify devices to be monitored at each site",
            icon: <ArrowRight className="w-4 h-4 text-blue-600" />,
        },
        {
            title: "Review Results",
            description: "View recommended collector distribution",
            icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-blue-50 sm:max-w-2xl">
                <DialogHeader className="border-b border-blue-100 pb-3">
                    <DialogTitle className="text-xl font-bold text-[#040F4B]">
                        Welcome to the LogicMonitor Deployment Assistant
                    </DialogTitle>
                </DialogHeader>
                
                {/* Quick Start Guide */}
                <div className="space-y-4 py-3">
                    <div className="space-y-3">
                        <h3 className="text-base font-semibold text-gray-900">Quick Start Guide</h3>
                        <div className="grid gap-2">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-blue-100 shadow-sm">
                                    {step.icon}
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-900">{step.title}</h4>
                                        <p className="text-xs text-gray-600">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Important Note */}
                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                        <div className="flex gap-2 text-sm text-blue-700">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm mb-2">
                                    Recommendations are estimates based on typical usage patterns. 
                                    Actual requirements may vary based on:
                                </p>
                                <ul className="text-xs space-y-1 text-gray-600 list-disc list-inside pl-1">
                                    <li>Specific monitoring configurations</li>
                                    <li>Network conditions and device response times</li>
                                    <li>Collection frequencies and custom requirements</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-blue-100 pt-3">
                    <Button 
                        onClick={() => onOpenChange(false)}
                        className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                    >
                        Get Started
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};