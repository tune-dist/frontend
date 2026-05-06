import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const blockedPrefixes = [
    '/auth',
    '/dashboard',
    '/checkout',
    '/upload',
    '/p',
    '/test-connection',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isBlocked = blockedPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );

    if (isBlocked) {
        const url = request.nextUrl.clone();
        url.pathname = '/coming-soon';
        url.search = '';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/auth/:path*',
        '/dashboard/:path*',
        '/checkout/:path*',
        '/upload/:path*',
        '/p/:path*',
        '/test-connection/:path*',
    ],
};
