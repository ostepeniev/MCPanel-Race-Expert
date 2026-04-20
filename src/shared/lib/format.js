/**
 * Number and date formatters — uk-UA locale.
 *
 * @module shared/lib/format
 */

const UA_LOCALE = 'uk-UA';

/**
 * Format currency (UAH).
 * @param {number} value
 * @param {boolean} [compact=false] - Use compact notation (1.2M)
 * @returns {string}
 */
export function formatCurrency(value, compact = false) {
  if (value == null || isNaN(value)) return '—';

  if (compact && Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace('.0', '') + 'M ₴';
  }
  if (compact && Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(1).replace('.0', '') + 'K ₴';
  }

  return new Intl.NumberFormat(UA_LOCALE, {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value) + ' ₴';
}

/**
 * Format number with locale separators.
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat(UA_LOCALE, {
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage.
 * @param {number} value - e.g. 45.3 for 45.3%
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return value.toFixed(decimals) + '%';
}

/**
 * Format change delta (e.g. +12.3% or -5.7%).
 * @param {number} value - percentage change
 * @returns {{ text: string, direction: 'up'|'down'|'neutral' }}
 */
export function formatChange(value) {
  if (value == null || isNaN(value)) return { text: '—', direction: 'neutral' };
  const sign = value > 0 ? '+' : '';
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';
  return { text: `${sign}${value.toFixed(1)}%`, direction };
}

/**
 * Format date in Ukrainian short format.
 * @param {Date|string} date
 * @returns {string} "16.04.2026"
 */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString(UA_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date with time.
 * @param {Date|string} date
 * @returns {string} "16.04.2026, 14:30"
 */
export function formatDateTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString(UA_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time ("2 хв тому", "3 год тому").
 * @param {Date|string} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return 'щойно';
  if (diffMin < 60) return `${diffMin} хв тому`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} год тому`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'вчора';
  return `${diffDays} дн тому`;
}
