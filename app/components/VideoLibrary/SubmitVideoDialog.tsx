import { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from 'lucide-react';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { devError } from '../Shared/utils/debug';
import { toast } from 'react-hot-toast';

const inputBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400";
const buttonBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300";

interface FormData {
    title: string;
    description: string;
    video_id: string;
    duration: string;
    category: string;
    new_category: string;
}

interface SubmitVideoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: string[];
    onSuccess: () => void;
}

const SubmitVideoDialog = ({ open, onOpenChange, categories, onSuccess }: SubmitVideoDialogProps) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        video_id: '',
        duration: '',
        category: '',
        new_category: ''
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            video_id: '',
            duration: '',
            category: '',
            new_category: ''
        });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    const isFormValid = () => {
        return formData.title.trim() !== '' &&
            formData.description.trim() !== '' &&
            formData.video_id.trim() !== '' &&
            formData.duration.trim() !== '' &&
            (formData.category !== '' || formData.new_category.trim() !== '');
    };

    const handleSubmit = async () => {
        if (!user?.email || !isFormValid()) return;
        
        setIsSubmitting(true);
        try {
            let categoryId;
            
            if (formData.new_category) {
                const { data: newCategory, error: categoryError } = await supabaseBrowser
                    .from('video_categories')
                    .insert({
                        name: formData.new_category.trim()
                    })
                    .select('id')
                    .single();

                if (categoryError) throw categoryError;
                categoryId = newCategory.id;
            } else {
                const { data: existingCategory, error: categoryError } = await supabaseBrowser
                    .from('video_categories')
                    .select('id')
                    .eq('name', formData.category)
                    .single();

                if (categoryError) throw categoryError;
                categoryId = existingCategory.id;
            }

            const { error: videoError } = await supabaseBrowser
                .from('videos')
                .insert({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    video_id: formData.video_id.trim(),
                    duration: formData.duration.trim(),
                    category_id: categoryId,
                    submitted_by: user.email
                });

            if (videoError) throw videoError;

            toast.success('Video submitted successfully');
            onSuccess();
            handleOpenChange(false);
            resetForm();
        } catch (error) {
            devError('Error submitting video:', error);
            toast.error('Failed to submit video');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <DialogHeader className="border-b border-blue-200 dark:border-gray-700 pb-4">
                    <DialogTitle className="text-xl font-semibold text-blue-900 dark:text-gray-100">
                        Submit New Video
                    </DialogTitle>
                    <DialogDescription className="text-blue-700 dark:text-blue-300">
                        Add a new video to the library. Please ensure all information is accurate.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm text-blue-700 dark:text-blue-300">
                                Video Title *
                            </Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter video title"
                                className={inputBaseStyles}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm text-blue-700 dark:text-blue-300">
                                Description *
                            </Label>
                            <Textarea
                                id="description"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter video description"
                                className={inputBaseStyles}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="video_id" className="text-sm text-blue-700 dark:text-blue-300">
                                    YouTube Video ID *
                                </Label>
                                <Input
                                    id="video_id"
                                    required
                                    value={formData.video_id}
                                    onChange={(e) => setFormData({ ...formData, video_id: e.target.value })}
                                    placeholder="e.g., dQw4w9WgXcQ"
                                    className={inputBaseStyles}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-sm text-blue-700 dark:text-blue-300">
                                    Duration *
                                </Label>
                                <Input
                                    id="duration"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g., 12:34"
                                    className={inputBaseStyles}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-blue-700 dark:text-blue-300">
                                Category *
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        category: e.target.value,
                                        new_category: '' 
                                    })}
                                    className={`w-full px-3 py-2 rounded-md border ${inputBaseStyles}`}
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
                                    className={inputBaseStyles}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-blue-200 dark:border-gray-700 pt-4">
                        <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                className={buttonBaseStyles}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !isFormValid()}
                                className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                            >
                                <Save className="h-4 w-4 mr-1" />
                                {isSubmitting ? 'Submitting...' : 'Submit Video'}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SubmitVideoDialog; 