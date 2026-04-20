/**
 * Shared Zod validation schemas.
 *
 * Used at module API boundaries to validate external input.
 * Modules should import from here or define their own internal schemas.
 *
 * @module shared/lib/validators
 */

import { z } from 'zod';

// ── Period filter ──
export const PeriodSchema = z.enum([
  'today',
  'yesterday',
  'current_month',
  'prev_month',
  'current_week',
  'last_7_days',
  'last_30_days',
]).default('current_month');

// ── Pagination ──
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── ID validation ──
export const CuidSchema = z.string().cuid();
export const OptionalCuidSchema = z.string().cuid().optional();

// ── Sort ──
export const SortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ── Date range ──
export const DateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine(
  (data) => data.from <= data.to,
  { message: 'from must be before to' }
);

// ── User role ──
export const UserRoleSchema = z.enum(['CEO', 'MANAGER', 'VIEWER']);
export const DepartmentSchema = z.enum(['ALL', 'ORDERS', 'SALES', 'WAREHOUSE', 'FINANCE']);

// ── Sync source ──
export const SyncSourceSchema = z.enum(['keycrm', 'monopay', 'onec']);

// ── Alert rule ──
export const AlertOperatorSchema = z.enum(['GT', 'LT', 'GTE', 'LTE', 'CHANGE_GT', 'CHANGE_LT']);
export const AlertSeveritySchema = z.enum(['INFO', 'WARNING', 'DANGER', 'CRITICAL']);

// ── Monthly target ──
export const MonthlyTargetSchema = z.object({
  year: z.number().int().min(2020).max(2050),
  month: z.number().int().min(1).max(12),
  metric: z.enum(['revenue', 'orders', 'margin', 'ship_sla']),
  targetValue: z.number().positive(),
});

// ── Login ──
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ── User CRUD ──
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: UserRoleSchema,
  department: DepartmentSchema,
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: UserRoleSchema.optional(),
  department: DepartmentSchema.optional(),
  isActive: z.boolean().optional(),
});
