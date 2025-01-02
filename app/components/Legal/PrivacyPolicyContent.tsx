import { Shield, Key, BarChart, Database, Info } from 'lucide-react'

export function PrivacyPolicyContent() {
    return (
        <div className="space-y-6 py-3">
            {/* Main content card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm p-4">
                <div className="space-y-4">
                    <section className="space-y-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Overview
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            The LM Deployment Assistant does not collect, store, or process any personal information beyond what is necessary for basic functionality.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Authentication
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            We use Supabase for authentication through Google and GitHub OAuth. When you sign in, only basic profile information (name, email, avatar) is stored for authentication purposes.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <BarChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            We use Vercel Analytics to collect anonymous usage data to improve the application. This data cannot be used to identify individual users.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Local Storage
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            If you choose to install the PWA version, some data may be stored locally on your device for offline functionality. This data never leaves your device.
                        </p>
                    </section>
                </div>
            </div>

            {/* Contact information box */}
            <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            For any privacy-related questions, you can:
                        </h4>
                        <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
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
    );
} 