import { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (open && user?.email) {
            fetchDashboards();
        }
    }, [open, user?.email]);

    const fetchDashboards = async () => {
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
    };

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

    const handleDelete = async (dashboard: Dashboard) => {
        if (!confirm('Are you sure you want to delete this dashboard?')) return;

        const { error } = await supabaseBrowser
            .from('dashboard-configs')
            .delete()
            .eq('id', dashboard.id);

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
            <DialogContent className="max-w-2xl bg-blue-50 border-blue-200">
                <DialogHeader className="pb-4 border-b border-blue-200">
                    <DialogTitle className="text-xl font-semibold text-blue-900">
                        Manage Dashboards
                    </DialogTitle>
                    <DialogDescription className="text-blue-700">
                        Manage your published dashboards. You can edit names, categories, or remove dashboards.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
                    {isLoading ? (
                        <div className="text-center py-4 text-blue-700">Loading...</div>
                    ) : dashboards.length === 0 ? (
                        <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-white">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Layout className="h-8 w-8 text-blue-400" />
                                <h3 className="font-medium text-blue-900">No Published Dashboards</h3>
                                <p className="text-sm text-blue-600">
                                    Your published dashboards will appear here
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {dashboards.map((dashboard) => (
                                <div
                                    key={dashboard.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 shadow-sm"
                                >
                                    {editingId === dashboard.id ? (
                                        <div className="flex-1 flex flex-col gap-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-xs text-blue-700">
                                                        Display Name
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        placeholder="Display name"
                                                        className="bg-white border-blue-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="category" className="text-xs text-blue-700">
                                                        Category
                                                    </Label>
                                                    <Input
                                                        id="category"
                                                        value={editCategory}
                                                        onChange={(e) => setEditCategory(e.target.value.replace(/,/g, ''))}
                                                        placeholder="Category"
                                                        className="bg-white border-blue-200"
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
                                                    className="bg-white hover:bg-gray-50"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-blue-900">
                                                    {dashboard.displayname}
                                                </span>
                                                <span className="text-xs text-blue-700">
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
                                                    onClick={() => handleDelete(dashboard)}
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
        </Dialog>
    );
};

export default ManageDashboardsDialog; 