'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input, Button } from "@/components/ui/enhanced-components";
import { Lock, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginPageProps {
    onLogin: (isAuthenticated: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const authPassword = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

        if (!authPassword) {
            console.error('Authentication password not set in environment variables');
            setError(true);
            return;
        }

        if (password === authPassword) {
            onLogin(true);
            localStorage.setItem('isAuthenticated', 'true');
        } else {
            setError(true);
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
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                        >
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage; 