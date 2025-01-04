import supabase from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

        // Get all users - RLS will handle permission checks
        const { data: users, error } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                role,
                is_disabled
            `);

        if (error) throw error;

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
} 