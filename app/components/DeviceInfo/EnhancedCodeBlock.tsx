import React, { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-hcl';
import 'prismjs/components/prism-go';
interface EnhancedCodeBlockProps {
    code: string;
    language: string;
    title?: string;
    showLineNumbers?: boolean;
}

const EnhancedCodeBlock = ({ code, language, title, showLineNumbers = true }: EnhancedCodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {title && (
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                                <span className="text-green-600 dark:text-green-500">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            )}
            <div className={`relative ${showLineNumbers ? 'pl-12' : ''}`}>
                {showLineNumbers && (
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-end pr-2 pt-4 font-mono text-xs text-gray-400 dark:text-gray-500">
                        {code.split('\n').map((_, i) => (
                            <div key={i} className="leading-6">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                )}
                <pre className="p-4 bg-gray-50 dark:bg-gray-800 overflow-x-auto m-0">
                    <code className={`language-${language} dark:text-gray-100`}>
                        {code.trim()}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default EnhancedCodeBlock;