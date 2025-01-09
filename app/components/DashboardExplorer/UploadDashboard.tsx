import { useState, memo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Info, Check, X, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { devError } from '../Shared/utils/debug';

interface UploadDashboardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface UploadStatus {
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    filename?: string;
}

const validateDashboardJson = (dashboard: any): { isValid: boolean; error?: string } => {
    try {
        // Required top-level fields
        const requiredFields = ['name', 'type', 'widgets', 'version'];
        for (const field of requiredFields) {
            if (!dashboard[field]) {
                return { 
                    isValid: false, 
                    error: `Missing required field: ${field}` 
                };
            }
        }

        // Validate dashboard type
        if (dashboard.type !== 'dashboard') {
            return { 
                isValid: false, 
                error: 'Invalid dashboard type. Must be "dashboard"' 
            };
        }

        // Validate version
        if (typeof dashboard.version !== 'number') {
            return { 
                isValid: false, 
                error: 'Version must be a number' 
            };
        }

        // Validate widgets array
        if (!Array.isArray(dashboard.widgets)) {
            return { 
                isValid: false, 
                error: 'Widgets must be an array' 
            };
        }

        // Validate each widget
        for (const [index, widget] of dashboard.widgets.entries()) {
            if (!widget.config || !widget.position) {
                return { 
                    isValid: false, 
                    error: `Widget at index ${index} missing config or position` 
                };
            }

            // Validate widget position
            const positionFields = ['col', 'row', 'sizex', 'sizey'];
            for (const field of positionFields) {
                if (typeof widget.position[field] !== 'number') {
                    return { 
                        isValid: false, 
                        error: `Widget at index ${index} has invalid position.${field}` 
                    };
                }
            }

            // Validate widget config
            if (!widget.config.name || !widget.config.type) {
                return { 
                    isValid: false, 
                    error: `Widget at index ${index} missing name or type` 
                };
            }
        }

        return { isValid: true };
    } catch (error) {
        return { 
            isValid: false, 
            error: 'Invalid JSON format or unexpected error during validation' 
        };
    }
};

const UploadDashboardComponent = ({ open, onOpenChange }: UploadDashboardProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('Community');
    const [displayname, setDisplayname] = useState('');
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'pending' });

    // Reset state when dialog closes
    const handleDialogChange = (open: boolean) => {
        if (!open) {
            setFile(null);
            setCategory('Community');
            setDisplayname('');
            setUploadStatus({ status: 'pending' });
            setIsUploading(false);

            const fileInput = document.getElementById('file') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        }
        onOpenChange(open);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFile(file);
            setUploadStatus({ status: 'pending' });

            // Parse the file to get the dashboard name
            try {
                const content = await file.text();
                const dashboard = JSON.parse(content);
                if (dashboard.name) {
                    // Format the name: replace underscores/hyphens with spaces
                    const formattedName = dashboard.name
                        .replace(/[_-]/g, ' ')
                        .replace(/\b\w/g, (c: string) => c.toUpperCase()); // Capitalize first letter of each word
                    setDisplayname(formattedName);
                }
            } catch (error) {
                devError('Error parsing dashboard file:', error);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadStatus({ status: 'uploading', filename: file.name });
            
            const { data: { session }, error: sessionError } = await supabaseBrowser.auth.getSession();
            if (sessionError || !session?.access_token) {
                throw new Error('Authentication required');
            }

            if (category.includes(',')) {
                setUploadStatus({ 
                    status: 'error', 
                    error: 'Category cannot contain commas',
                    filename: file.name 
                });
                return;
            }

            const fileContent = await file.text();
            const dashboard = JSON.parse(fileContent);

            const validation = validateDashboardJson(dashboard);
            if (!validation.isValid) {
                setUploadStatus({ 
                    status: 'error', 
                    error: validation.error,
                    filename: file.name 
                });
                return;
            }

            const response = await fetch('/api/dashboards/upload', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ 
                    dashboard, 
                    category: category.trim(),
                    displayname: displayname.trim() || dashboard.name // Use displayname if set, fallback to dashboard.name
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            setUploadStatus({ 
                status: 'success', 
                filename: dashboard.name 
            });

            // Reset form but don't close dialog on success
            setFile(null);
            setCategory('Community');
        } catch (error) {
            setUploadStatus({ 
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
                filename: file.name
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent 
                className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
            >
                <DialogHeader className="border-b border-blue-100 dark:border-gray-700 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                        Upload Dashboard
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-blue-300">
                        Share your custom dashboard with the community
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm p-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="file" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Dashboard JSON File
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileChange}
                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-gray-600 text-left"
                                />
                                {uploadStatus.filename && (
                                    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            {uploadStatus.filename}
                                        </div>
                                        <div className="flex-shrink-0">
                                            {uploadStatus.status === 'uploading' && (
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                            )}
                                            {uploadStatus.status === 'success' && (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                            {uploadStatus.status === 'error' && (
                                                <div className="flex items-center gap-1">
                                                    <X className="w-5 h-5 text-red-500" />
                                                    <TooltipProvider delayDuration={0}>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent 
                                                                side="left" 
                                                                sideOffset={5}
                                                                className="bg-gray-900 text-white border-none shadow-lg"
                                                            >
                                                                {uploadStatus.error}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayname" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Display Name
                                </Label>
                                <Input
                                    id="displayname"
                                    value={displayname}
                                    onChange={(e) => setDisplayname(e.target.value)}
                                    placeholder="Enter display name"
                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Category
                                </Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/,/g, '');
                                        setCategory(value);
                                    }}
                                    placeholder="e.g., Netapp"
                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex gap-2 text-sm text-blue-700 dark:text-blue-300">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="mb-2">
                                    Before uploading, please ensure your dashboard:
                                </p>
                                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-disc list-inside pl-1">
                                    <li>Is a valid LogicMonitor dashboard JSON export</li>
                                    <li>Does not contain sensitive information</li>
                                    <li>Is properly formatted and tested</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-blue-100 dark:border-gray-700 pt-3">
                    <Button
                        variant="outline"
                        onClick={() => handleDialogChange(false)}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                    >
                        {uploadStatus.status === 'success' ? 'Close' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading || uploadStatus.status === 'success'}
                        className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Dashboard
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const UploadDashboard = memo(UploadDashboardComponent); 