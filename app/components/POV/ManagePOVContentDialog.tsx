import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Save } from 'lucide-react';
import { supabaseBrowser } from '@/app/lib/supabase';
import { useAuth } from '@/app/hooks/useAuth';
import { AITextarea } from "@/app/components/ui/ai-textarea";

interface ManagePOVContentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'decision-criteria' | 'challenges';
    initialData?: any;
    onSuccess: () => void;
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

export function ManagePOVContentDialog({
    open,
    onOpenChange,
    type,
    initialData,
    onSuccess
}: ManagePOVContentDialogProps) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Create a unique key for this dialog instance
    const storageKey = `pov-dialog-${type}-${initialData?.id || 'new'}`;
    
    const [formData, setFormData] = useState<FormData>(() => {
        // Try to load saved state from localStorage first
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                return {
                    ...parsedData,
                    activities: parsedData.activities || []
                };
            } catch (e) {
                console.error('Error parsing saved form data:', e);
            }
        }
        
        // Fall back to initial data or defaults
        return {
            title: initialData?.title || '',
            use_case: initialData?.use_case || '',
            success_criteria: initialData?.success_criteria || '',
            activities: initialData?.activities?.map((a: any) => a.activity) || [],
            challenge_description: initialData?.challenge_description || '',
            business_impact: initialData?.business_impact || '',
            example: initialData?.example || '',
            categories: initialData?.categories || [],
            outcomes: initialData?.outcomes?.map((o: any) => o.outcome) || []
        };
    });

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        if (open) {
            localStorage.setItem(storageKey, JSON.stringify(formData));
        }
    }, [formData, open, storageKey]);

    // Clear localStorage when dialog is closed or form is submitted successfully
    const clearSavedData = () => {
        localStorage.removeItem(storageKey);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
            clearSavedData();
        }
        onOpenChange(open);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            use_case: '',
            success_criteria: '',
            activities: [],
            challenge_description: '',
            business_impact: '',
            example: '',
            categories: [],
            outcomes: []
        });
        setIsSubmitting(false);
        clearSavedData();
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            if (type === 'decision-criteria') {
                const { data: criteriaData, error: criteriaError } = await supabaseBrowser
                    .from('decision_criteria')
                    .insert([{
                        title: formData.title,
                        success_criteria: formData.success_criteria,
                        use_case: formData.use_case,
                        created_by: user?.id,
                        status: 'DRAFT'
                    }])
                    .select()
                    .single();

                if (criteriaError) throw criteriaError;

                // Insert decision criteria categories
                if (formData.categories.length > 0) {
                    const categories = formData.categories
                        .filter(Boolean)
                        .map(category => ({
                            decision_criteria_id: criteriaData.id,
                            category,
                            created_by: user?.id
                        }));

                    const { error: categoriesError } = await supabaseBrowser
                        .from('decision_criteria_categories')
                        .insert(categories);

                    if (categoriesError) throw categoriesError;
                }

                // Insert associated activities
                if (formData.activities.length > 0) {
                    const activities = formData.activities
                        .filter(Boolean)
                        .map((activity, index) => ({
                            decision_criteria_id: criteriaData.id,
                            activity,
                            order_index: index,
                            created_by: user?.id
                        }));

                    const { error: activitiesError } = await supabaseBrowser
                        .from('decision_criteria_activities')
                        .insert(activities);

                    if (activitiesError) throw activitiesError;
                }
            } else {
                const { data: challengeData, error: challengeError } = await supabaseBrowser
                    .from('challenges')
                    .insert([{
                        title: formData.title,
                        challenge_description: formData.challenge_description,
                        business_impact: formData.business_impact,
                        example: formData.example,
                        created_by: user?.id,
                        status: 'DRAFT'
                    }])
                    .select()
                    .single();

                if (challengeError) throw challengeError;

                // Insert categories
                if (formData.categories.length > 0) {
                    const categories = formData.categories
                        .filter(Boolean)
                        .map(category => ({
                            challenge_id: challengeData.id,
                            category,
                            created_by: user?.id
                        }));

                    const { error: categoriesError } = await supabaseBrowser
                        .from('challenge_categories')
                        .insert(categories);

                    if (categoriesError) throw categoriesError;
                }

                // Insert outcomes
                if (formData.outcomes.length > 0) {
                    const outcomes = formData.outcomes
                        .filter(Boolean)
                        .map((outcome, index) => ({
                            challenge_id: challengeData.id,
                            outcome,
                            order_index: index,
                            created_by: user?.id
                        }));

                    const { error: outcomesError } = await supabaseBrowser
                        .from('challenge_outcomes')
                        .insert(outcomes);

                    if (outcomesError) throw outcomesError;
                }
            }

            onSuccess();
            clearSavedData(); // Clear saved data after successful submission
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error('Error submitting content:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    className="max-w-[95vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0 max-h-[90vh] overflow-y-auto"
                >
                    <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
                        <DialogTitle className="text-base sm:text-lg font-bold text-[#040F4B] dark:text-gray-100">
                            {initialData ? 'Edit' : 'Create'} {type === 'decision-criteria' ? 'Decision Criteria' : 'Challenge'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
                            Fill in the details below to {initialData ? 'update' : 'create'} your {type === 'decision-criteria' ? 'decision criteria' : 'challenge'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4 overflow-y-auto">
                        <div className="space-y-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-4">
                            <div className="space-y-4">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title"> {type === 'decision-criteria' ? 'Decision Criteria' : 'Challenge'} Title</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Enter title"
                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        />
                                    </div>

                                    {type === 'decision-criteria' ? (
                                        <>
                                            <div className="space-y-2">
                                                <AITextarea
                                                    label="Success Criteria"
                                                    id="success_criteria"
                                                    value={formData.success_criteria}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, success_criteria: value }))}
                                                    placeholder="Enter success criteria"
                                                    reason="Enhance success criteria description to be more specific and measurable"
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <AITextarea
                                                    label="Use Case"
                                                    id="use_case"
                                                    value={formData.use_case}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, use_case: value }))}
                                                    placeholder="Enter use case"
                                                    reason="Enhance use case description to be more detailed and business-focused"
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="pr-2">Categories</Label>
                                                {formData.categories.map((category, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <select
                                                            value={category}
                                                            onChange={(e) => {
                                                                const newCategories = [...formData.categories];
                                                                newCategories[index] = e.target.value;
                                                                setFormData(prev => ({ ...prev, categories: newCategories }));
                                                            }}
                                                            className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700"
                                                        >
                                                            <option value="">Select category...</option>
                                                            {DEFAULT_DECISION_CRITERIA_CATEGORIES
                                                                .filter(cat => !formData.categories.includes(cat) || cat === category)
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
                                                                const newCategories = formData.categories.filter((_, i) => i !== index);
                                                                setFormData(prev => ({ ...prev, categories: newCategories }));
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
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        categories: [...prev.categories, '']
                                                    }))}
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Category
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="pr-2">Portal Activities</Label>
                                                {formData?.activities?.map((activity, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <Input
                                                            value={activity || ''}
                                                            onChange={(e) => {
                                                                const newActivities = [...(formData.activities || [])];
                                                                newActivities[index] = e.target.value;
                                                                setFormData(prev => ({ ...prev, activities: newActivities }));
                                                            }}
                                                            placeholder="Enter activity"
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                const newActivities = (formData.activities || []).filter((_, i) => i !== index);
                                                                setFormData(prev => ({ ...prev, activities: newActivities }));
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
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        activities: [...(prev.activities || []), '']
                                                    }))}
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Activity
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <AITextarea
                                                    label="Challenge Description"
                                                    id="challenge_description"
                                                    value={formData.challenge_description}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, challenge_description: value }))}
                                                    placeholder="Describe the challenge"
                                                    reason="Enhance challenge description to be more precise and highlight key pain points"
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <AITextarea
                                                    label="Business Impact"
                                                    id="business_impact"
                                                    value={formData.business_impact}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, business_impact: value }))}
                                                    placeholder="Describe the business impact"
                                                    reason="Enhance business impact description to focus on the negative impact of not having the solution"
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <AITextarea
                                                    label="Example"
                                                    id="example"
                                                    value={formData.example}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, example: value }))}
                                                    placeholder="Provide an example"
                                                    reason="Enhance example to be more concrete and relatable to common use cases"
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="pr-2">Categories (Required Capabilities)</Label>
                                                {formData.categories.map((category, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <select
                                                            value={category}
                                                            onChange={(e) => {
                                                                const newCategories = [...formData.categories];
                                                                newCategories[index] = e.target.value;
                                                                setFormData(prev => ({ ...prev, categories: newCategories }));
                                                            }}
                                                            className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700"
                                                        >
                                                            <option value="">Select category...</option>
                                                            {DEFAULT_CHALLENGE_CATEGORIES
                                                                .filter(cat => !formData.categories.includes(cat) || cat === category)
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
                                                                const newCategories = formData.categories.filter((_, i) => i !== index);
                                                                setFormData(prev => ({ ...prev, categories: newCategories }));
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
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        categories: [...prev.categories, '']
                                                    }))}
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Category
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="pr-2">Desired Outcomes</Label>
                                                {formData.outcomes.map((outcome, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <Input
                                                            value={outcome}
                                                            onChange={(e) => {
                                                                const newOutcomes = [...formData.outcomes];
                                                                newOutcomes[index] = e.target.value;
                                                                setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
                                                            }}
                                                            placeholder="Enter desired outcome"
                                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                const newOutcomes = formData.outcomes.filter((_, i) => i !== index);
                                                                setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
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
                                                    onClick={() => setFormData(prev => ({ ...prev, outcomes: [...prev.outcomes, ''] }))}
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Outcome
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3">
                            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetForm();
                                        onOpenChange(false);
                                    }}
                                    className="w-full sm:w-auto bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManagePOVContentDialog; 