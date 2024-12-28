'use client';
import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { supabaseBrowser } from '../../lib/supabase';

const LoginPage = () => {
    const supabase = supabaseBrowser;
    
    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                console.error('Authentication error:', error);
            }
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#040F4B] to-blue-900">
            <div className="w-full max-w-md px-4">
                <Card className="w-full shadow-2xl border-0">
                    <CardHeader className="space-y-6 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white p-8 rounded-t-xl">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-[#040F4B]" />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#040F4B] to-blue-600 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                            <p className="text-sm text-gray-500">
                                Sign in to access the Deployment Assistant
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <Button
                            onClick={() => handleOAuthSignIn('google')}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200 py-6 text-base font-medium"
                        >
                            <FcGoogle className="w-6 h-6" />
                            Continue with Google
                        </Button>
                        <Button
                            onClick={() => handleOAuthSignIn('github')}
                            className="w-full flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2f363d] text-white border-0 shadow-sm transition-all duration-200 py-6 text-base font-medium"
                        >
                            <FaGithub className="w-6 h-6" />
                            Continue with GitHub
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-6">
                            Deployment Assistant is a community project and is not affiliated with LogicMonitor.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage; 