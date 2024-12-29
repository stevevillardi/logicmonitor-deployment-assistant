import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useDeploymentsContext } from '@/app/contexts/DeploymentsContext'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Trash2, Save, Clock, Server, Info, MessageSquare, Activity, ChevronDown, ChevronRight, Network, Pencil, AlertTriangle } from 'lucide-react'
import { useState } from "react"
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

interface ManageDeploymentsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageDeploymentsDialog({ open, onOpenChange }: ManageDeploymentsDialogProps) {
    const { deployments, isLoading, updateDeployment, deleteDeployment } = useDeploymentsContext()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [expandedDeployments, setExpandedDeployments] = useState<Set<string>>(new Set())
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
                    className="max-w-[95vw] w-full lg:max-w-4xl bg-blue-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="border-b border-blue-100 pb-3">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B]">
                            Manage Deployments
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Rename or delete your saved deployment configurations
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
                            </div>
                        ) : deployments.length === 0 ? (
                            <div className="bg-white border border-blue-200 rounded-lg p-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Info className="w-6 h-6 text-blue-700" />
                                    </div>
                                </div>
                                <h3 className="text-gray-900 font-medium mb-2">No Saved Deployments</h3>
                                <p className="text-sm text-gray-600">
                                    You haven&apos;t saved any deployments yet. Save your current configuration to access it later.
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-3">
                                    {deployments.map((deployment) => (
                                        <div 
                                            key={deployment.id}
                                            className="bg-white border border-blue-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <button
                                                        onClick={() => toggleDeployment(deployment.id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                                            <Building2 className="w-4 h-4 text-blue-700" />
                                                        </div>
                                                        {expandedDeployments.has(deployment.id) ? (
                                                            <ChevronDown className="w-4 h-4 text-blue-700" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-blue-700" />
                                                        )}
                                                    </button>
                                                    
                                                    {editingId === deployment.id ? (
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <Input
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                className="flex-1 bg-white border-blue-200"
                                                                autoFocus
                                                            />
                                                            <Button
                                                                onClick={() => handleSave(deployment.id)}
                                                                className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                                                                size="sm"
                                                            >
                                                                <Save className="w-4 h-4" /> Save
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-gray-900">
                                                                {deployment.name}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDate(deployment.updated_at)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {editingId !== deployment.id && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            onClick={() => {
                                                                setEditingId(deployment.id);
                                                                setEditName(deployment.name);
                                                            }}
                                                            className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200 gap-2"
                                                            size="sm"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                            <span>Rename</span>
                                                        </Button>
                                                        <Button
                                                            onClick={() => setDeleteConfirmId(deployment.id)}
                                                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-200 gap-2"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {expandedDeployments.has(deployment.id) && (
                                                <div className="mt-4 space-y-3">
                                                    {deployment.sites.map((site, index) => (
                                                        <div 
                                                            key={index}
                                                            className="bg-gray-50 border border-gray-100 rounded-lg p-3 hover:bg-gray-100/50 transition-colors"
                                                        >
                                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2 min-w-[150px]">
                                                                    <Server className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                                                    <h4 className="font-medium text-gray-900 truncate">
                                                                        {site.name || `Site ${index + 1}`}
                                                                    </h4>
                                                                </div>
                                                                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3">
                                                                    <div className="px-3 py-1.5 bg-blue-50 rounded-full flex items-center gap-2 whitespace-nowrap">
                                                                        <Server className="w-4 h-4 flex-shrink-0 text-blue-600" />
                                                                        <span className="text-blue-700 text-sm font-medium">
                                                                            {Object.values(site.devices).reduce((sum, device) => 
                                                                                sum + (device.count || 0), 0
                                                                            ).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="px-3 py-1.5 bg-emerald-50 rounded-full flex items-center gap-2 whitespace-nowrap">
                                                                        <MessageSquare className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                                                                        <span className="text-emerald-700 text-sm font-medium">
                                                                            {(site.logs?.events?.eps || 0).toLocaleString()} EPS
                                                                        </span>
                                                                    </div>
                                                                    <div className="px-3 py-1.5 bg-cyan-50 rounded-full flex items-center gap-2 whitespace-nowrap">
                                                                        <Activity className="w-4 h-4 flex-shrink-0 text-cyan-600" />
                                                                        <span className="text-cyan-700 text-sm font-medium">
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