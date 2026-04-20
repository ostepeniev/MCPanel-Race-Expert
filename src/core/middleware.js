/**
 * RBAC Permission System.
 *
 * @module core/middleware
 *
 * Every exported function from a module's api/index.js MUST call
 * checkPermission() as its first line.
 */

/**
 * @typedef {'orders:read'|'orders:write'|'sales:read'|'sales:write'|
 *           'warehouse:read'|'warehouse:write'|'finance:read'|'finance:write'|
 *           'admin:read'|'admin:write'|'sync:trigger'|'sync:read'|
 *           'alerts:read'|'alerts:manage'|'targets:read'|'targets:write'|
 *           'users:read'|'users:manage'} Permission
 */

/**
 * Role → Department → Permissions mapping.
 * CEO gets wildcard '*' (all permissions).
 */
const ROLE_PERMISSIONS = {
  CEO: '*',
  MANAGER: {
    ALL:       ['orders:read', 'sales:read', 'warehouse:read', 'finance:read', 'alerts:read', 'targets:read', 'sync:read'],
    ORDERS:    ['orders:read', 'orders:write', 'alerts:read'],
    SALES:     ['sales:read', 'alerts:read'],
    WAREHOUSE: ['warehouse:read', 'warehouse:write', 'alerts:read'],
    FINANCE:   ['finance:read', 'alerts:read'],
  },
  VIEWER: {
    ALL:       ['orders:read', 'sales:read', 'warehouse:read', 'finance:read'],
    ORDERS:    ['orders:read'],
    SALES:     ['sales:read'],
    WAREHOUSE: ['warehouse:read'],
    FINANCE:   ['finance:read'],
  },
};

/**
 * Custom error class for permission denials.
 */
export class PermissionError extends Error {
  /**
   * @param {string} permission
   * @param {{ role: string, department: string }} user
   */
  constructor(permission, user) {
    super(`Access denied: ${user.role}/${user.department} lacks permission '${permission}'`);
    this.name = 'PermissionError';
    this.permission = permission;
    this.userRole = user.role;
    this.userDepartment = user.department;
  }
}

/**
 * Check if user has the required permission.
 * Throws PermissionError if not.
 *
 * @param {{ role: string, department: string, id?: string }} user - from session
 * @param {Permission} permission
 * @throws {PermissionError}
 */
export function checkPermission(user, permission) {
  if (!user) {
    throw new PermissionError(permission, { role: 'none', department: 'none' });
  }

  // CEO = god mode
  if (user.role === 'CEO') return;

  const rolePerms = ROLE_PERMISSIONS[user.role];
  if (!rolePerms) {
    throw new PermissionError(permission, user);
  }

  // Wildcard check
  if (rolePerms === '*') return;

  const deptPerms = rolePerms[user.department] || rolePerms['ALL'] || [];
  if (!deptPerms.includes(permission)) {
    throw new PermissionError(permission, user);
  }
}

/**
 * Route-level permission map for middleware.js.
 * Maps URL patterns to required permissions.
 */
export const ROUTE_PERMISSIONS = {
  '/settings':       'admin:read',
  '/settings/users': 'users:manage',
  '/settings/alerts': 'alerts:manage',
  '/settings/targets': 'targets:write',
  '/settings/sync':  'sync:read',
  '/orders':         'orders:read',
  '/sales':          'sales:read',
  '/warehouse':      'warehouse:read',
  '/finance':        'finance:read',
};

/**
 * Public routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/api/auth',
  '/api/health',
  '/api/sync/webhook',
];
