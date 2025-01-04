import supabase from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Get auth header from request
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No Bearer token' }, { status: 401 });
        }

        // Get user from token
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, role } = await request.json();

        // Update the user's role - RLS will handle permission checks
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ 
            message: 'User role updated successfully' 
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Failed to update user role' },
            { status: 500 }
        );
    }
} 