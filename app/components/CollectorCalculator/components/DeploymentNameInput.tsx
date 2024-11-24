import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';

interface DeploymentNameInputProps {
    value: string;
    onChange: (name: string) => void;
}

const DeploymentNameInput = ({ value, onChange }: DeploymentNameInputProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <Label className="text-lg font-medium text-gray-900">
                    Deployment Name
                </Label>
            </div>
            <div className="relative">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter deployment name..."
                    className="bg-white border-gray-200 focus:border-blue-700"
                />
            </div>
        </div>
    );
};

export default DeploymentNameInput;