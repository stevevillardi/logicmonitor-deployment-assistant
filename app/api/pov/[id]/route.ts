import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const json = await request.json();
    const updateData = {
      ...json,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('pov')
      .update(updateData)
      .eq('id', params.id)
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token')?.value;
  const supabase = await createClient();
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('pov')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 