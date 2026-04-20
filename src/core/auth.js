/**
 * NextAuth.js v5 configuration — ENV-based single-user mode.
 *
 * Credentials are stored in .env.local (ADMIN_USERNAME, ADMIN_PASSWORD).
 * When PostgreSQL is connected, switch to Prisma-based user lookup.
 *
 * Session: JWT (30 days), HttpOnly cookie.
 *
 * @module core/auth
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // refresh token every 24h
  },

  cookies: {
    sessionToken: {
      name: 'mcpanel.session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: 'MCPanel',
      credentials: {
        username: { label: 'Логін', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },

      async authorize(credentials) {
        // ENV-based single-user mode
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        console.log('[Auth] Authorize called with:', {
          receivedUsername: credentials?.username,
          expectedUsername: adminUser,
          hasPassword: !!credentials?.password,
          credentialKeys: credentials ? Object.keys(credentials) : [],
        });

        if (!adminUser || !adminPass) {
          console.error('[Auth] ADMIN_USERNAME or ADMIN_PASSWORD not set in .env.local');
          return null;
        }

        // Compare credentials (trim whitespace for safety)
        const usernameMatch = credentials?.username?.trim() === adminUser.trim();
        const passwordMatch = credentials?.password?.trim() === adminPass.trim();

        if (usernameMatch && passwordMatch) {
          console.log('[Auth] ✅ Login successful');
          return {
            id: 'admin-001',
            name: 'CEO Race Expert',
            email: 'ceo@raceexpert.com.ua',
            role: 'CEO',
            department: 'ALL',
          };
        }

        // Invalid credentials
        console.warn(`[Auth] ❌ Failed login: username=${usernameMatch}, password=${passwordMatch}`);
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, attach user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.loginAt = new Date().toISOString();
      }
      return token;
    },

    async session({ session, token }) {
      // Expose role + department in client session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.department = token.department;
      }
      return session;
    },
  },
});
