import { Info, AlertTriangle, Wrench } from 'lucide-react'

export function LegalDisclaimerContent() {
    return (
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
    );
} 