import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of valid paths that should be handled by the app
const VALID_PATHS = [
    '/',
    '/overview',
    '/system',
    '/collector-info',
    '/api-explorer',
    '/device-onboarding',
    '/portal-reports'
];

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // If the path is in our list of valid paths, let it through
    if (VALID_PATHS.includes(path)) {
        return NextResponse.next();
    }

    // If not a valid path, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
    matcher: [
        '/',
        '/overview',
        '/system',
        '/collector-info',
        '/api-explorer',
        '/device-onboarding',
        '/portal-reports'
    ],
}