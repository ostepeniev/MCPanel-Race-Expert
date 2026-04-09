import { NextResponse } from 'next/server';

export function middleware(request) {
  // Skip auth for API routes during development if no env vars set
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic') {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(':');
      if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="MCPanel"',
    },
  });
}

export const config = {
  matcher: [
    // Protect all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
