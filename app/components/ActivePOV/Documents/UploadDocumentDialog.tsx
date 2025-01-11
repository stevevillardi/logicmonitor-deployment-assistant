'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { supabaseBrowser } from "@/app/lib/supabase/client";
import { usePOV } from "@/app/contexts/POVContext";
import { v4 as uuidv4 } from 'uuid';
import { usePOVOperations } from "@/app/hooks/usePOVOperations";

interface UploadDocumentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UploadDocumentDialog({ 
    open, 
    onOpenChange 
}: UploadDocumentDialogProps) {
    const { uploadDocument } = usePOVOperations();
    const { state, dispatch } = usePOV();
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        try {
            setIsUploading(true);
            await uploadDocument(file, description);
            setFile(null);
            setDescription('');
            onOpenChange(false);
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                        Upload Document
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-4">
                            {/* File Input */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <Label htmlFor="file" className="text-gray-900 dark:text-gray-100">File</Label>
                                </div>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">Description (Optional)</Label>
                                </div>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter a description for this document..."
                                    className="resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3">
                        <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="w-full sm:w-auto bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!file || isUploading}
                                className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                            >
                                {isUploading ? (
                                    'Uploading...'
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 