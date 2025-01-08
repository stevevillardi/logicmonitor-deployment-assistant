import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2, Save, X, Minus, Plus } from 'lucide-react';
import { supabaseBrowser } from '@/app/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { AITextarea } from "@/app/components/ui/ai-textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { devError } from '@/app/components/Shared/utils/debug';

interface ManagePOVEntriesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'decision-criteria' | 'challenges';
    onSuccess: () => void;
}

interface Entry {
    id: string;
    title: string;
    use_case?: string;
    success_criteria?: string;
    challenge_description?: string;
    business_impact?: string;
    example?: string;
    created_at: string;
    updated_at: string;
    categories?: string[];
    activities?: string[];
    outcomes?: string[];
}

interface ActivityData {
    activity: string;
}

interface CategoryData {
    category: string;
}

interface OutcomeData {
    outcome: string;
}

interface FormData {
    title: string;
    use_case: string;
    success_criteria: string;
    activities: string[];
    challenge_description: string;
    business_impact: string;
    example: string;
    categories: string[];
    outcomes: string[];
}

const DEFAULT_CHALLENGE_CATEGORIES = [
    "Agentless Monitoring",
    "Alert Routing",
    "Cloud Monitoring",
    "Correlated Insights",
    "Customer Partnership",
    "Resource Auto-Discovery",
    "Ecosystem Integration",
    "Enterprise Capabilities",
    "Full-Stack Visibility",
    "High-Availability",
    "Hybrid Monitoring",
    "Predictive Analytics",
    "Real-Time Visibility",
    "Future-Proof/Roadmap Details",
    "Scalability",
    "Service and Ops Views",
    "Versatility",
    "Actionable Alerts"
];

const DEFAULT_DECISION_CRITERIA_CATEGORIES = [
    "Deployment",
    "Cloud",
    "Alerting",
    "Correlation",
    "Service Insight",
    "Collectors",
    "Upgrades",
    "Full-Stack Visibility",
    "Anomaly Detection",
    "Forecasting",
    "Container Insights"
];

const ManagePOVEntriesDialog = ({ 
    open, 
    onOpenChange, 
    type,
    onSuccess 
}: ManagePOVEntriesDialogProps) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Entry | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Create a unique key for the edit data
    const storageKey = `pov-entries-${type}-${editingId || 'new'}`;
    
    const [editData, setEditData] = useState(() => {
        // Try to load saved state from localStorage
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                devError('Error parsing saved edit data:', e);
            }
        }
        
        // Fall back to defaults
        return {
            title: '',
            use_case: '',
            success_criteria: '',
            activities: [''],
            challenge_description: '',
            business_impact: '',
            example: '',
            categories: [''],
            outcomes: ['']
        };
    });

    // Save edit data to localStorage whenever it changes
    useEffect(() => {
        if (open && editingId) {
            localStorage.setItem(storageKey, JSON.stringify(editData));
        }
    }, [editData, open, editingId, storageKey]);

    // Clear localStorage when dialog is closed or edit is cancelled
    const clearSavedData = () => {
        localStorage.removeItem(storageKey);
    };

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const supabase = supabaseBrowser;
            if (type === 'decision-criteria') {
                // Fetch decision criteria with categories and activities
                const { data: criteriaData, error: criteriaError } = await supabase
                    .from('decision_criteria')
                    .select(`
                        *,
                        decision_criteria_categories(category),
                        decision_criteria_activities(activity)
                    `)
                    .eq('created_by', user?.id)
                    .order('created_at', { ascending: false });

                if (criteriaError) {
                    devError('Error fetching decision criteria:', criteriaError);
                    return;
                }

                if (criteriaData) {
                    const formattedData = criteriaData.map(entry => ({
                        ...entry,
                        categories: entry.decision_criteria_categories?.map((c: CategoryData) => c.category) || [],
                        activities: entry.decision_criteria_activities?.map((a: ActivityData) => a.activity) || []
                    }));
                    setEntries(formattedData);
                }
            } else {
                // Fetch challenges with categories and outcomes
                const { data: challengesData, error: challengesError } = await supabase
                    .from('challenges')
                    .select(`
                        *,
                        challenge_categories(category),
                        challenge_outcomes(outcome)
                    `)
                    .eq('created_by', user?.id)
                    .order('created_at', { ascending: false });

                if (challengesError) {
                    devError('Error fetching challenges:', challengesError);
                    return;
                }

                if (challengesData) {
                    const formattedData = challengesData.map(entry => ({
                        ...entry,
                        categories: entry.challenge_categories?.map((c: CategoryData) => c.category) || [],
                        outcomes: entry.challenge_outcomes?.map((o: OutcomeData) => o.outcome) || []
                    }));
                    setEntries(formattedData);
                }
            }
        } catch (error) {
            devError('Error in fetchEntries:', error);
        } finally {
            setIsLoading(false);
        }
    }, [type, user?.id]);

    useEffect(() => {
        if (open) {
            fetchEntries();
        }
    }, [open, fetchEntries]);

    const handleEdit = (entry: Entry) => {
        clearSavedData();
        setEditingId(entry.id);
        
        if (type === 'decision-criteria') {
            setEditData({
                ...editData,
                title: entry.title,
                use_case: entry.use_case || '',
                success_criteria: entry.success_criteria || '',
                activities: entry.activities || [''],
                categories: entry.categories || [''],
                challenge_description: '',
                business_impact: '',
                example: '',
            });
        } else {
            setEditData({
                ...editData,
                title: entry.title,
                challenge_description: entry.challenge_description || '',
                business_impact: entry.business_impact || '',
                example: entry.example || '',
                categories: entry.categories || [''],
                outcomes: entry.outcomes || [''],
                description: '',
                success_criteria: '',
                use_cases: ['']
            });
        }
    };

    const handleSave = async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        try {
            if (type === 'decision-criteria') {
                await supabaseBrowser
                    .from('decision_criteria')
                    .update({
                        title: editData.title,
                        use_case: editData.use_case,
                        success_criteria: editData.success_criteria,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId);

                // Delete and re-insert activities
                await supabaseBrowser
                    .from('decision_criteria_activities')
                    .delete()
                    .eq('decision_criteria_id', editingId);

                if (editData.activities.length > 0) {
                    const activities = editData.activities
                        .filter(Boolean)
                        .map((activity: string, index: number) => ({
                            decision_criteria_id: editingId,
                            activity,
                            order_index: index,
                            created_by: user?.id
                        }));

                    await supabaseBrowser
                        .from('decision_criteria_activities')
                        .insert(activities);
                }

                // Delete and re-insert categories
                await supabaseBrowser
                    .from('decision_criteria_categories')
                    .delete()
                    .eq('decision_criteria_id', editingId);

                if (editData.categories.length > 0) {
                    const categories = editData.categories
                        .filter(Boolean)
                        .map((category: string) => ({
                            decision_criteria_id: editingId,
                            category,
                            created_by: user?.id
                        }));

                    await supabaseBrowser
                        .from('decision_criteria_categories')
                        .insert(categories);
                }
            } else {
                await supabaseBrowser
                    .from('challenges')
                    .update({
                        title: editData.title,
                        challenge_description: editData.challenge_description,
                        business_impact: editData.business_impact,
                        example: editData.example,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId);

                await supabaseBrowser
                    .from('challenge_categories')
                    .delete()
                    .eq('challenge_id', editingId);

                await supabaseBrowser
                    .from('challenge_outcomes')
                    .delete()
                    .eq('challenge_id', editingId);

                const categories = editData.categories
                    .filter(Boolean)
                    .map((category: string) => ({
                        challenge_id: editingId,
                        category,
                        created_by: user?.id
                    }));

                if (categories.length > 0) {
                    await supabaseBrowser
                        .from('challenge_categories')
                        .insert(categories);
                }

                const outcomes = editData.outcomes
                    .filter(Boolean)
                    .map((outcome: string, index: number) => ({
                        challenge_id: editingId,
                        outcome,
                        order_index: index,
                        created_by: user?.id
                    }));

                if (outcomes.length > 0) {
                    await supabaseBrowser
                        .from('challenge_outcomes')
                        .insert(outcomes);
                }
            }

            setEntries(prevEntries => 
                prevEntries.map(entry => 
                    entry.id === editingId 
                        ? {
                            ...entry,
                            ...editData,
                            updated_at: new Date().toISOString()
                          }
                        : entry
                )
            );

            clearSavedData();
            setEditingId(null);
            onSuccess();
        } catch (error) {
            devError('Error saving POV entry:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const supabase = supabaseBrowser;
            
            if (type === 'decision-criteria') {
                // First delete all activities
                const { error: activitiesError } = await supabase
                    .from('decision_criteria_activities')
                    .delete()
                    .eq('decision_criteria_id', id);
                    
                if (activitiesError) {
                    devError('Error deleting activities:', activitiesError);
                    return;
                }

                // Then delete the main decision criteria
                const { error: criteriaError } = await supabase
                    .from('decision_criteria')
                    .delete()
                    .eq('id', id);

                if (criteriaError) {
                    devError('Error deleting decision criteria:', criteriaError);
                    return;
                }
            } else {
                // Delete challenge outcomes
                const { error: outcomesError } = await supabase
                    .from('challenge_outcomes')
                    .delete()
                    .eq('challenge_id', id);

                if (outcomesError) {
                    devError('Error deleting outcomes:', outcomesError);
                    return;
                }

                // Delete challenge categories
                const { error: categoriesError } = await supabase
                    .from('challenge_categories')
                    .delete()
                    .eq('challenge_id', id);

                if (categoriesError) {
                    devError('Error deleting categories:', categoriesError);
                    return;
                }

                // Finally delete the main challenge
                const { error: challengeError } = await supabase
                    .from('challenges')
                    .delete()
                    .eq('id', id);

                if (challengeError) {
                    devError('Error deleting challenge:', challengeError);
                    return;
                }
            }

            setEntries(prevEntries => 
                prevEntries.filter(entry => entry.id !== id)
            );
            
            setShowDeleteConfirm(false);
            setItemToDelete(null);
            onSuccess();
            
        } catch (error) {
            devError('Error deleting POV entry:', error);
        }
    };

    const resetState = () => {
        setEditingId(null);
        setItemToDelete(null);
        setShowDeleteConfirm(false);
        setEditData({
            title: '',
            use_case: '',
            success_criteria: '',
            activities: [''],
            challenge_description: '',
            business_impact: '',
            example: '',
            categories: [''],
            outcomes: ['']
        });
        clearSavedData();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetState();
            onSuccess();
        }
        onOpenChange(open);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        await handleDelete(itemToDelete.id);
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    const SaveButton = () => (
        <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
        >
            {isSaving ? (
                <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                </>
            ) : (
                <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                </>
            )}
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-0 my-0 max-h-[90vh] overflow-y-auto will-change-transform">
                <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-4">
                    <DialogTitle className="text-lg font-semibold text-[#040F4B] dark:text-gray-100">
                        Manage {type === 'decision-criteria' ? 'Decision Criteria' : 'Challenges'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
                        Manage your published {type === 'decision-criteria' ? 'decision criteria' : 'challenges'}. You can edit titles, descriptions, or remove entries.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 overflow-y-auto">
                    {entries.length === 0 ? (
                        <div className="border-2 border-dashed bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 rounded-lg p-6 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <h3 className="font-medium text-blue-900 dark:text-gray-100">No Entries Found</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-300">
                                    Your published entries will appear here
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry: Entry) => (
                                <div
                                    key={entry.id}
                                    className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm transform-none overflow-hidden"
                                >
                                    {editingId === entry.id ? (
                                        <div className="flex-1 flex flex-col gap-4 p-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Title
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={editData.title}
                                                    onChange={(e) => setEditData((prev: FormData) => ({ ...prev, title: e.target.value }))}
                                                    placeholder="Title"
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                />
                                            </div>

                                            {type === 'decision-criteria' ? (
                                                <>
                                                    <div className="space-y-2">
                                                        <AITextarea
                                                            label="Success Criteria"
                                                            id="success_criteria"
                                                            value={editData.success_criteria}
                                                            onValueChange={(value) => setEditData((prev: FormData) => ({ ...prev, success_criteria: value }))}
                                                            placeholder="Enter success criteria"
                                                            reason="Enhance success criteria description to be more specific and measurable"
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <AITextarea
                                                            label="Use Case"
                                                            id="use_case"
                                                            value={editData.use_case}
                                                            onValueChange={(value) => setEditData((prev: FormData) => ({ ...prev, use_case: value }))}
                                                            placeholder="Enter use case"
                                                            reason="Enhance use case description to be more detailed and business-focused"
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            Activities
                                                        </Label>
                                                        {editData.activities.map((activity: string, index: number) => (
                                                            <div key={index} className="flex gap-2">
                                                                <Input
                                                                    value={activity}
                                                                    onChange={(e) => {
                                                                        const newActivities = [...editData.activities];
                                                                        newActivities[index] = e.target.value;
                                                                        setEditData((prev: FormData) => ({ ...prev, activities: newActivities }));
                                                                    }}
                                                                    placeholder="Enter activity"
                                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const newActivities = editData.activities.filter((_: string, i: number) => i !== index);
                                                                        setEditData((prev: FormData) => ({ ...prev, activities: newActivities }));
                                                                    }}
                                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setEditData((prev: FormData) => ({ ...prev, activities: [...prev.activities, ''] }))}
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Activity
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="pr-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            Categories
                                                        </Label>
                                                        {editData.categories.map((category: string, index: number) => (
                                                            <div key={index} className="flex gap-2">
                                                                <select
                                                                    value={category}
                                                                    onChange={(e) => {
                                                                        const newCategories = [...editData.categories];
                                                                        newCategories[index] = e.target.value;
                                                                        setEditData((prev: FormData) => ({ ...prev, categories: newCategories }));
                                                                    }}
                                                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 dark:border-gray-700"
                                                                >
                                                                    <option value="">Select category...</option>
                                                                    {DEFAULT_DECISION_CRITERIA_CATEGORIES
                                                                        .filter(cat => !editData.categories.includes(cat) || cat === category)
                                                                        .map(defaultCategory => (
                                                                            <option key={defaultCategory} value={defaultCategory}>
                                                                                {defaultCategory}
                                                                            </option>
                                                                        ))
                                                                    }
                                                                </select>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const newCategories = editData.categories.filter((_: string, i: number) => i !== index);
                                                                        setEditData((prev: FormData) => ({ ...prev, categories: newCategories }));
                                                                    }}
                                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setEditData((prev: FormData) => ({ ...prev, categories: [...prev.categories, ''] }))}
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Category
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="space-y-2">
                                                        <AITextarea
                                                            label="Challenge Description"
                                                            id="challenge_description"
                                                            value={editData.challenge_description}
                                                            onValueChange={(value) => setEditData((prev: FormData) => ({ ...prev, challenge_description: value }))}
                                                            placeholder="Describe the challenge"
                                                            reason="Enhance challenge description to be more precise and highlight key pain points"
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <AITextarea
                                                            label="Business Impact"
                                                            id="business_impact"
                                                            value={editData.business_impact}
                                                            onValueChange={(value) => setEditData((prev: FormData) => ({ ...prev, business_impact: value }))}
                                                            placeholder="Describe the business impact"
                                                            reason="Enhance business impact description to focus on ROI and strategic value"
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <AITextarea
                                                            label="Example"
                                                            id="example"
                                                            value={editData.example}
                                                            onValueChange={(value) => setEditData((prev: FormData) => ({ ...prev, example: value }))}
                                                            placeholder="Provide an example"
                                                            reason="Enhance example to be more concrete and relatable"
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            Categories
                                                        </Label>
                                                        {editData.categories.map((category: string, index: number) => (
                                                            <div key={index} className="flex gap-2">
                                                                <select
                                                                    value={category}
                                                                    onChange={(e) => {
                                                                        const newCategories = [...editData.categories];
                                                                        newCategories[index] = e.target.value;
                                                                        setEditData((prev: FormData) => ({ ...prev, categories: newCategories }));
                                                                    }}
                                                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 dark:border-gray-700"
                                                                >
                                                                    <option value="">Select category...</option>
                                                                    {DEFAULT_CHALLENGE_CATEGORIES
                                                                        .filter(cat => !editData.categories.includes(cat) || cat === category)
                                                                        .map(defaultCategory => (
                                                                            <option key={defaultCategory} value={defaultCategory}>
                                                                                {defaultCategory}
                                                                            </option>
                                                                        ))
                                                                    }
                                                                </select>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const newCategories = editData.categories.filter((_: string, i: number) => i !== index);
                                                                        setEditData((prev: FormData) => ({ ...prev, categories: newCategories }));
                                                                    }}
                                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setEditData((prev: FormData) => ({ ...prev, categories: [...prev.categories, ''] }))}
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Category
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            Outcomes
                                                        </Label>
                                                        {editData.outcomes.map((outcome: string, index: number) => (
                                                            <div key={index} className="flex gap-2">
                                                                <Input
                                                                    value={outcome}
                                                                    onChange={(e) => {
                                                                        const newOutcomes = [...editData.outcomes];
                                                                        newOutcomes[index] = e.target.value;
                                                                        setEditData((prev: FormData) => ({ ...prev, outcomes: newOutcomes }));
                                                                    }}
                                                                    placeholder="Enter desired outcome"
                                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const newOutcomes = editData.outcomes.filter((_: string, i: number) => i !== index);
                                                                        setEditData((prev: FormData) => ({ ...prev, outcomes: newOutcomes }));
                                                                    }}
                                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setEditData((prev: FormData) => ({ ...prev, outcomes: [...prev.outcomes, ''] }))}
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Outcome
                                                        </Button>
                                                    </div>
                                                </>
                                            )}

                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-end">
                                                <SaveButton />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        resetState();
                                                        setEditingId(null);
                                                    }}
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col w-full">
                                            <div className="p-4 border-b border-blue-100 dark:border-gray-700">
                                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                    <div className="flex-grow space-y-1">
                                                        <h3 className="text-sm font-medium text-blue-900 dark:text-gray-100">
                                                            {entry.title}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-start gap-2 sm:items-center">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleEdit(entry)}
                                                            className="flex-1 sm:flex-initial bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200 gap-2"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="flex-1 sm:flex-initial bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-200 gap-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50">
                                                {type === 'decision-criteria' ? (
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Success Criteria
                                                                </h4>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                    {entry.success_criteria || 'No success criteria defined'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Use Case
                                                                </h4>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                    {entry.use_case || 'No use case defined'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Categories
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {entry.categories?.map((category: string, index: number) => (
                                                                        <span 
                                                                            key={index}
                                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                                        >
                                                                            {category}
                                                                        </span>
                                                                    )) || 'No categories defined'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Portal Activities
                                                                </h4>
                                                                <div className="space-y-1">
                                                                    {entry.activities?.map((activity: string, index: number) => (
                                                                        <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                                                            • {activity}
                                                                        </p>
                                                                    )) || 'No activities defined'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Challenge Description
                                                                </h4>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                    {entry.challenge_description || 'No description provided'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Business Impact
                                                                </h4>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                    {entry.business_impact || 'No business impact defined'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Example
                                                                </h4>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                    {entry.example || 'No example provided'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Categories
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {entry.categories?.map((category: string, index: number) => (
                                                                        <span 
                                                                            key={index}
                                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                                        >
                                                                            {category}
                                                                        </span>
                                                                    )) || 'No categories defined'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Outcomes
                                                                </h4>
                                                                <div className="space-y-1">
                                                                    {entry.outcomes?.map((outcome: string, index: number) => (
                                                                        <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                                                            • {outcome}
                                                                        </p>
                                                                    )) || 'No outcomes defined'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-red-50 dark:bg-red-900/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <span className="text-red-600">⚠</span> Delete {type === 'decision-criteria' ? 'Decision Criteria' : 'Challenge'}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete this {type === 'decision-criteria' ? 'decision criteria' : 'challenge'} configuration?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-800 rounded-md p-4 my-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            This action:
                            <ul className="list-disc ml-5 mt-2 space-y-1">
                                <li>Cannot be undone</li>
                                <li>Will remove all saved configuration data</li>
                                <li>Will not affect your current working configuration</li>
                            </ul>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                                className="bg-red-100 border border-red-200 text-red-700 hover:bg-red-200"
                            onClick={confirmDelete}
                        >
                            Delete {type === 'decision-criteria' ? 'Decision Criteria' : 'Challenge'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
};

export default ManagePOVEntriesDialog; 