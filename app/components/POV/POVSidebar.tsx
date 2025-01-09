'use client'

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, AlertCircle, CheckSquare, Calendar, Users, Monitor } from 'lucide-react';

export default function POVSidebar() {
  const params = useParams();
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
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 