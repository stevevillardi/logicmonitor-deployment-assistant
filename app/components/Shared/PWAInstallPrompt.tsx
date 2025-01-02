'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(() => {
        if (typeof window !== 'undefined') {
            const hasUserDismissed = localStorage.getItem('pwaPromptDismissed') === 'true';
            return !hasUserDismissed;
        }
        return false;
    });
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        if (!showInstallPrompt) return;

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) {
            setShowInstallPrompt(false);
            return;
        }

        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            setShowInstallPrompt(true);
            return;
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [showInstallPrompt]);

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
        localStorage.setItem('pwaPromptDismissed', 'true');
    };

    if (!showInstallPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
            <div className="flex items-center justify-between gap-4 max-w-screen-xl mx-auto">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Install Deployment Assistant
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {isIOS 
                            ? "Tap the share button below and select 'Add to Home Screen'"
                            : "Get quick access from your home screen"
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isIOS ? (
                        <div className="flex flex-col items-center gap-1">
                            <Share className="h-5 w-5 text-gray-600 dark:text-gray-400 animate-bounce" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Use browser share ↓</span>
                        </div>
                    ) : (
                        <Button
                            onClick={handleInstallClick}
                            className="bg-[#040F4B] hover:bg-[#0A1B6F] dark:bg-blue-600 dark:hover:bg-blue-700 text-white gap-2 text-sm"
                        >
                            <Download className="h-4 w-4" />
                            Install
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;