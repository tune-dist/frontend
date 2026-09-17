import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DIGILOCKER_CALLBACK_PATH,
  isDigilockerReturnQuery,
} from '@/lib/digilocker-return';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === '/' && isDigilockerReturnQuery(searchParams)) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = DIGILOCKER_CALLBACK_PATH;
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
