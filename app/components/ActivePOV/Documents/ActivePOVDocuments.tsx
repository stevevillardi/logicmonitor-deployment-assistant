'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    Download,
    Trash2,
    File,
    Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '@/app/lib/utils';
import { useState } from 'react';
import { POVDocument } from '@/app/types/pov';
import UploadDocumentDialog from '@/app/components/ActivePOV/Documents/UploadDocumentDialog';
import { usePOVOperations } from '@/app/hooks/usePOVOperations';

export default function ActivePOVDocuments() {
    const { state } = usePOV();
    const { pov } = state;
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { downloadDocument, deleteDocument } = usePOVOperations();

    if (!pov) return null;

    const handleDownload = async (doc: POVDocument) => {
        try {
            setIsLoading(true);
            const { data, document: downloadedDoc } = await downloadDocument(doc.id);

            // Create a download link
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadedDoc.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (doc: POVDocument) => {
        try {
            setIsLoading(true);
            await deleteDocument(doc.id);
        } catch (error) {
            console.error('Error deleting document:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Documents
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage supporting documents and files
                    </p>
                </div>
                <Button 
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                </Button>
            </div>

            {/* Documents List */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                    {(pov.documents?.length ?? 0) > 0 ? (
                        (pov.documents ?? []).map((document) => (
                            <div 
                                key={document.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 
                                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                        <File className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                            {document.name}
                                        </h4>
                                        {document.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                {document.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatBytes(document.file_size)}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                by {document.created_by_email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                        onClick={() => handleDownload(document)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        onClick={() => handleDelete(document)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No documents</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Upload documents to share with the team
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            <UploadDocumentDialog 
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
            />
        </div>
    );
} 