import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

/** Routes accessible without a session. */
const PUBLIC_PATHS = [
  '/login',
  '/auth/verify',
  '/api/auth',  // covers /api/auth/login, /api/auth/google, /api/auth/callback/google
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = verifySessionToken(token);

  if (!session) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // Inject userId into request headers so server components and route handlers
  // can call getCurrentUserId() without another DB round-trip.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.userId);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};
