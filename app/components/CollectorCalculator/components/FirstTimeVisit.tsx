import React from 'react';
import { ArrowRight, Bot, CheckCircle2, Terminal, Info, Users, CirclePlay, ChevronRight } from 'lucide-react';
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
    const actions = [
        {
            title: "Calculate collector requirements",
            description: "Calculate the number of collectors required for your deployment",
            icon: <Bot className="w-4 h-4 text-blue-600" />,
            link: "/"
        },
        {
            title: "Explore the REST API",
            description: "Learn how to use the LogicMonitor REST API to automate device onboarding",
            icon: <Terminal className="w-4 h-4 text-blue-600" />,
            link: "/api-explorer"
        },
        {
            title: "Explore the different onboarding options",
            description: "Learn about the different ways to add devices to LogicMonitor",
            icon: <Bot className="w-4 h-4 text-blue-600" />,
            link: "/device-onboarding"
        },
        {
            title: "Explore collector types and configurations",
            description: "Learn about the different collector types and configurations",
            icon: <Users className="w-4 h-4 text-blue-600" />,
            link: "/collector-info"
        },
        {
            title: "Visit the video library",
            description: "Watch helpful videos to learn how to use LogicMonitor",
            icon: <CirclePlay className="w-4 h-4 text-blue-600" />,
            link: "/video-library"
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
                        <h3 className="text-base font-semibold text-gray-900">Deployment Assistant Features</h3>
                        <div className="grid gap-2">
                            {actions.map((step, index) => (
                                <a 
                                    key={index} 
                                    href={step.link}
                                    className="flex items-start gap-2 p-2 bg-white rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors duration-200 group cursor-pointer"
                                >
                                    <div className="flex-1 flex items-start gap-2">
                                        {step.icon}
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-900">{step.title}</h4>
                                            <p className="text-xs text-gray-600">{step.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-center" />
                                </a>
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