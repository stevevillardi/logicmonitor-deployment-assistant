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
import { Info, Shield, Key, BarChart, Database } from 'lucide-react'

interface PrivacyPolicyProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicy({ open, onOpenChange }: PrivacyPolicyProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                aria-describedby={undefined} className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0"
            >
                <DialogHeader className="border-b border-blue-100 pb-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B]">
                        Privacy Policy
                    </DialogTitle>
                    <DialogDescription id="privacy-policy-description" className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleDateString()} 
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6 py-3">
                        {/* Main content card */}
                        <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-4">
                            <div className="space-y-4">
                                <section className="space-y-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        Overview
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        The LogicMonitor Deployment Assistant does not collect, store, or process any personal information beyond what is necessary for basic functionality.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Key className="w-4 h-4 text-blue-600" />
                                        Authentication
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        We use Supabase for authentication through Google and GitHub OAuth. When you sign in, only basic profile information (name, email, avatar) is stored for authentication purposes.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <BarChart className="w-4 h-4 text-blue-600" />
                                        Analytics
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        We use Vercel Analytics to collect anonymous usage data to improve the application. This data cannot be used to identify individual users.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Database className="w-4 h-4 text-blue-600" />
                                        Local Storage
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        If you choose to install the PWA version, some data may be stored locally on your device for offline functionality. This data never leaves your device.
                                    </p>
                                </section>
                            </div>
                        </div>

                        {/* Contact information box */}
                        <div className="bg-white border border-blue-100 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-gray-900">
                                        For any privacy-related questions, you can:
                                    </h4>
                                    <ul className="text-sm space-y-2 text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <span>Visit our GitHub repository</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <span>Open an issue for discussion</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <span>Contact the repository maintainers</span>
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