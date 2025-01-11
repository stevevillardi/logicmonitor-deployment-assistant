'use client'

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    LayoutDashboard, 
    CheckSquare, 
    AlertCircle, 
    Calendar,
    Users,
    BarChart2,
    Clock,
    FlagTriangleRight,
    FileText,
    MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarProfile from '../../POV/SidebarProfile';

export default function ActivePOVSidebar() {
    const params = useParams();
    const pathname = usePathname();
    const povId = params.id;

    const navItems = [
        {
            title: 'Dashboard',
            href: `/active-pov/${povId}`,
            icon: LayoutDashboard
        },
        {
            title: 'Working Sessions',
            href: `/active-pov/${povId}/sessions`,
            icon: Calendar
        },
        {
            title: 'Team',
            href: `/active-pov/${povId}/team`,
            icon: Users
        },
        {
            title: 'Activities',
            href: `/active-pov/${povId}/activities`,
            icon: Clock
        },
        {
            title: 'Timeline',
            href: `/active-pov/${povId}/timeline`,
            icon: FlagTriangleRight
        },
        {
            title: 'Documents',
            href: `/active-pov/${povId}/documents`,
            icon: FileText
        },
        {
            title: 'Comments',
            href: `/active-pov/${povId}/comments`,
            icon: MessageCircle
        }
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col flex-1 px-2 py-4">
                <div className="p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                        pathname === item.href
                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-100 font-medium"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5",
                                        pathname === item.href && "text-blue-700 dark:text-blue-100"
                                    )} />
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <SidebarProfile />
            </nav>
        </div>
    );
} 