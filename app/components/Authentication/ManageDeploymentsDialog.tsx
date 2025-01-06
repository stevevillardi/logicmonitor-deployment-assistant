import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useDeploymentsContext } from '@/app/contexts/DeploymentsContext'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Trash2, Save, Clock, Server, Info, MessageSquare, Activity, ChevronDown, ChevronRight, Network, Pencil, AlertTriangle, Folder, Edit2, X } from 'lucide-react'
import { useState, useEffect } from "react"
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
import { Label } from "@/components/ui/label"

interface ManageDeploymentsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageDeploymentsDialog({ open, onOpenChange }: ManageDeploymentsDialogProps) {
    const { deployments, isLoading, fetchDeployments, updateDeployment, deleteDeployment } = useDeploymentsContext();
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [expandedDeployments, setExpandedDeployments] = useState<Set<string>>(new Set())
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchDeployments();
        }
    }, [open, fetchDeployments]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setEditingId(null);
            setEditName('');
        }
        onOpenChange(open);
    };

    const handleSave = async (id: string) => {
        const deployment = deployments.find(d => d.id === id)
        if (!deployment) return

        try {
            await updateDeployment(id, editName, deployment.config, deployment.sites)
            setEditingId(null)
            setEditName('')
        } catch (error) {
            console.error('Failed to update deployment:', error)
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const toggleDeployment = (id: string) => {
        const newExpanded = new Set(expandedDeployments)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedDeployments(newExpanded)
    }

    const handleDelete = async (id: string) => {
        await deleteDeployment(id);
        setDeleteConfirmId(null);
    };

    return (
        <>
            <Dialog 
                open={open} 
                onOpenChange={handleOpenChange}
            >
                <DialogContent 
                    className="max-w-[95vw] w-full lg:max-w-4xl bg-blue-50 dark:bg-gray-800 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                            Manage Deployments
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
                            Rename or delete your saved deployment configurations
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 dark:border-blue-400" />
                            </div>
                        ) : deployments.length === 0 ? (
                            <div className="border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-lg p-6 text-center bg-white dark:bg-gray-900">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Folder className="h-8 w-8 text-blue-400 dark:text-blue-500" />
                                    <h3 className="font-medium text-blue-900 dark:text-gray-100">No Saved Deployments</h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-300">
                                        Your saved deployments will appear here
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-3">
                                    {deployments.map((deployment) => (
                                        <div 
                                            key={deployment.id}
                                            className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleDeployment(deployment.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-700 flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    </div>
                                                    {expandedDeployments.has(deployment.id) ? (
                                                        <ChevronDown className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-blue-700" />
                                                    )}
                                                </button>
                                                
                                                {editingId === deployment.id ? (
                                                    <div className="flex-1 flex flex-col gap-4">
                                                        <div className="flex flex-col sm:flex-row items-start gap-4">
                                                            <div className="flex-1">
                                                                <Label htmlFor="name" className="text-xs text-blue-700 dark:text-blue-300">
                                                                    Deployment Name
                                                                </Label>
                                                                <Input
                                                                    id="name"
                                                                    value={editName}
                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                    placeholder="Enter deployment name"
                                                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:mt-[22px]">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSave(deployment.id)}
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
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-blue-900 dark:text-gray-100">
                                                                {deployment.name}
                                                            </span>
                                                            <span className="text-xs text-blue-700 dark:text-blue-300">
                                                                Last updated: {new Date(deployment.updated_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <Button
                                                                onClick={() => {
                                                                    setEditingId(deployment.id);
                                                                    setEditName(deployment.name);
                                                                }}
                                                                className="flex-1 sm:flex-initial bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200 gap-2"
                                                            >
                                                                <Edit2 className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                onClick={() => setDeleteConfirmId(deployment.id)}
                                                                className="flex-1 sm:flex-initial bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-200 gap-2"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-1" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {expandedDeployments.has(deployment.id) && (
                                                <div className="mt-4 space-y-3 border-t border-blue-100 pt-4">
                                                    {deployment.sites.map((site, index) => (
                                                        <div 
                                                            key={index}
                                                            className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                                        >
                                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2 min-w-[150px]">
                                                                    <Server className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                        {site.name || `Site ${index + 1}`}
                                                                    </h4>
                                                                </div>
                                                                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3">
                                                                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center gap-2 whitespace-nowrap">
                                                                        <Server className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                                                        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                                                                            {Object.values(site.devices).reduce((sum, device) => 
                                                                                sum + (device.count || 0), 0
                                                                            ).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center gap-2 whitespace-nowrap">
                                                                        <MessageSquare className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                                        <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                                                                            {(site.logs?.events?.eps || 0).toLocaleString()} EPS
                                                                        </span>
                                                                    </div>
                                                                    <div className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 rounded-full flex items-center gap-2 whitespace-nowrap">
                                                                        <Activity className="w-4 h-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
                                                                        <span className="text-cyan-700 dark:text-cyan-300 text-sm font-medium">
                                                                            {(site.logs?.netflow?.fps || 0).toLocaleString()} FPS
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog 
                open={!!deleteConfirmId} 
                onOpenChange={(open) => !open && setDeleteConfirmId(null)}
            >
                <AlertDialogContent className="bg-red-50 border-red-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Deployment?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <div className="text-red-700">
                                    Are you sure you want to delete this deployment configuration?
                                </div>
                                <div className="bg-white border border-red-200 rounded-lg p-3">
                                    <div className="text-sm text-red-600">
                                        This action:
                                    </div>
                                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside space-y-1">
                                        <li>Cannot be undone</li>
                                        <li>Will remove all saved configuration data</li>
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
                            Delete Deployment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default ManageDeploymentsDialog;