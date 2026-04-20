'use client';

/**
 * Auth hook — wraps NextAuth useSession.
 * Provides role, department, and permission helpers.
 *
 * @module shared/hooks/useAuth
 */

import { useSession, signOut } from 'next-auth/react';

/**
 * @returns {{
 *   user: { id: string, email: string, name: string, role: string, department: string } | null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   isCEO: boolean,
 *   isManager: boolean,
 *   hasAccess: (section: string) => boolean,
 *   logout: () => Promise<void>,
 * }}
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user || null;

  const isCEO = user?.role === 'CEO';
  const isManager = user?.role === 'MANAGER';
  const isViewer = user?.role === 'VIEWER';

  /**
   * Check if user has access to a dashboard section.
   * @param {'orders'|'sales'|'warehouse'|'finance'|'settings'} section
   * @returns {boolean}
   */
  function hasAccess(section) {
    if (!user) return false;
    if (isCEO) return true;
    if (section === 'settings') return false; // CEO only

    const dept = user.department;
    if (dept === 'ALL') return true;
    return dept === section.toUpperCase();
  }

  return {
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isCEO,
    isManager,
    isViewer,
    hasAccess,
    logout: () => signOut({ callbackUrl: '/login' }),
  };
}
