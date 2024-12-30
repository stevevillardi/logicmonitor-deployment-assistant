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
import { Info, AlertTriangle, Wrench } from 'lucide-react'

interface LegalDisclaimerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LegalDisclaimer({ open, onOpenChange }: LegalDisclaimerProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                aria-describedby={undefined}
                className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
            >
                <DialogHeader className="border-b border-blue-100 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B]">
                        Legal Disclaimer
                    </DialogTitle>
                    <DialogDescription id="legal-disclaimer-description" className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6 py-3">
                        <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-4">
                            <div className="space-y-4">
                                <section className="space-y-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-blue-600" />
                                        Community Tool
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        The LM Deployment Assistant is an unofficial tool and is not affiliated with, endorsed by, or connected to LogicMonitor, Inc. It is provided as a community tool for informational purposes only.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-600" />
                                        No Warranty
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        This tool is provided &quot;as is&quot; without any warranties of any kind. The calculations and recommendations provided are estimates only and should not be solely relied upon for production deployments.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-600" />
                                        Third-Party Services
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        This application uses third-party services including Supabase, Vercel Analytics, and OAuth providers. Usage of these services is subject to their respective terms and conditions.
                                    </p>
                                </section>
                            </div>
                        </div>

                        <div className="bg-white border border-blue-100 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-gray-900">
                                        Important considerations:
                                    </h4>
                                    <ul className="text-sm space-y-2 text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <span>All recommendations are estimates only</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <span>Always validate configurations in your environment</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <span>Consult official LogicMonitor documentation</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <span>Test thoroughly before production deployment</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
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