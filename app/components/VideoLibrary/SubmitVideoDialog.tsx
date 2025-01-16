import { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from 'lucide-react';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { devError } from '../Shared/utils/debug';
import { toast } from 'react-hot-toast';

interface SubmitVideoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: string[];
    onSuccess: () => void;
}

const SubmitVideoDialog = ({ open, onOpenChange, categories, onSuccess }: SubmitVideoDialogProps) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video_id: '',
        duration: '',
        category: '',
        new_category: ''
    });

    const handleSubmit = async () => {
        if (!user?.email) return;
        
        setIsSubmitting(true);
        try {
            let categoryId;
            
            // If using a new category, create it first
            if (formData.new_category) {
                const { data: newCategory, error: categoryError } = await supabaseBrowser
                    .from('video_categories')
                    .insert({
                        name: formData.new_category
                    })
                    .select('id')
                    .single();

                if (categoryError) throw categoryError;
                categoryId = newCategory.id;
            } else {
                // Get the ID of the existing category
                const { data: existingCategory, error: categoryError } = await supabaseBrowser
                    .from('video_categories')
                    .select('id')
                    .eq('name', formData.category)
                    .single();

                if (categoryError) throw categoryError;
                categoryId = existingCategory.id;
            }

            // Insert the video
            const { error: videoError } = await supabaseBrowser
                .from('videos')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    video_id: formData.video_id,
                    duration: formData.duration,
                    category_id: categoryId,
                    submitted_by: user.email
                });

            if (videoError) throw videoError;

            toast.success('Video submitted successfully');
            onSuccess();
            onOpenChange(false);
            setFormData({
                title: '',
                description: '',
                video_id: '',
                duration: '',
                category: '',
                new_category: ''
            });
        } catch (error) {
            devError('Error submitting video:', error);
            toast.error('Failed to submit video');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <DialogHeader className="pb-4 border-b border-blue-200 dark:border-gray-700">
                    <DialogTitle className="text-xl font-semibold text-blue-900 dark:text-gray-100">
                        Submit New Video
                    </DialogTitle>
                    <DialogDescription className="text-blue-700 dark:text-blue-300">
                        Add a new video to the library. Please ensure all information is accurate.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm text-blue-700 dark:text-blue-300">
                                Video Title
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter video title"
                                className="bg-white dark:bg-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm text-blue-700 dark:text-blue-300">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter video description"
                                className="bg-white dark:bg-gray-900"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="video_id" className="text-sm text-blue-700 dark:text-blue-300">
                                    YouTube Video ID
                                </Label>
                                <Input
                                    id="video_id"
                                    value={formData.video_id}
                                    onChange={(e) => setFormData({ ...formData, video_id: e.target.value })}
                                    placeholder="e.g., dQw4w9WgXcQ"
                                    className="bg-white dark:bg-gray-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-sm text-blue-700 dark:text-blue-300">
                                    Duration
                                </Label>
                                <Input
                                    id="duration"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g., 12:34"
                                    className="bg-white dark:bg-gray-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-blue-700 dark:text-blue-300">
                                Category
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        category: e.target.value,
                                        new_category: '' 
                                    })}
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Select existing category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>

                                <Input
                                    placeholder="Or enter new category"
                                    value={formData.new_category}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        new_category: e.target.value,
                                        category: '' 
                                    })}
                                    className="bg-white dark:bg-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="bg-white dark:bg-gray-900"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!formData.category && !formData.new_category)}
                            className="bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {isSubmitting ? 'Submitting...' : 'Submit Video'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SubmitVideoDialog; 