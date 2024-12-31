import { LegalDisclaimerContent } from "../components/Legal/LegalDisclaimerContent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#040F4B] to-blue-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Legal Disclaimer
                    </h1>
                    <p className="text-sm text-blue-200">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
                
                <LegalDisclaimerContent />
            </div>
        </div>
    );
} 