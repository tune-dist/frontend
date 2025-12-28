import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config } from './lib/config';

// Define protected routes
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get(config.tokenKey)?.value;
    const { pathname } = request.nextUrl;

    // Check if the requested path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // If it's a protected route and no token exists, redirect to login
    if (isProtectedRoute && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        url.searchParams.set('redirect', pathname); // Optional: preserve redirect
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const configMiddleware = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth (authentication routes)
         */
        '/dashboard/:path*',
    ],
};
