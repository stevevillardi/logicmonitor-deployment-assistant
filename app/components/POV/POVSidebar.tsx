'use client'

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, AlertCircle, CheckSquare, Calendar, Users, Monitor, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POVSidebarProps {
  isNewPOV?: boolean;
}

export default function POVSidebar({ isNewPOV }: POVSidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const povId = params.id;

  const navItems = [
    {
      title: 'Overview',
      href: `/pov/${povId}`,
      icon: LayoutDashboard
    },
    {
      title: 'Key Business Services',
      href: `/pov/${povId}/key-business-services`,
      icon: Building2
    },
    {
      title: 'Challenges',
      href: `/pov/${povId}/challenges`,
      icon: AlertCircle
    },
    {
      title: 'Decision Criteria',
      href: `/pov/${povId}/decision-criteria`,
      icon: CheckSquare
    },
    {
      title: 'Working Sessions',
      href: `/pov/${povId}/working-sessions`,
      icon: Calendar
    },
    {
      title: 'Team',
      href: `/pov/${povId}/team`,
      icon: Users
    },
    {
      title: 'Device Scope',
      href: `/pov/${povId}/device-scope`,
      icon: Monitor
    }
  ];

  return (
    <nav className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              {isNewPOV ? (
                <div className="group relative">
                  <span
                    className="flex items-center gap-3 px-3 py-2 text-gray-400 dark:text-gray-600 cursor-not-allowed rounded-lg"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1">{item.title}</span>
                    <Lock className="w-4 h-4" />
                  </span>
                  <div className="invisible group-hover:visible absolute left-full ml-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap">
                    Complete POV creation first
                  </div>
                </div>
              ) : (
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
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 