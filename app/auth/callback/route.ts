import { CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Use request origin for development, NEXT_PUBLIC_BASE_URL for production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment ? requestUrl.origin : process.env.NEXT_PUBLIC_BASE_URL;

  if (code) {
    const response = NextResponse.redirect(new URL('/home', baseUrl));
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL('/login', baseUrl));
    }

    return response;
  }

  return NextResponse.redirect(new URL('/login', baseUrl));
} 