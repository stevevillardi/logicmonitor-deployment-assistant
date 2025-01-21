import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/app/contexts/AuthContext';
import { Save, X, Edit2, Trash2, Layout, PlayCircle, Clock, Tag } from "lucide-react";
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';
import { devError } from '@/app/components/Shared/utils/debug';
import { toast } from 'react-hot-toast';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Video {
    id: string;
    title: string;
    description: string;
    video_id: string;
    duration: string;
    category_id: string;
    submitted_by: string;
    created_at: string;
    updated_at: string;
    video_categories: {
        id: string;
        name: string;
    };
}

interface ManageVideosDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface EditForm {
    title: string;
    description: string;
    video_id: string;
    duration: string;
    category: string;
}

const inputBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400";
const buttonBaseStyles = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300";

export default function ManageVideosDialog({ open, onOpenChange }: ManageVideosDialogProps) {
    const { user } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EditForm>({
        title: '',
        description: '',
        video_id: '',
        duration: '',
        category: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const fetchVideos = async () => {
        setIsLoading(true);
        const { data, error } = await supabaseBrowser
            .from('videos')
            .select(`
                *,
                video_categories (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setVideos(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (open && user?.email) {
            fetchVideos();
        }
    }, [open, user?.email]);

    const handleEdit = (video: Video) => {
        setEditingId(video.id);
        setEditForm({
            title: video.title,
            description: video.description,
            video_id: video.video_id,
            duration: video.duration,
            category: video.video_categories.name
        });
    };

    const handleSave = async (video: Video) => {
        try {
            const { error } = await supabaseBrowser
                .from('videos')
                .update({
                    title: editForm.title.trim(),
                    description: editForm.description.trim(),
                    video_id: editForm.video_id.trim(),
                    duration: editForm.duration.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', video.id);

            if (!error) {
                await fetchVideos();
                setEditingId(null);
                toast.success('Video updated successfully');
            }
        } catch (error) {
            devError('Error saving video:', error);
            toast.error('Failed to update video');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabaseBrowser
                .from('videos')
                .delete()
                .eq('id', id);

            if (!error) {
                await fetchVideos();
                setDeleteConfirmId(null);
                toast.success('Video deleted successfully');
            }
        } catch (error) {
            devError('Error deleting video:', error);
            toast.error('Failed to delete video');
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setEditingId(null);
            setEditForm({
                title: '',
                description: '',
                video_id: '',
                duration: '',
                category: ''
            });
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[95vw] w-full sm:max-w-3xl lg:max-w-4xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                        Manage Videos ({videos.length})
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
                        Manage your submitted videos in the library.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6 py-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-white/50 dark:bg-gray-900/50 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Layout className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No videos found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {videos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700"
                                    >
                                        {editingId === video.id ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Title *</Label>
                                                        <Input
                                                            value={editForm.title}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                            className={inputBaseStyles}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Video ID *</Label>
                                                        <Input
                                                            value={editForm.video_id}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, video_id: e.target.value }))}
                                                            placeholder="e.g., dQw4w9WgXcQ"
                                                            className={inputBaseStyles}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Description *</Label>
                                                    <Textarea
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                        className={inputBaseStyles}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Duration *</Label>
                                                    <Input
                                                        value={editForm.duration}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                                                        placeholder="e.g., 12:34"
                                                        className={inputBaseStyles}
                                                    />
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSave(video)}
                                                        disabled={!editForm.title || !editForm.description || !editForm.video_id || !editForm.duration}
                                                        className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                                                    >
                                                        <Save className="h-4 w-4 mr-1" />
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingId(null)}
                                                        className={buttonBaseStyles}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <PlayCircle className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                </div>
                                                <div className="flex flex-grow min-w-0 gap-4">
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                                                                {video.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {video.duration}
                                                                </div>
                                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium">
                                                                    <Tag className="w-3 h-3 mr-1" />
                                                                    {video.video_categories.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                                            {video.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleEdit(video)}
                                                            className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                                                        >
                                                            <Edit2 className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setDeleteConfirmId(video.id)}
                                                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>

            <AlertDialog 
                open={!!deleteConfirmId} 
                onOpenChange={(open) => !open && setDeleteConfirmId(null)}
            >
                <AlertDialogContent className="bg-red-50 border-red-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Video?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-red-700">
                            Are you sure you want to delete this video? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel 
                            className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-100 border border-red-200 text-red-700 hover:bg-red-200"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                        >
                            Delete Video
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
} 