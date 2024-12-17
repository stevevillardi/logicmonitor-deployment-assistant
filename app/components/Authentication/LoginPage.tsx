'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input, Button } from "@/components/ui/enhanced-components";
import { Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginPageProps {
    onLogin: (isAuthenticated: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        try {
            const response = await fetch('/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                onLogin(true);
                localStorage.setItem('isAuthenticated', 'true');
            } else {
                setError(true);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-4 flex flex-col items-center bg-blue-50 border-b border-blue-200 p-6">
                    <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#040F4B] to-blue-600 bg-clip-text text-transparent">
                        Deployment Assistant
                    </span>
                    <div className="flex items-center gap-2">
                        <Lock className="w-6 h-6 text-[#040F4B]" />
                        <h2 className="text-2xl font-bold text-[#040F4B]">Authentication Required</h2>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="py-2 border-red-200 bg-red-50">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-800" />
                                    <AlertDescription className="text-sm text-red-800">
                                        Invalid password. Please try again.
                                    </AlertDescription>
                                </div>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                className={error ? 'border-red-500 ring-red-500' : ''}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage; 