/**
 * Next.js Middleware — route protection.
 *
 * - Public: /login, /api/auth/*, /api/health, static assets
 * - Protected: everything else (requires JWT session)
 * - Logged-in users visiting /login → redirect to /
 */

import { auth } from '@/src/core/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes — no auth required
  const isPublic =
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health');

  // If on login page and already logged in → redirect to dashboard
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If public route → allow
  if (isPublic) return NextResponse.next();

  // If not logged in → redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → allow + add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo\\.svg|.*\\.svg$|.*\\.png$|.*\\.ico$|.*\\.webp$).*)',
  ],
};
