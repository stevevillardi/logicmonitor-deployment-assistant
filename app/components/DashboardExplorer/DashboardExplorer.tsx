import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Layout, Info, ShoppingCart, Plus, Minus, X, Upload, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardPreview from './DashboardPreview';
import DashboardMiniPreview from './DashboardMiniPreview';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCart } from '../../contexts/CartContext';
import CartModal from './CartModal';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { UploadDashboard } from './UploadDashboard';
import { useAuth } from '@/app/contexts/AuthContext';
import { devError, devLog } from '../Shared/utils/debug';

// Define the dashboard type
interface Dashboard {
    filename: string;
    displayname: string;
    path: string;
    url: string;
    category: string;
    content: any;
    // These will be populated when we fetch the actual JSON content
    name?: string;
    description?: string;
    widgets?: number;
    lastUpdated?: string;
    submitted_by?: string;
}

const DashboardExplorer = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [currentPage, setCurrentPage] = useState(1);
    const dashboardsPerPage = 12;
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [categoryGroups, setCategoryGroups] = useState<Record<string, string[]>>({});
    const { 
        selectedDashboards, 
        addDashboard, 
        removeDashboard, 
        isDashboardSelected,
        clearCart
    } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    devLog('Upload dialog state:', isUploadOpen);
    const { user } = useAuth();
    devLog('Current user:', user);

    // Reset page when category or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchTerm]);

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabaseBrowser
                    .from('dashboard-configs')
                    .select('*')
                    .order('category');

                if (error) throw error;

                const allDashboards = data.map(item => ({
                    ...item,
                    name: `${item.filename
                        .replace('.json', '')
                        .replace(/[-_]+/g, ' ')
                        .trim()}${item.path.includes('Legacy') ? ' (Legacy)' : 
                          item.path.includes('Previous') ? ' (Previous)' : ''}`,
                    displayname: item.displayname,
                    description: item.content?.description || `${item.category} dashboard`,
                    widgets: item.content?.widgets?.length || 0,
                    lastUpdated: new Date(item.last_updated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                }));

                // Process categories into groups
                const groups: Record<string, string[]> = {};
                const uniqueCategories = [...new Set(data.map(item => item.category))];
                
                uniqueCategories.forEach(category => {
                    const groupName = category.includes('/') ? category.split('/')[0] : 'Other';
                    if (!groups[groupName]) {
                        groups[groupName] = [];
                    }
                    groups[groupName].push(category);
                });

                setCategoryGroups(groups);
                setDashboards(allDashboards);
                setCategories(uniqueCategories);
                setError(null);
            } catch (err) {
                setError('Failed to load dashboards');
                devError('Error loading dashboards:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboards();
    }, []);

    useEffect(() => {
        return () => {
            // Cleanup function to ensure dialog is closed when component unmounts
            setIsUploadOpen(false);
        };
    }, []);

    // Filter and sort dashboards based on search and category
    const filteredDashboards = dashboards
        .filter(dashboard => {
            const matchesSearch = 
                dashboard?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = 
                selectedCategory === 'All Categories' || 
                dashboard.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            // Sort alphabetically by name
            return (a.name || '').localeCompare(b.name || '');
        });

    // Pagination
    const totalPages = Math.ceil(filteredDashboards.length / dashboardsPerPage);
    const currentDashboards = filteredDashboards.slice(
        (currentPage - 1) * dashboardsPerPage,
        currentPage * dashboardsPerPage
    );

    // Add session check effect
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabaseBrowser.auth.getSession();
            devLog('Current session:', !!session);
        };
        
        checkSession();
    }, []);

    // Add loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Layout className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                <CardTitle className="text-gray-900 dark:text-gray-100">Dashboard Explorer</CardTitle>
                            </div>
                            <div className="animate-pulse w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 bg-white dark:bg-gray-900">
                        <div className="flex flex-col min-h-[800px]">
                            {/* Info Banner Skeleton */}
                            <div className="mb-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-pulse">
                                    <div className="h-4 bg-blue-100 dark:bg-blue-800/50 rounded w-3/4 mb-3" />
                                    <div className="h-4 bg-blue-100 dark:bg-blue-800/50 rounded w-1/2" />
                                </div>
                            </div>

                            <div className="flex gap-6">
                                {/* Left Sidebar Skeleton */}
                                <div className="hidden md:block w-64 shrink-0 space-y-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                    ))}
                                </div>

                                {/* Main Content Skeleton */}
                                <div className="flex-1">
                                    {/* Search Bar Skeleton */}
                                    <div className="mb-6">
                                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                                    </div>

                                    {/* Dashboard Grid Skeleton */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <div className="animate-pulse space-y-3">
                                                    <div className="flex justify-between">
                                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                                                    </div>
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                                    <div className="flex gap-2">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                                                    </div>
                                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Add error state
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    const cartButton = (
        <Button
            className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white gap-2 w-full sm:w-auto"
            onClick={() => setIsCartOpen(true)}
        >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard Import List</span>
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {selectedDashboards.length}
            </span>
        </Button>
    );

    const toggleDashboardSelection = (dashboard: any) => {
        if (isDashboardSelected(dashboard.path)) {
            removeDashboard(dashboard.path);
        } else {
            addDashboard(dashboard);
        }
    };

    const handleSelectAll = () => {
        // Add all filtered dashboards to cart
        filteredDashboards.forEach(dashboard => {
            if (!isDashboardSelected(dashboard.path)) {
                addDashboard(dashboard);
            }
        });
    };

    const handleUploadOpen = async () => {        
        setIsUploadOpen(true);
    };

    const handleRefresh = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabaseBrowser
                .from('dashboard-configs')
                .select('*')
                .order('category');

            if (error) throw error;

            const allDashboards = data.map(item => ({
                ...item,
                name: `${item.filename
                    .replace('.json', '')
                    .replace(/[-_]+/g, ' ')
                    .trim()}${item.path.includes('Legacy') ? ' (Legacy)' : 
                      item.path.includes('Previous') ? ' (Previous)' : ''}`,
                description: item.content?.description || `${item.category} dashboard`,
                widgets: item.content?.widgets?.length || 0,
                lastUpdated: new Date(item.last_updated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            }));

            setDashboards(allDashboards);
            setError(null);
        } catch (err) {
            setError('Failed to refresh dashboards');
            devError('Error refreshing dashboards:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-6 mb-4">
                <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Layout className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                <CardTitle className="text-gray-900 dark:text-gray-100">Dashboard Explorer</CardTitle>
                            </div>
                            <div className="flex items-center gap-3">
                                {user ? (
                                    <Button
                                        variant="outline"
                                        onClick={handleUploadOpen}
                                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span className="hidden sm:inline">Upload Dashboard</span>
                                    </Button>
                                ) : null}
                                {cartButton}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 bg-white dark:bg-gray-900">
                        <div className="flex flex-col min-h-[800px]">
                            {/* Info Banner */}
                            <div className="mb-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">Explore LogicMonitor Dashboards</span>
                                    </div>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Browse through our collection of pre-configured dashboards. Each dashboard is designed to provide comprehensive monitoring for specific aspects of your infrastructure. Add dashboards to your dashboard import list to import them into your LogicMonitor portal. Have a dashboard you&apos;d like to share? Upload your dashboard for inclusion in the community dashboard collection.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                {/* Left Sidebar Categories */}
                                <div className="hidden md:block w-64 shrink-0">
                                    <div className="space-y-1">
                                        <div
                                            className={`px-3 py-2 rounded-md cursor-pointer text-sm ${
                                                selectedCategory === 'All Categories' 
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' 
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                            onClick={() => setSelectedCategory('All Categories')}
                                        >
                                            All Categories
                                        </div>
                                        {Object.entries(categoryGroups).map(([group, categories]) => (
                                            <div key={group} className="space-y-1">
                                                {categories.map(category => (
                                                    <div
                                                        key={category}
                                                        className={`px-3 py-2 rounded-md cursor-pointer text-sm ${
                                                            selectedCategory === category 
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' 
                                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                        onClick={() => setSelectedCategory(category)}
                                                    >
                                                        {category}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1">
                                    {/* Search Bar */}
                                    <div className="mb-6">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex gap-2 flex-1">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <Input
                                                        placeholder="Search dashboards..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleRefresh}
                                                    className="shrink-0 bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300"
                                                    disabled={isLoading}
                                                >
                                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 sm:justify-end">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleSelectAll}
                                                    className="flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Select All
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={clearCart}
                                                    className="flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Clear All
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {filteredDashboards.length} {filteredDashboards.length === 1 ? 'dashboard' : 'dashboards'} found
                                        </div>
                                    </div>

                                    {/* Mobile Category Selector */}
                                    <div className="md:hidden mb-4">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                        <span className="truncate">{selectedCategory}</span>
                                                    </div>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent 
                                                className="w-[280px] p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                                align="start"
                                            >
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    <div 
                                                        className={`px-3 py-2 cursor-pointer text-sm transition-colors
                                                            ${selectedCategory === 'All Categories' 
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' 
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                            }`}
                                                        onClick={() => {
                                                            setSelectedCategory('All Categories');
                                                            const popoverTrigger = document.querySelector('[data-state="open"]');
                                                            if (popoverTrigger) {
                                                                (popoverTrigger as HTMLElement).click();
                                                            }
                                                        }}
                                                    >
                                                        All Categories
                                                    </div>
                                                    {Object.entries(categoryGroups).map(([group, categories]) => (
                                                        <div key={group}>
                                                            {group !== 'Other' && (
                                                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                                                                    {group}
                                                                </div>
                                                            )}
                                                            {categories.map(category => (
                                                                <div
                                                                    key={category}
                                                                    className={`px-3 py-2 cursor-pointer text-sm transition-colors
                                                                        ${selectedCategory === category 
                                                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' 
                                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                                        }`}
                                                                    onClick={() => {
                                                                        setSelectedCategory(category);
                                                                        const popoverTrigger = document.querySelector('[data-state="open"]');
                                                                        if (popoverTrigger) {
                                                                            (popoverTrigger as HTMLElement).click();
                                                                        }
                                                                    }}
                                                                >
                                                                    {category}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Dashboard Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {currentDashboards.map((dashboard) => (
                                            <DashboardMiniPreview key={dashboard.path} dashboard={dashboard.content}>
                                                <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all relative">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <h3 
                                                                className={`text-base sm:text-lg font-semibold text-blue-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer ${
                                                                    dashboard.path.includes('Legacy') || dashboard.path.includes('Previous') ? 'italic' : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setSelectedDashboard(dashboard.content);
                                                                    setIsPreviewOpen(true);
                                                                }}
                                                            >
                                                                {dashboard.displayname}
                                                                <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
                                                                    {dashboard.path.includes('Legacy') && (
                                                                        <span className="text-xs font-normal text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                                                            Legacy
                                                                        </span>
                                                                    )}
                                                                    {dashboard.path.includes('Previous') && (
                                                                        <span className="text-xs font-normal text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                                                                            Previous
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </h3>
                                                            <span className="inline-flex px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                                                                {dashboard.category}
                                                            </span>
                                                        </div>
                                                        
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                            {dashboard.description}
                                                        </p>

                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                                                {dashboard.widgets} widgets
                                                            </span>
                                                            {dashboard.submitted_by ? (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Submitted by: {dashboard.submitted_by}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                                                                    Core Dashboard
                                                                </span>
                                                            )}
                                                            {dashboard.lastUpdated && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Updated: {dashboard.lastUpdated}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
                                                            {dashboard.url && (
                                                                <a
                                                                    href={dashboard.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                    <span className="hidden sm:inline">View Source</span>
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    const dataStr = JSON.stringify(dashboard.content, null, 2);
                                                                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                                                    const url = URL.createObjectURL(dataBlob);
                                                                    const link = document.createElement('a');
                                                                    link.href = url;
                                                                    link.download = dashboard.filename;
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                    URL.revokeObjectURL(url);
                                                                }}
                                                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Download</span>
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleDashboardSelection(dashboard);
                                                                }}
                                                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors ml-auto"
                                                            >
                                                                {isDashboardSelected(dashboard.path) ? (
                                                                    <>
                                                                        <Minus className="w-4 h-4" />
                                                                        <span className="hidden sm:inline">Remove from Import</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus className="w-4 h-4" />
                                                                        <span className="hidden sm:inline">Add to Import</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DashboardMiniPreview>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <div className="mt-8">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 order-first sm:order-none">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <DashboardPreview 
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    dashboard={selectedDashboard}
                />
                <CartModal 
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                />
                <UploadDashboard 
                    open={isUploadOpen}
                    onOpenChange={setIsUploadOpen}
                />
            </div>
        </TooltipProvider>
    );
};

export default DashboardExplorer; 