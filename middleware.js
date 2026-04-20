/**
 * Next.js Middleware — route protection.
 *
 * Delegates auth checking to NextAuth v5 authorized callback.
 * The authorized() callback in src/core/auth.js handles:
 *   - Public routes (login, auth API, health, webhooks)
 *   - Redirect logged-in users away from /login
 *   - Require auth for everything else
 *
 * Fine-grained RBAC (role + department) is handled
 * at the module API level via checkPermission().
 */

export { auth as middleware } from '@/src/core/auth';

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, logo.svg (public assets)
     * - Public assets in /public
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.svg$|.*\\.png$|.*\\.ico$).*)',
  ],
};
