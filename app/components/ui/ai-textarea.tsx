import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Undo2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onValueChange: (value: string) => void;
    label?: string;
    error?: string;
    reason?: string;
}

export function AITextarea({ 
    value, 
    onValueChange, 
    label, 
    error,
    reason,
    className,
    ...props 
}: AITextareaProps) {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhanceError, setEnhanceError] = useState<string | null>(null);
    const [previousValue, setPreviousValue] = useState<string | null>(null);

    const handleEnhance = async () => {
        if (!value || typeof value !== 'string') return;
        
        try {
            setIsEnhancing(true);
            setEnhanceError(null);
            setPreviousValue(value);

            const response = await fetch('/api/enhance-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    content: value,
                    reason: reason || 'general'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to enhance text');
            }

            const data = await response.json();
            onValueChange(data.enhancedText);
        } catch (err) {
            console.error('Error enhancing text:', err);
            setEnhanceError('Failed to enhance text. Please try again.');
            setPreviousValue(null);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleUndo = () => {
        if (previousValue !== null) {
            onValueChange(previousValue);
            setPreviousValue(null);
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {label}
                    </span>
                    <div className="flex gap-2">
                        {previousValue !== null && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleUndo}
                                className="h-7 px-2 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                                <Undo2 className="h-3 w-3 mr-1" />
                                Undo
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleEnhance}
                            disabled={isEnhancing || !value}
                            className="h-7 px-2 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                            {isEnhancing ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                                <Sparkles className="h-3 w-3 mr-1" />
                            )}
                            Enhance with AI
                        </Button>
                    </div>
                </div>
            )}
            <Textarea
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className={className}
                {...props}
            />
            {(error || enhanceError) && (
                <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                        {error || enhanceError}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
} 