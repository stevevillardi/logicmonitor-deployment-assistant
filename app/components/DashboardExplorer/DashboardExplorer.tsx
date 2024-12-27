import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Layout, Info, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@supabase/supabase-js';
import DashboardPreview from './DashboardPreview';
import DashboardMiniPreview from './DashboardMiniPreview';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCart } from '../../contexts/CartContext';
import CartModal from './CartModal';

// Define the dashboard type
interface Dashboard {
    filename: string;
    path: string;
    url: string;
    category: string;
    content: any;
    // These will be populated when we fetch the actual JSON content
    name?: string;
    description?: string;
    widgets?: number;
    lastUpdated?: string;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { selectedDashboards, addDashboard, removeDashboard, isDashboardSelected } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Reset page when category or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchTerm]);

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
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
                console.error('Error loading dashboards:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboards();
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

    // Add loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <Layout className="w-6 h-6 text-blue-700" />
                            <CardTitle>Dashboard Explorer</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-gray-200 rounded-lg w-full" />
                                ))}
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
            Dashboard Cart
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

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Layout className="w-6 h-6 text-blue-700" />
                                <CardTitle>Dashboard Explorer</CardTitle>
                            </div>
                            {cartButton}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col min-h-[800px]">
                            {/* Info Banner */}
                            <div className="mb-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">Explore LogicMonitor Dashboards</span>
                                    </div>
                                    <p className="text-sm text-blue-600">
                                        Browse through our collection of pre-configured dashboards. Each dashboard is designed to provide comprehensive monitoring for specific aspects of your infrastructure.
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
                                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                                    : 'hover:bg-gray-100'
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
                                                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                                                : 'hover:bg-gray-100'
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
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Search dashboards..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                                            />
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            {filteredDashboards.length} {filteredDashboards.length === 1 ? 'dashboard' : 'dashboards'} found
                                        </div>
                                    </div>

                                    {/* Mobile Category Selector */}
                                    <div className="md:hidden mb-4">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Filter className="w-4 h-4" />
                                                        <span>{selectedCategory}</span>
                                                    </div>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[240px]">
                                                {/* Same category content as sidebar */}
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Dashboard Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {currentDashboards.map((dashboard) => (
                                            <DashboardMiniPreview key={dashboard.path} dashboard={dashboard.content}>
                                                <div className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all relative">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h3 
                                                                    className={`text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer ${
                                                                        dashboard.path.includes('Legacy') || dashboard.path.includes('Previous') ? 'italic' : ''
                                                                    }`}
                                                                    onClick={() => {
                                                                        setSelectedDashboard(dashboard.content);
                                                                        setIsPreviewOpen(true);
                                                                    }}
                                                                >
                                                                    {dashboard.name}
                                                                    {dashboard.path.includes('Legacy') && (
                                                                        <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                                            Legacy
                                                                        </span>
                                                                    )}
                                                                    {dashboard.path.includes('Previous') && (
                                                                        <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                                                            Previous
                                                                        </span>
                                                                    )}
                                                                </h3>
                                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                                                    {dashboard.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dashboard.description}</p>
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                                                    {dashboard.widgets} widgets
                                                                </span>
                                                                {dashboard.lastUpdated && (
                                                                    <span className="text-xs text-gray-500">
                                                                        Updated: {dashboard.lastUpdated}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-4 pt-3 border-t">
                                                                <a
                                                                    href={dashboard.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                    View Source
                                                                </a>
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
                                                                    className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    Download
                                                                </button>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleDashboardSelection(dashboard);
                                                                    }}
                                                                    className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                                >
                                                                    {isDashboardSelected(dashboard.path) ? (
                                                                        <>
                                                                            <Minus className="w-4 h-4" />
                                                                            Remove from Dashboard Import
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Plus className="w-4 h-4" />
                                                                            Add to Dashboard Import
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
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
                                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-700 order-first sm:order-none">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
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
            </div>
        </TooltipProvider>
    );
};

export default DashboardExplorer; 