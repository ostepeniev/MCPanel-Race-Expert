/**
 * Shared constants and enums.
 *
 * @module shared/types
 */

// ── Order statuses (mirror Prisma enum) ──
export const ORDER_STATUS = {
  NEW: 'NEW',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  AGREEMENT: 'AGREEMENT',
  PRODUCTION: 'PRODUCTION',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_LABELS = {
  NEW: 'Нове',
  AWAITING_PAYMENT: 'Очікує оплати',
  AGREEMENT: 'Узгодження',
  PRODUCTION: 'В обробці',
  PACKED: 'Запаковано',
  SHIPPED: 'Відвантажено',
  DELIVERED: 'Доставлено',
  RETURNED: 'Повернуто',
  CANCELLED: 'Скасовано',
};

// ── Payment statuses ──
export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  COD: 'COD',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: 'Не оплачено',
  PARTIAL: 'Частково',
  PAID: 'Оплачено',
  COD: 'Післяплата',
  REFUNDED: 'Повернуто',
};

// ── User roles ──
export const USER_ROLES = {
  CEO: 'CEO',
  MANAGER: 'MANAGER',
  VIEWER: 'VIEWER',
};

export const USER_ROLE_LABELS = {
  CEO: 'CEO (повний доступ)',
  MANAGER: 'Менеджер (свій блок)',
  VIEWER: 'Глядач (тільки перегляд)',
};

// ── Departments ──
export const DEPARTMENTS = {
  ALL: 'ALL',
  ORDERS: 'ORDERS',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  FINANCE: 'FINANCE',
};

export const DEPARTMENT_LABELS = {
  ALL: 'Всі відділи',
  ORDERS: 'Замовлення',
  SALES: 'Продажі',
  WAREHOUSE: 'Склад',
  FINANCE: 'Фінанси',
};

// ── Sync sources ──
export const SYNC_SOURCES = {
  KEYCRM: 'KEYCRM',
  MONOPAY: 'MONOPAY',
  ONEC: 'ONEC',
};

// ── Alert severities ──
export const ALERT_SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  DANGER: 'DANGER',
  CRITICAL: 'CRITICAL',
};

export const ALERT_SEVERITY_COLORS = {
  INFO: 'var(--accent-blue)',
  WARNING: 'var(--accent-yellow)',
  DANGER: 'var(--accent-orange)',
  CRITICAL: 'var(--accent-red)',
};

// ── SLA ──
export const SHIPMENT_SLA_HOURS = 24;

// ── Data refresh intervals (ms) ──
export const SWR_REFRESH_INTERVAL = 60_000;       // 60s for dashboard pages
export const SWR_ALERT_INTERVAL = 10_000;          // 10s for alert banner
export const SWR_SYNC_STATUS_INTERVAL = 30_000;    // 30s for sync status
