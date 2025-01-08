import { CookieOptions, createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
    '/home',
    '/sites',
    '/overview',
    '/system',
    '/collector-info',
    '/api-explorer',
    '/device-onboarding',
    '/dashboard-explorer',
    '/video-library',
    '/pov',
    '/reports-explorer'
];

export async function middleware(request: NextRequest) {
    // Skip middleware for static files and API routes
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.includes('.') ||
        request.nextUrl.pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // Only run auth check on protected paths
    if (!PROTECTED_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Create a response object to store cookies
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    try {
        // Check auth status
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // Store the original URL to redirect back after login
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/login';
            redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }

        return response;
    } catch (error) {
        console.error('Auth middleware error:', error);
        // On error, redirect to login
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - api routes
         */
        '/((?!api|_next/static|_next/image|favicon.ico|privacy|legal).*)',
    ],
};