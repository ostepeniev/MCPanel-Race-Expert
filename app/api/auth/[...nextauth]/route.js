/**
 * NextAuth.js route handler.
 * Delegates to core/auth.js config.
 */
export { handlers as GET, handlers as POST } from '@/src/core/auth';

// Re-export for convenience
import { handlers } from '@/src/core/auth';
export default handlers;
