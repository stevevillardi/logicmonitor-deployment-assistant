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
import { Trash2, Edit2, Save, X } from 'lucide-react';
import { supabaseBrowser } from '@/app/lib/supabase';
import { useAuth } from '@/app/hooks/useAuth';
import { Label } from "@/components/ui/label";
import { Layout } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

interface Dashboard {
    id: string;
    filename: string;
    displayname: string;
    category: string;
    path: string;
    submitted_by: string;
    last_updated: string;
    content: any;
}

interface ManageDashboardsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ManageDashboardsDialog = ({ open, onOpenChange }: ManageDashboardsDialogProps) => {
    const { user } = useAuth();
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const fetchDashboards = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabaseBrowser
            .from('dashboard-configs')
            .select('*')
            .eq('submitted_by', user?.email)
            .order('last_updated', { ascending: false });

        if (!error && data) {
            setDashboards(data);
        }
        setIsLoading(false);
    }, [user?.email]);

    useEffect(() => {
        if (open && user?.email) {
            fetchDashboards();
        }
    }, [open, user?.email, fetchDashboards]);

    const handleEdit = (dashboard: Dashboard) => {
        setEditingId(dashboard.id);
        setEditName(dashboard.displayname);
        setEditCategory(dashboard.category);
    };

    const handleSave = async (dashboard: Dashboard) => {
        const { error } = await supabaseBrowser
            .from('dashboard-configs')
            .update({
                category: editCategory,
                displayname: editName,
                last_updated: new Date().toISOString()
            })
            .eq('id', dashboard.id);

        if (!error) {
            await fetchDashboards();
            setEditingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabaseBrowser
            .from('dashboard-configs')
            .delete()
            .eq('id', id);

        if (!error) {
            await fetchDashboards();
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setEditingId(null);
            setEditName('');
            setEditCategory('');
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <DialogHeader className="pb-4 border-b border-blue-200 dark:border-gray-700">
                    <DialogTitle className="text-xl font-semibold text-blue-900 dark:text-gray-100">
                        Manage Dashboards
                    </DialogTitle>
                    <DialogDescription className="text-blue-700 dark:text-blue-300">
                        Manage your published dashboards. You can edit names, categories, or remove dashboards.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
                    {isLoading ? (
                        <div className="text-center py-4 text-blue-700 dark:text-blue-300">Loading...</div>
                    ) : dashboards.length === 0 ? (
                        <div className="border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-lg p-6 text-center bg-white dark:bg-gray-900">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Layout className="h-8 w-8 text-blue-400 dark:text-blue-500" />
                                <h3 className="font-medium text-blue-900 dark:text-gray-100">No Published Dashboards</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-300">
                                    Your published dashboards will appear here
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {dashboards.map((dashboard) => (
                                <div
                                    key={dashboard.id}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm"
                                >
                                    {editingId === dashboard.id ? (
                                        <div className="flex-1 flex flex-col gap-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-xs text-blue-700 dark:text-blue-300">
                                                        Display Name
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        placeholder="Display name"
                                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="category" className="text-xs text-blue-700 dark:text-blue-300">
                                                        Category
                                                    </Label>
                                                    <Input
                                                        id="category"
                                                        value={editCategory}
                                                        onChange={(e) => setEditCategory(e.target.value.replace(/,/g, ''))}
                                                        placeholder="Category"
                                                        className="bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(dashboard)}
                                                    className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                                                >
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingId(null)}
                                                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-blue-900 dark:text-gray-100">
                                                    {dashboard.displayname}
                                                </span>
                                                <span className="text-xs text-blue-700 dark:text-blue-300">
                                                    {dashboard.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEdit(dashboard)}
                                                    className="flex-1 sm:flex-initial bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200 gap-2"
                                                >
                                                    <Edit2 className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setDeleteConfirmId(dashboard.id)}
                                                    className="flex-1 sm:flex-initial bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-200 gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>

            <AlertDialog 
                open={!!deleteConfirmId} 
                onOpenChange={(open) => !open && setDeleteConfirmId(null)}
            >
                <AlertDialogContent className="bg-red-50 border-red-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Dashboard?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <div className="text-red-700">
                                    Are you sure you want to delete this dashboard configuration?
                                </div>
                                <div className="bg-white border border-red-200 rounded-lg p-3">
                                    <div className="text-sm text-red-600">
                                        This action:
                                    </div>
                                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside space-y-1">
                                        <li>Cannot be undone</li>
                                        <li>Will remove this dashboard from your dashboard list as well as the dashboard list of all users who have access to this dashboard</li>
                                        <li>Will not affect your current working configuration</li>
                                    </ul>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel 
                            className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteConfirmId(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-100 border border-red-200 text-red-700 hover:bg-red-200"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                        >
                            Delete Dashboard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
};

export default ManageDashboardsDialog; 