import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  // Get session from cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token')?.value;
  
  const supabase = await createClient();

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const povData = {
      ...json,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('pov')
      .insert(povData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token')?.value;
  const supabase = await createClient();
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const baseQuery = supabase.from('pov').select(`
      *,
      key_business_services:pov_key_business_services(*),
      challenges:pov_challenges(*),
      decision_criteria:pov_decision_criteria(*),
      working_sessions:pov_working_sessions(*),
      team_members:pov_team_members(*)
    `);

    const { data, error } = await (id 
      ? baseQuery.eq('id', id).single()
      : baseQuery
    );

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 