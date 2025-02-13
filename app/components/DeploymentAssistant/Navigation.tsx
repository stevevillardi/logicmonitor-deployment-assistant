'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, PlayCircle, Server, Settings, BookText, Terminal, Bolt, Bot, FileText, ChartLine, Rocket, Home, Info } from 'lucide-react';
import { usePermissions } from '@/app/hooks/usePermissions';

type NavItem = {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    children?: NavItem[];
};

const NavItem = ({ item, onNavigate, openMenu, setOpenMenu, isActive }: { 
    item: NavItem; 
    onNavigate: (path: string) => void;
    openMenu: string | null;
    setOpenMenu: (id: string | null) => void;
    isActive: boolean;
}) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenu === item.id;

    return (
        <div className="relative">
            <button
                onClick={() => {
                    if (hasChildren) {
                        setOpenMenu(isOpen ? null : item.id);
                    } else {
                        onNavigate(item.path);
                    }
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-[#0A1B6F] text-white' : 'text-white/85 hover:bg-[#0A1B6F] hover:text-white'
                }`}
            >
                {item.icon}
                <span>{item.label}</span>
                {hasChildren && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {hasChildren && isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-[#0A1B6F] rounded-lg shadow-lg overflow-hidden z-50 min-w-[250px]">
                    {item?.children?.map((child) => (
                        <button
                            key={child.id}
                            onClick={() => onNavigate(child.path)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/85 hover:bg-[#1a2b7f] hover:text-white w-full transition-colors"
                        >
                            {child.icon}
                            <span>{child.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Navigation = () => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement>(null);
    const { hasPermission } = usePermissions();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = (path: string) => {
        if (path !== '#') {
            router.push(path);
            setOpenMenu(null);
            setIsMobileMenuOpen(false);
        }
    };

    const navigationItems = useMemo(() => {
        const items: NavItem[] = [
            { 
                id: 'home',
                label: 'Home',
                path: '/home',
                icon: <Home className="w-4 h-4" />,
            },
            {
                id: 'deployments',
                label: 'Deployments',
                path: '#',
                icon: <Rocket className="w-4 h-4" />,
                children: [
                    { id: 'sites', label: 'Deployment Configuration', path: '/sites', icon: <Bolt className="w-4 h-4" /> },
                    { id: 'overview', label: 'Deployment Overview', path: '/overview', icon: <BookText className="w-4 h-4" /> },
                    { id: 'system', label: 'Deployment Settings', path: '/system', icon: <Settings className="w-4 h-4" /> },
                ]
            },
            {
                id: 'info',
                label: 'Portal Info',
                path: '#',
                icon: <Info className="w-4 h-4" />,
                children: [
                    { id: 'device-onboarding', label: 'Device Info', path: '/device-onboarding', icon: <Server className="w-4 h-4" /> },
                    { id: 'collector-info', label: 'Collector Info', path: '/collector-info', icon: <Bot className="w-4 h-4" /> },
                ]
            },
            { 
                id: 'data-explorer',
                label: 'Data Explorer',
                path: '#',
                icon: <Terminal className="w-4 h-4" />,
                children: [
                    { id: 'api-explorer', label: 'API Explorer', path: '/api-explorer', icon: <Terminal className="w-4 h-4" /> },
                    { id: 'dashboard-explorer', label: 'Dashboard Explorer', path: '/dashboard-explorer', icon: <ChartLine className="w-4 h-4" /> },
                    { id: 'reports-explorer', label: 'Reports Explorer', path: '/reports-explorer', icon: <FileText className="w-4 h-4" /> },
                ]
            },
            { 
                id: 'video-library', 
                label: 'Video Library', 
                path: '/video-library',
                icon: <PlayCircle className="w-4 h-4" /> 
            },
        ];

        if (hasPermission({ action: 'view', resource: 'pov' })) {
            items.push({ 
                id: 'pov', 
                label: 'POV Management', 
                path: '/pov',
                icon: <FileText className="w-4 h-4" /> 
            });
        }

        return items;
    }, [hasPermission]);

    const isActive = (item: NavItem): boolean => {
        if (item.path === pathname) {
            return true;
        }
        if (item.children) {
            return item.children.some(child => child.path === pathname);
        }
        return false;
    };

    return (
        <div ref={navRef}>
            {/* Desktop Navigation */}
            <div className="hidden lg:block bg-[#040F4B] rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                    {navigationItems.map((item) => (
                        <NavItem 
                            key={item.id} 
                            item={item} 
                            onNavigate={handleNavigation}
                            openMenu={openMenu}
                            setOpenMenu={setOpenMenu}
                            isActive={isActive(item)}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden bg-[#040F4B] px-4 py-2">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-full flex items-center justify-between text-white px-4 py-2 rounded-lg bg-[#0A1B6F]"
                >
                    <span className="font-medium">Menu</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileMenuOpen && (
                    <div className="mt-2 space-y-1">
                        {navigationItems.map((item) => (
                            <NavItem 
                                key={item.id} 
                                item={item} 
                                onNavigate={handleNavigation}
                                openMenu={openMenu}
                                setOpenMenu={setOpenMenu}
                                isActive={isActive(item)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 