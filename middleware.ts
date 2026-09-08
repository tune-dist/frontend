import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is enforced client-side (AuthContext + ProtectedRoute).
// Server middleware cannot reliably read js-cookie session state on every
// refresh, so we do not redirect here — avoids false logouts on hard refresh.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
