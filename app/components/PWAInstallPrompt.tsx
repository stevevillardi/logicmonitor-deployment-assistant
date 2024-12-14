'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        // Check if user has previously dismissed the prompt
        const hasUserDismissed = localStorage.getItem('pwaPromptDismissed');
        if (hasUserDismissed) return;

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (!isStandalone && isMobile) {
            const handler = (e: any) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setShowInstallPrompt(true);
            };

            window.addEventListener('beforeinstallprompt', handler);

            return () => window.removeEventListener('beforeinstallprompt', handler);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('pwaPromptDismissed', 'true');
        setShowInstallPrompt(false);
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        
        // If user installs or dismisses, remember their choice
        localStorage.setItem('pwaPromptDismissed', 'true');
        console.log(`User response to the install prompt: ${outcome}`);
    };

    if (!showInstallPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="flex items-center justify-between gap-4 max-w-screen-xl mx-auto">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                        Install Deployment Assistant
                    </p>
                    <p className="text-xs text-gray-600">
                        Get quick access from your home screen
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleInstallClick}
                        className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2 text-sm"
                    >
                        <Download className="h-4 w-4" />
                        Install
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;