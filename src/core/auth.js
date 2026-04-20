/**
 * NextAuth.js v5 configuration.
 *
 * Provider: Credentials (email + password)
 * Session: JWT (30 days)
 * Callbacks: attach role + department to token/session
 *
 * @module core/auth
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/src/shared/lib/prisma';
import { logger } from '@/src/shared/lib/logger';

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
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              role: true,
              department: true,
              isActive: true,
            },
          });

          if (!user || !user.isActive) {
            logger.warn('Login failed: user not found or inactive', {
              email: credentials.email,
            });
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            logger.warn('Login failed: invalid password', {
              email: credentials.email,
            });
            return null;
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          logger.audit('login', user.id, { email: user.email, role: user.role });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
          };
        } catch (error) {
          logger.error('Auth error', { error: error.message });
          return null;
        }
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

    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === '/login';
      const isPublicApi =
        request.nextUrl.pathname.startsWith('/api/auth') ||
        request.nextUrl.pathname.startsWith('/api/health') ||
        request.nextUrl.pathname.startsWith('/api/sync/webhook');

      if (isPublicApi) return true;
      if (isLoginPage) return !isLoggedIn ? true : Response.redirect(new URL('/', request.url));
      return isLoggedIn;
    },
  },
});
