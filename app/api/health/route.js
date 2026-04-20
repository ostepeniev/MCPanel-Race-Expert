/**
 * Health check endpoint.
 * Public — no auth required.
 *
 * GET /api/health
 */
import { getHealthStatus } from '@/src/core/health';

export async function GET() {
  try {
    const status = await getHealthStatus();
    const httpStatus = status.status === 'down' ? 503 : 200;
    return Response.json(status, { status: httpStatus });
  } catch (err) {
    return Response.json(
      { status: 'down', error: err.message, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
