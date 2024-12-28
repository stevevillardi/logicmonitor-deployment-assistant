'use client';
import { supabaseBrowser } from '../../lib/supabase'
import { useAuth } from '../..//hooks/useAuth'
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
import { LogOut, User } from 'lucide-react'

export const Profile = () => {
    const { user } = useAuth()
    const router = useRouter()
    const supabase = supabaseBrowser;

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!user) return null
    // Get avatar URL based on provider
    const avatarUrl = user.user_metadata.avatar_url || // GitHub
                     user.user_metadata.picture || // Google
                     null

    return (
        <DropdownMenu>
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
                    onClick={handleSignOut} 
                    className="text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 