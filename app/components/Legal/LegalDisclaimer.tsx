import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LegalDisclaimerContent } from "./LegalDisclaimerContent"

interface LegalDisclaimerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LegalDisclaimer({ open, onOpenChange }: LegalDisclaimerProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                aria-describedby={undefined}
                className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-800 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0 border-blue-200 dark:border-gray-700"
            >
                <DialogHeader className="border-b border-blue-200 dark:border-gray-700 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-gray-100">
                        Legal Disclaimer
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-blue-400">
                        Last updated: {new Date().toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <LegalDisclaimerContent />
                </ScrollArea>

                <DialogFooter className="border-t border-blue-200 dark:border-gray-700 pt-3">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 