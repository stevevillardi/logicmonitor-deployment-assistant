import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface CodeExampleProps {
    title: string;
    language: string;
    code: string;
}

const CodeExample: React.FC<CodeExampleProps> = ({ title, language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-700">{title}</h5>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto border border-gray-200">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

const pythonCode = `# Example device creation
import requests

response = requests.post(
    "https://company.logicmonitor.com/santaba/rest/device/devices",
    headers=headers,
    json={"name": "device1.company.com"}
)`;

const terraformCode = `resource "logicmonitor_device" "host" {
    name = "device1.company.com"
    properties = {
        env = "prod"
    }
}`;

const powershellCode = `
# Create an array of device configurations
$devices = @(
    @{
        Name = "192.168.1.100"
        DisplayName = "Web Server 1"
        Description = "Production web server #1"
        Properties = @{ location = "NYC"; environment = "Production" }
        PreferredCollectorId = 1
        HostGroupIds = @(12, 15)
    },
    @{
        Name = "192.168.1.101"
        DisplayName = "Web Server 2"
        Description = "Production web server #2"
        Properties = @{ location = "LAX"; environment = "Production" }
        PreferredCollectorId = 2
        HostGroupIds = @(12, 15)
    }
)

# Create multiple devices
$devices | ForEach-Object {
    New-LMDevice @_
}
`;

const curlCode = `curl -X POST https://company.logicmonitor.com/santaba/rest/device/devices \\
     -H "Authorization: Bearer \${token}" \\
     -H "Content-Type: application/json" \\
     -d '{"name": "device1.company.com"}'`;

interface CodeSamplesProps {
    examples?: Array<{
        title: string;
        language: string;
        code: string;
    }>;
    className?: string;
}

const defaultExamples = [
    { title: 'Python', language: 'python', code: pythonCode },
    { title: 'Terraform', language: 'hcl', code: terraformCode },
    { title: 'PowerShell', language: 'powershell', code: powershellCode },
    { title: 'Curl', language: 'bash', code: curlCode },
];

const CodeSamples: React.FC<CodeSamplesProps> = ({ 
    examples = defaultExamples,
    className = "w-full"
}) => {
    return (
        <Tabs defaultValue={examples[0].language} className={className}>
            <div className="flex items-center justify-between mb-3">
                <TabsList className="bg-white border border-gray-200">
                    {examples.map((example) => (
                        <TabsTrigger
                            key={example.language}
                            value={example.language}
                            className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                        >
                            {example.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            {examples.map((example) => (
                <TabsContent
                    key={example.language}
                    value={example.language}
                    className="mt-0"
                >
                    <CodeExample
                        title={example.title}
                        language={example.language}
                        code={example.code}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
};

export { CodeSamples, CodeExample };