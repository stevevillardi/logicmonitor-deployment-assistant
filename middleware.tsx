import { createServerClient } from '@supabase/ssr'
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

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Check if path requires authentication
    const isProtectedPath = PROTECTED_PATHS.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !user && 
        !request.nextUrl.pathname.startsWith('/login') && 
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        
        const redirectResponse = NextResponse.redirect(redirectUrl)
        
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            const { name, value, ...options } = cookie
            redirectResponse.cookies.set({ name, value, ...options })
        })
        
        return redirectResponse
    }

    // Check POV access
    const povIdMatch = request.nextUrl.pathname.match(/\/(active-pov|pov)\/([^\/]+)/);
    if (povIdMatch && user) {
        const povId = povIdMatch[2];

        // Check if user is assigned to this POV
        const { data: teamMember, error } = await supabase
            .from('pov_team_members')
            .select('id')
            .eq('pov_id', povId)
            .eq('team_member_id', user.id)
            .single();

        if (error || !teamMember) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/unauthorized'
            
            const redirectResponse = NextResponse.redirect(redirectUrl)
            
            supabaseResponse.cookies.getAll().forEach((cookie) => {
                const { name, value, ...options } = cookie
                redirectResponse.cookies.set({ name, value, ...options })
            })
            
            return redirectResponse
        }
    }

    return supabaseResponse
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
}