import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/dashboards/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync failed: ${errorText}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ error: 'Cron sync failed' }, { status: 500 });
  }
} 