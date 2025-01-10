'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from 'react';

export default function SidebarProfile() {
    const { user, userRole, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
    };

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const getSecureAvatarUrl = () => {
        if (!user) return null;
        
        const picture = user.user_metadata.picture;
        if (picture && picture.startsWith('https://lh3.googleusercontent.com')) {
            return picture;
        }

        const avatarUrl = user.user_metadata.avatar_url;
        if (avatarUrl && avatarUrl.includes('githubusercontent.com')) {
            return avatarUrl;
        }

        return null;
    };

    const getRoleDisplay = (role: string) => {
        switch(role) {
            case 'admin':
                return 'Administrator';
            case 'lm_user':
                return 'LM User';
            case 'viewer':
                return 'Viewer';
            default:
                return 'Unknown Role';
        }
    };

    if (!user) return null;

    return (
        <div className="mt-auto">
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="px-2 py-2"
            >
                <CollapsibleTrigger className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group">
                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                        {getSecureAvatarUrl() ? (
                            <AvatarImage 
                                src={getSecureAvatarUrl()!} 
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <AvatarFallback className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                {user.user_metadata.full_name?.charAt(0) || user.email?.charAt(0)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.user_metadata.full_name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getRoleDisplay(userRole)}
                        </p>
                    </div>
                    <ChevronUp className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1">
                    <Button
                        variant="ghost"
                        onClick={handleThemeToggle}
                        className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon className="mr-2 h-4 w-4" />
                                Dark Mode
                            </>
                        ) : (
                            <>
                                <Sun className="mr-2 h-4 w-4" />
                                Light Mode
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
} 