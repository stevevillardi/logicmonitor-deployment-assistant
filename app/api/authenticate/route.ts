import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const authPassword = process.env.AUTH_PASSWORD;

    if (!authPassword) {
      console.error('Auth password not configured');
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      );
    }

    if (password === authPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 