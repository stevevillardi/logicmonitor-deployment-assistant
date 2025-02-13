import { useState, useEffect, useCallback } from 'react';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Edit2, Layout, Target, CheckCircle2, ListChecks, Tags, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import ManagePOVContentDialog from '@/app/components/POV/ManagePOVContentDialog';
import ManagePOVEntriesDialog from '@/app/components/POV/ManagePOVEntriesDialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { devError } from '../Shared/utils/debug';

interface DecisionCriteria {
    id: string;
    title: string;
    success_criteria: string;
    use_case: string;
    status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ARCHIVED';
    created_by: string;
    decision_criteria_activities: Array<{ id: string; activity: string }>;
    decision_criteria_categories: Array<{ category: string }>;
}

interface DecisionCriteriaExplorerProps {
    parentLoading: boolean;
    onLoadingComplete: () => void;
}

const DecisionCriteriaExplorer = ({ parentLoading, onLoadingComplete }: DecisionCriteriaExplorerProps) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [criteria, setCriteria] = useState<DecisionCriteria[]>([]);
    const [isLoading, setIsLoading] = useState(parentLoading);
    const [error, setError] = useState<string | null>(null);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>([]);

    const fetchCriteria = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const query = supabaseBrowser
                .from('decision_criteria')
                .select(`
                    *,
                    decision_criteria_activities (
                        id,
                        activity
                    ),
                    decision_criteria_categories (
                        category
                    )
                `)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            const uniqueCategories = [...new Set(
                data?.flatMap(c => c.decision_criteria_categories?.map((cc: { category: string }) => cc.category) || [])
            )];
            
            setCategories(uniqueCategories);
            setCriteria(data || []);
        } catch (err) {
            setError('Failed to load decision criteria');
            devError(err);
        } finally {
            setIsLoading(false);
            onLoadingComplete();
        }
    }, [onLoadingComplete]);

    useEffect(() => {
        if (parentLoading || !criteria.length) {
            fetchCriteria();
        }
    }, [parentLoading, fetchCriteria, criteria.length]);

    const filteredCriteria = criteria.filter(item => {
        const matchesSearch = 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.use_case.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = 
            selectedCategory === 'All' || 
            item.decision_criteria_categories?.some(cc => cc.category === selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const paginatedCriteria = filteredCriteria.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) {
        return <div className="p-8 text-center dark:text-gray-400">Loading...</div>;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                            placeholder="Search decision criteria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                    <Filter className="h-4 w-4" />
                                    Category
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <div className="space-y-1 p-2">
                                    <div
                                        className={`px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                                            selectedCategory === 'All'
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                        onClick={() => setSelectedCategory('All')}
                                    >
                                        All Categories
                                    </div>
                                    {categories.map((category) => (
                                        <div
                                            key={category}
                                            className={`px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                                                selectedCategory === category
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            {category}
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {user && (
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => setIsManageOpen(true)}
                                    className="flex-1 sm:flex-none gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Manage</span>
                                </Button>
                                <Button 
                                    onClick={() => setIsCreateOpen(true)}
                                    className="flex-1 sm:flex-none gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">New</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {paginatedCriteria.length === 0 ? (
                    <div className="border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-lg p-6 text-center bg-white dark:bg-gray-900">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Layout className="h-8 w-8 text-blue-400 dark:text-blue-500" />
                            <h3 className="font-medium text-blue-900 dark:text-gray-100">No Decision Criteria Found</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                                {searchTerm 
                                    ? 'No decision criteria match your search criteria'
                                    : user 
                                        ? 'Create your first decision criteria by clicking the New button'
                                        : 'No published decision criteria available yet'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {paginatedCriteria.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {item.decision_criteria_categories?.map((cc: { category: string }, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className="px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                    >
                                                        {cc.category}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-5 flex-shrink-0">
                                            <CheckCircle2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Success Criteria
                                            </span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {item.success_criteria}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-5 flex-shrink-0">
                                            <Lightbulb className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Use Case
                                            </span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {item.use_case}
                                            </p>
                                        </div>
                                    </div>

                                    {item.decision_criteria_activities?.length > 0 && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 flex-shrink-0">
                                                <ListChecks className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Activities
                                                </span>
                                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {item.decision_criteria_activities.map((activity) => (
                                                        <li key={activity.id}>{activity.activity}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredCriteria.length > itemsPerPage && (
                    <div className="mt-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300 order-first sm:order-none">
                                Page {currentPage} of {Math.ceil(filteredCriteria.length / itemsPerPage)} ({filteredCriteria.length} {filteredCriteria.length === 1 ? 'criterion' : 'criteria'})
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage * itemsPerPage >= filteredCriteria.length}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ManagePOVContentDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                type="decision-criteria"
                onSuccess={fetchCriteria}
            />
            <ManagePOVEntriesDialog
                open={isManageOpen}
                onOpenChange={setIsManageOpen}
                type="decision-criteria"
                onSuccess={fetchCriteria}
            />
        </CardContent>
    );
};

export default DecisionCriteriaExplorer; 