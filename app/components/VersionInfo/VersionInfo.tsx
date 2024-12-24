import React from 'react';
import { Info, GitBranch, History, Server, Network, Cloud, Box, Layout, Code, Play, ArrowRight, Bot } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Version information
const APP_VERSION = "1.0.2";
const RELEASE_DATE = "2024-12-24";

// Changelog sections with icons
const CHANGELOG_SECTIONS = [
    {
        title: "AI Documentation Assistant (beta)",
        icon: <Bot className="w-4 h-4 text-blue-600" />,
        items: [
            "Context-aware documentation search",
            "Source-linked responses",
            "Persistent conversation history",
            "Resizable chat interface",
            "Minimizable window accessible from any page"
        ]
    },
    {
        title: "Platform Tour",
        icon: <Play className="w-4 h-4 text-blue-600" />,
        items: [
            "Added interactive platform architecture diagram",
            "Detailed component descriptions and features",
            "Category-based component organization (Core, Integration, Collection, Automation)",
            "Direct links to product documentation",
            "Fullscreen mode for better visibility"
        ]
    },
    {
        title: "Collector Sizing Enhancements",
        icon: <Server className="w-4 h-4 text-blue-600" />,
        items: [
            "Added collector sizing method selection with auto and manual modes, with manual mode you can set the collector size used for load calculations based on a specified collector size",
            "Added special vCenter sizing logic based on VM count",
            "Automatic size adjustment for environments with >2000 VMs per vCenter (beta)",
            "Smart distribution calculations for multi-vCenter environments"
        ]
    },
    {
        title: "Protocol Support",
        icon: <Network className="w-4 h-4 text-blue-600" />,
        items: [
            "Added protocol selection for Windows (WMI/WinRM) and Linux (SSH/SNMP)",
            "Enhanced protocol-specific load calculations"
        ]
    },
    {
        title: "Monitoring Capacity",
        icon: <History className="w-4 h-4 text-blue-600" />,
        items: [
            "Added NetFlow ingestion (FPS) support for device level calculations",
            "Added Log ingestion (EPS) for device level calculations",
            "Implemented SNMP trap load calculations",
            "Added FPS as configurable collector capacity metric under collector settings"
        ]
    },
    {
        title: "Cloud Provider Integration",
        icon: <Cloud className="w-4 h-4 text-blue-600" />,
        items: [
            "Added recommended instance sizes for AWS, Azure, and GCP",
            "Instance recommendations based on collector sizing",
            "Added fixed performance instance recommendations"
        ]
    },
    {
        title: "Container Support",
        icon: <Box className="w-4 h-4 text-blue-600" />,
        items: [
            "Added container support information",
            "Included container-specific resource limitations",
            "Added container installation documentation"
        ]
    },
    {
        title: "UI Improvements",
        icon: <Layout className="w-4 h-4 text-blue-600" />,
        items: [
            "Redesigned deployment configuration interface",
            "Split collector types into separate categories for polling, log ingestion, and netflow",
            "Enhanced PDF report generation with improved formatting and layout",
            "Improved resource utilization displays for mobile devices"
        ]
    },
    {
        title: "Technical Improvements",
        icon: <Code className="w-4 h-4 text-blue-600" />,
        items: [
            "Enhanced collector calculation algorithms",
            "Improved load distribution logic",
            "Added null checks and error handling",
            "Optimized performance for large-scale deployments"
        ]
    }
];

export const VersionInfo = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:text-gray-900 hover:bg-blue-100 transition-colors duration-200 text-sm text-blue-700"
                >
                    <Info className="w-3 h-3 text-blue-700" />
                    <span className="hidden xl:inline">Release Notes</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0">
                <DialogHeader className="border-b border-blue-100 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B]">
                        <div className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Version {APP_VERSION} Release Notes
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Released on {RELEASE_DATE}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[600px] pr-4 overflow-y-auto">
                    <div className="space-y-4 py-3 pr-4">
                        {CHANGELOG_SECTIONS.map((section, index) => (
                            <div key={index} className="bg-white rounded-lg border border-blue-200 shadow-sm p-3">
                                <div className="flex items-start gap-2 mb-2">
                                    {section.icon}
                                    <h3 className="font-medium text-gray-900">
                                        {section.title}
                                    </h3>
                                </div>
                                <ul className="space-y-1.5 text-sm text-gray-600 ml-6">
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="list-disc">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="border-t border-blue-100 pt-3 mt-4">
                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                        <div className="flex gap-2 text-xs sm:text-sm text-blue-700">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                For feature requests and bug reports, please visit the github repository and create an issue.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 