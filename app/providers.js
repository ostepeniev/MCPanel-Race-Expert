'use client';

/**
 * Session Provider Wrapper.
 * Wraps the entire app in NextAuth SessionProvider.
 */

import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }) {
  return (
    <SessionProvider>{children}</SessionProvider>
  );
}
