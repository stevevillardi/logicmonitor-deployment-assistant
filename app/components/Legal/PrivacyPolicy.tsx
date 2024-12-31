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
import { PrivacyPolicyContent } from "./PrivacyPolicyContent"

interface PrivacyPolicyProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicy({ open, onOpenChange }: PrivacyPolicyProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                aria-describedby={undefined}
                className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
            >
                <DialogHeader className="border-b border-blue-100 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B]">
                        Privacy Policy
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Last updated: {new Date().toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <PrivacyPolicyContent />
                </ScrollArea>

                <DialogFooter className="border-t border-blue-100 pt-3">
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