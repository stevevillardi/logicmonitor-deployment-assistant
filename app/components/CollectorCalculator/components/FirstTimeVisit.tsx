import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Info, ArrowRight, CheckCircle2 } from 'lucide-react';
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
            description: "Create one or more sites to represent your monitoring locations.",
            icon: <ArrowRight className="w-5 h-5 text-blue-600" />,
        },
        {
            title: "Configure Devices",
            description: "Specify the number and types of devices to be monitored at each site.",
            icon: <ArrowRight className="w-5 h-5 text-blue-600" />,
        },
        {
            title: "Review Results",
            description: "View recommended collector sizes and distribution based on your configuration.",
            icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-blue-50">
                <DialogHeader className="border-b border-blue-100 pb-4">
                    <DialogTitle className="text-2xl font-bold text-[#040F4B]">
                        Welcome to the LogicMonitor Collector Capacity Planner
                    </DialogTitle>
                </DialogHeader>
                
                {/* Quick Start Guide */}
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Start Guide</h3>
                        <div className="grid gap-4">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                                    {step.icon}
                                    <div>
                                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                                        <p className="text-sm text-gray-600">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disclaimer Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Important Disclaimer</h3>
                        </div>
                        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-gray-600">
                                The recommendations provided by this capacity planner are estimates based on typical usage patterns. 
                                Actual collector requirements may vary depending on:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                                <li>Specific monitoring configurations</li>
                                <li>Network conditions and latency</li>
                                <li>Device response times and instance counts</li>
                                <li>Collection frequencies and methods</li>
                                <li>Custom monitoring requirements</li>
                            </ul>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex gap-2">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-blue-700">
                                For the most accurate sizing recommendations, please consult with LogicMonitor Support or your account representative.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-blue-100 pt-4">
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