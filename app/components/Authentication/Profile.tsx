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
import { LogOut, User, Folder } from 'lucide-react'
import ManageDeploymentsDialog from './ManageDeploymentsDialog'
import { useState } from 'react'

export const Profile = () => {
    const { user } = useAuth()
    const router = useRouter()
    const supabase = supabaseBrowser;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleManageDeployments = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDialogOpen(true);
        setDropdownOpen(false); // Close dropdown when opening dialog
    };

    if (!user) return null

    const avatarUrl = user.user_metadata.avatar_url || 
                     user.user_metadata.picture || 
                     null

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger className="outline-none">
                    <Avatar className="border-2 border-blue-200 bg-blue-50">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-blue-50 text-blue-700">
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-blue-50 border border-blue-200 shadow-lg"
                >
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-blue-900">
                                {user.user_metadata.full_name}
                            </p>
                            <p className="text-xs leading-none text-blue-700">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-blue-200" />
                    <DropdownMenuItem 
                        onSelect={(e) => {
                            e.preventDefault();
                            handleManageDeployments(e as unknown as React.MouseEvent);
                        }}
                        className="text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    >
                        <Folder className="mr-2 h-4 w-4" />
                        <span>Manage Deployments</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={handleSignOut} 
                        className="text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
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
        </>
    )
} 