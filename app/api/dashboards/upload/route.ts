import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
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

        const { dashboard, category, displayname } = await request.json();

        // Basic validation
        if (!dashboard || !dashboard.name || !dashboard.widgets) {
            return NextResponse.json(
                { error: 'Invalid dashboard format' }, 
                { status: 400 }
            );
        }

        // Create filename from dashboard name
        const filename = `${dashboard.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;

        try {
            // Insert into database
            const { error: insertError } = await supabase
                .from('dashboard-configs')
                .insert({
                    category: category || 'Community',
                    filename,
                    displayname: displayname,
                    path: `Community/${filename}`,
                    content: dashboard,
                    submitted_by: user.email,
                    last_updated: new Date().toISOString()
                });

            if (insertError) {
                return NextResponse.json(
                    { error: `Database insert failed: ${insertError.message}` }, 
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true });
        } catch (dbError) {
            return NextResponse.json(
                { error: 'Database operation failed' }, 
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload dashboard' }, 
            { status: 500 }
        );
    }
} 