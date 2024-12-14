'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        // Debug logs
        console.log('PWA Debug:', {
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
            hasUserDismissed: localStorage.getItem('pwaPromptDismissed'),
        });

        // Check if user has previously dismissed the prompt
        const hasUserDismissed = localStorage.getItem('pwaPromptDismissed');
        if (hasUserDismissed) {
            console.log('PWA prompt previously dismissed');
            return;
        }

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (!isStandalone && isMobile) {
            console.log('Device eligible for PWA install prompt');
            
            const handler = (e: any) => {
                e.preventDefault();
                console.log('beforeinstallprompt event fired');
                setDeferredPrompt(e);
                setShowInstallPrompt(true);
            };

            window.addEventListener('beforeinstallprompt', handler);
            console.log('Install prompt event listener added');

            return () => {
                console.log('Removing install prompt event listener');
                window.removeEventListener('beforeinstallprompt', handler);
            };
        } else {
            console.log('Device not eligible:', { isStandalone, isMobile });
        }
    }, []);

    const handleDismiss = () => {
        console.log('PWA prompt dismissed by user');
        localStorage.setItem('pwaPromptDismissed', 'true');
        setShowInstallPrompt(false);
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.log('No deferred prompt available');
            return;
        }

        console.log('Triggering PWA install prompt');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        localStorage.setItem('pwaPromptDismissed', 'true');
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