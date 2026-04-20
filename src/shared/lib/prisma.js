/**
 * Prisma Client Singleton.
 *
 * In development, hot-reload creates new Prisma clients on every module reload.
 * This singleton prevents connection pool exhaustion.
 *
 * @module shared/lib/prisma
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/** @type {PrismaClient} */
export const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}
