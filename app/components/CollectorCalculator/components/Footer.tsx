import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-200 mt-8">
            <div className="max-w-[1440px] mx-auto px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-600">
                            © {new Date().getFullYear()} LogicMonitor | Steve Villardi
                        </span>
                        <div className="h-4 w-px bg-gray-200" />
                        <a 
                            href="https://www.logicmonitor.com/legal" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            Legal <ExternalLink className="w-3 h-3" />
                        </a>
                        <a 
                            href="https://www.logicmonitor.com/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            Privacy <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <a 
                            href="https://github.com/stevevillardi/logicmonitor-calculator" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                            <Github className="w-4 h-4" />
                            View on GitHub
                        </a>
                        <div className="h-4 w-px bg-gray-200" />
                        <a 
                            href="https://www.logicmonitor.com/support" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            Product Support <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}; 

export default Footer;