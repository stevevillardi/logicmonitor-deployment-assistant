'use client';
import { supabaseBrowser } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Folder, Layout, Moon, Sun } from 'lucide-react'
import ManageDeploymentsDialog from './ManageDeploymentsDialog'
import ManageDashboardsDialog from './ManageDashboardsDialog'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { UserRole } from '@/app/types/auth'

export const Profile = () => {
    const { user, userRole } = useAuth()
    const router = useRouter()
    const supabase = supabaseBrowser;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dashboardsDialogOpen, setDashboardsDialogOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleManageDeployments = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDialogOpen(true);
        setDropdownOpen(false);
    };

    const handleManageDashboards = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDashboardsDialogOpen(true);
        setDropdownOpen(false);
    };

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const getSecureAvatarUrl = () => {
        if (!user) return null;
        
        // Check for picture from Google OAuth
        const picture = user.user_metadata.picture;
        if (picture && picture.startsWith('https://lh3.googleusercontent.com')) {
            return picture.replace(/^http:\/\//i, 'https://');
        }

        // Check for GitHub avatar
        const avatarUrl = user.user_metadata.avatar_url;
        if (avatarUrl && avatarUrl.includes('githubusercontent.com')) {
            return avatarUrl;
        }

        return null;
    };

    const avatarUrl = getSecureAvatarUrl();

    const getRoleDisplay = (role: UserRole) => {
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

    if (!user) return null

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger className="outline-none">
                    <Avatar className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 transition-all duration-200">
                        {avatarUrl ? (
                            <AvatarImage 
                                src={avatarUrl} 
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <AvatarFallback className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800">
                                <User className="h-5 w-5" />
                            </AvatarFallback>
                        )}
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 shadow-lg"
                >
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-blue-900 dark:text-gray-100">
                                {user.user_metadata.full_name}
                            </p>
                            <p className="text-xs leading-none text-blue-700 dark:text-blue-300">
                                {user.email}
                            </p>
                            <p className="text-xs leading-none text-blue-600 dark:text-blue-400 mt-1">
                                Role: {getRoleDisplay(userRole)}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-blue-200 dark:bg-gray-700" />
                    <DropdownMenuItem 
                        onSelect={(e) => {
                            e.preventDefault();
                            handleManageDeployments(e as unknown as React.MouseEvent);
                        }}
                        className="text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <Folder className="mr-2 h-4 w-4" />
                        <span>Manage Deployments</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onSelect={(e) => {
                            e.preventDefault();
                            handleManageDashboards(e as unknown as React.MouseEvent);
                        }}
                        className="text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <Layout className="mr-2 h-4 w-4" />
                        <span>Manage Dashboards</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={handleThemeToggle}
                        className="text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        {theme === 'light' ? (
                            <Moon className="mr-2 h-4 w-4" />
                        ) : (
                            <Sun className="mr-2 h-4 w-4" />
                        )}
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={handleSignOut} 
                        className="text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ManageDeploymentsDialog 
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
            <ManageDashboardsDialog 
                open={dashboardsDialogOpen}
                onOpenChange={setDashboardsDialogOpen}
            />
        </>
    )
} 