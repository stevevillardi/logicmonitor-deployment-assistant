import React, { useState } from 'react';
import { Github, ExternalLink, MessageCircleQuestion, HelpCircle, Scale, GlobeLock } from 'lucide-react';
import { FirstTimeVisit } from '../SiteConfiguration/FirstTimeVisit';
import { ThemeToggle } from './ThemeToggle';
import { PrivacyPolicy } from '../Legal/PrivacyPolicy';
import { LegalDisclaimer } from '../Legal/LegalDisclaimer';

export const Footer = () => {
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [legalOpen, setLegalOpen] = useState(false);

    return (
        <>
            <FirstTimeVisit
                isOpen={helpDialogOpen}
                onOpenChange={setHelpDialogOpen}
            />
            <footer className="hidden sm:block w-full bg-white border-t border-gray-200">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <span className="text-xs sm:text-sm text-gray-600">
                                © {new Date().getFullYear()} Steve Villardi
                            </span>
                            <div className="hidden sm:block h-4 w-px bg-gray-200" />
                            <button 
                                onClick={() => setLegalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                               <Scale className="w-4 h-4" /> Legal
                            </button>
                            <button
                                onClick={() => setPrivacyOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                               <GlobeLock className="w-4 h-4" /> Privacy
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <a 
                                href="https://github.com/stevevillardi/logicmonitor-deployment-assistant" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                                <Github className="w-4 h-4" />
                                View on GitHub
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-gray-200" />
                            <a 
                                href="https://www.logicmonitor.com/support" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                                Product Support <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-gray-200" />
                            <a
                                href="https://community.logicmonitor.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                                <MessageCircleQuestion className="w-4 h-4" />
                                Community
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-gray-200" />
                            <button
                                onClick={() => setHelpDialogOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                                <HelpCircle className="w-4 h-4" />
                                Help Guide
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            <PrivacyPolicy 
                open={privacyOpen} 
                onOpenChange={setPrivacyOpen} 
            />
            <LegalDisclaimer 
                open={legalOpen} 
                onOpenChange={setLegalOpen} 
            />
        </>
    );
}; 

export default Footer;