/**
 * Health check module.
 * Used by /api/health endpoint and monitoring.
 *
 * @module core/health
 */

/**
 * Run all health checks.
 * @returns {Promise<{ status: 'ok'|'degraded'|'down', checks: object }>}
 */
export async function getHealthStatus() {
  const checks = {};
  let overallStatus = 'ok';

  // 1. Database check
  try {
    const { prisma } = await import('@/src/shared/lib/prisma');
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', latency: Date.now() - start };
  } catch (err) {
    checks.database = { status: 'down', error: err.message };
    overallStatus = 'down';
  }

  // 2. Last sync check
  try {
    const { prisma } = await import('@/src/shared/lib/prisma');
    const lastSync = await prisma.syncLog.findFirst({
      where: { status: 'SUCCESS' },
      orderBy: { completedAt: 'desc' },
      select: { source: true, completedAt: true },
    });

    if (lastSync) {
      const ageMs = Date.now() - lastSync.completedAt.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      checks.lastSync = {
        status: ageHours < 2 ? 'ok' : 'stale',
        source: lastSync.source,
        completedAt: lastSync.completedAt.toISOString(),
        ageHours: Math.round(ageHours * 10) / 10,
      };
      if (ageHours >= 4) overallStatus = 'degraded';
    } else {
      checks.lastSync = { status: 'no_data' };
    }
  } catch {
    checks.lastSync = { status: 'unknown' };
  }

  // 3. Memory usage
  const mem = process.memoryUsage();
  checks.memory = {
    rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + 'MB',
  };

  // 4. Uptime
  checks.uptime = Math.round(process.uptime()) + 's';

  return {
    status: overallStatus,
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    checks,
  };
}
