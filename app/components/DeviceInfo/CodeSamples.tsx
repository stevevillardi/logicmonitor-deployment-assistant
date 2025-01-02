import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EnhancedCodeBlock from './EnhancedCodeBlock';
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
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</h5>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
            <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

const pythonCode = `
import logicmonitor_sdk
from logicmonitor_sdk.rest import ApiException

def add_device():
    # Configure API authentication
    configuration = logicmonitor_sdk.Configuration()
    configuration.company = 'your_company'
    configuration.access_id = 'your_access_id'
    configuration.access_key = 'your_access_key'

    # Create API instance
    api_instance = logicmonitor_sdk.LMApi(logicmonitor_sdk.ApiClient(configuration))

    # Create device with minimal required fields
    device = logicmonitor_sdk.models.Device(
        display_name="My Test Device",          # How device appears in UI
        name="test-device-01",                  # System name for the device
        preferred_collector_id=1,               # Replace with your collector ID
        description="Test device description"   # Optional but recommended
    )

    try:
        # Add the device
        response = api_instance.add_device(device)
        print("Device added successfully:", response)
    except ApiException as e:
        print(f"Error adding device: {e}\n")

if __name__ == "__main__":
    add_device()
`;

const terraformCode = `resource "logicmonitor_device" "host" {
    name = "device1.company.com"
    properties = {
        env = "prod"
    }
}`;

const powershellCode = `
#Connect to LogicMonitor
Connect-LM -AccessID $accessID -AccessKey $accessKey -AccountName $accountDomain

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

const goCode = `
package main

import (
    "fmt"
    "github.com/logicmonitor/lm-sdk-go/client"
    "github.com/logicmonitor/lm-sdk-go/client/lm"
    "github.com/logicmonitor/lm-sdk-go/models"
)

func main() {
    // Configure API client
    domain := "yourcompany.logicmonitor.com"
    accessID := "your_access_id"
    accessKey := "your_access_key"

    // Create client configuration
    config := client.NewConfig()
    config.SetAccountDomain(&domain)
    config.SetAccessID(&accessID)
    config.SetAccessKey(&accessKey)

    // Initialize client
    client := client.New(config)

    // Create new device parameters
    params := lm.NewAddDeviceParams()
    
    // Create device body with minimal required fields
    device := &models.Device{
        DisplayName:          "My Test Device",
        Name:                "test-device-01",
        PreferredCollectorID: 1,  // Replace with your collector ID
    }
    
    // Assign device to parameters
    params.Body = device

    // Add the device
    resp, err := client.LM.AddDevice(params)
    if err != nil {
        fmt.Printf("Error creating device: %v\n", err)
        return
    }

    fmt.Printf("Device created successfully: %v\n", resp)
}
`;

const curlCode = `curl -X POST https://company.logicmonitor.com/santaba/rest/device/devices \\
     -H "Authorization: Bearer \${token}" \\
     -H "Content-Type: application/json" \\
     -d '{"name": "device1.company.com"}'`;

interface CodeSamplesProps {
    examples?: Array<{
        key: string;
        title: string;
        language: string;
        code: string;
    }>;
    className?: string;
}

const defaultExamples = [
    { title: 'Python', language: 'python', code: pythonCode , key: 'python' },
    { title: 'Go', language: 'go', code: goCode , key: 'go' },
    { title: 'Terraform', language: 'hcl', code: terraformCode , key: 'terraform' },
    { title: 'PowerShell', language: 'powershell', code: powershellCode , key: 'powershell' },
    { title: 'Curl', language: 'bash', code: curlCode , key: 'curl' },
];

const CodeSamples: React.FC<CodeSamplesProps> = ({ 
    examples = defaultExamples,
    className = "w-full"
}) => {
    return (
        <Tabs defaultValue={examples[0].language} className={className}>
            <div className="flex items-center justify-between mb-3">
                <TabsList className="bg-white dark:text-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {examples.map((example) => (
                        <TabsTrigger
                            key={example.language}
                            value={example.language}
                            className="px-4 py-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300"
                        >
                            {example.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            {examples.map((example) => (
                <TabsContent
                    key={example.key}
                    value={example.language}
                    className="mt-0 dark:bg-gray-800"
                >
                    <EnhancedCodeBlock
                        title={example.title}
                        language={example.language}
                        code={example.code}
                        showLineNumbers={true}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
};

export { CodeSamples, CodeExample };