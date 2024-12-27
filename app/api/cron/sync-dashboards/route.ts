import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(`${process.env.VERCEL_URL}/api/dashboards/sync`, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Sync failed');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ error: 'Cron sync failed' }, { status: 500 });
  }
} 