import React, { useState } from 'react';
import { Github, ExternalLink, MessageCircleQuestion, HelpCircle } from 'lucide-react';
import { LaunchTour } from '../PlatformTour/LaunchTour'
import { FirstTimeVisit } from '../SiteConfiguration/FirstTimeVisit';
import { ThemeToggle } from './ThemeToggle';

export const Footer = () => {
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    return (
        <>
            <FirstTimeVisit
                isOpen={helpDialogOpen}
                onOpenChange={setHelpDialogOpen}
            />
            <footer className="hidden sm:block w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                © {new Date().getFullYear()} LogicMonitor | Steve Villardi
                            </span>
                            <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />
                            <a 
                                href="https://www.logicmonitor.com/legal" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1"
                            >
                                Legal <ExternalLink className="w-3 h-3" />
                            </a>
                            <a 
                                href="https://www.logicmonitor.com/privacy" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1"
                            >
                                Privacy <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <a 
                                href="https://github.com/stevevillardi/logicmonitor-deployment-assistant" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <Github className="w-4 h-4" />
                                View on GitHub
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />
                            <a 
                                href="https://www.logicmonitor.com/support" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                Product Support <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />
                            <a
                                href="https://community.logicmonitor.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <MessageCircleQuestion className="w-4 h-4" />
                                Community
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />
                            <button
                                onClick={() => setHelpDialogOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <HelpCircle className="w-4 h-4" />
                                Help Guide
                            </button>
                            <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}; 

export default Footer;