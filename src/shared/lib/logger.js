/**
 * Winston Logger — structured JSON logging with 4 channels.
 *
 * Channels:
 *   app.log   — all levels (info+), 14 day retention, 20MB max
 *   error.log — error only, 30 day retention
 *   sync.log  — sync-related, 30 day retention
 *   audit.log — user actions, 90 day retention
 *
 * @module shared/lib/logger
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const LOG_DIR = process.env.LOG_DIR || './logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ── JSON format for all file transports ──
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ── Pretty format for console (dev only) ──
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

// ── Transports ──
const transports = [];

// Console (dev only)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

// App log — all levels
transports.push(
  new DailyRotateFile({
    filename: path.join(LOG_DIR, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: jsonFormat,
    level: LOG_LEVEL,
  })
);

// Error log — errors only
transports.push(
  new DailyRotateFile({
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: jsonFormat,
    level: 'error',
  })
);

// ── Create main logger ──
const baseLogger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
  // Don't crash on unhandled rejection inside logger
  exitOnError: false,
});

// ── Sync log (separate file, filtered by category) ──
const syncTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'sync-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
});

const syncLogger = winston.createLogger({
  level: 'info',
  transports: [syncTransport],
});

// ── Audit log (separate file, long retention) ──
const auditTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',
  format: jsonFormat,
});

const auditLogger = winston.createLogger({
  level: 'info',
  transports: [auditTransport],
});

// ── Public API ──

/**
 * Main application logger.
 * Use for general application events.
 */
export const logger = {
  debug: (message, meta = {}) => baseLogger.debug(message, meta),
  info: (message, meta = {}) => baseLogger.info(message, meta),
  warn: (message, meta = {}) => baseLogger.warn(message, meta),
  error: (message, meta = {}) => baseLogger.error(message, meta),

  /**
   * Log a sync event to sync.log.
   * @param {'keycrm'|'monopay'|'onec'} source
   * @param {'start'|'success'|'partial'|'failed'} status
   * @param {object} meta - { records, duration, error, etc. }
   */
  sync: (source, status, meta = {}) => {
    syncLogger.info(`Sync ${source}: ${status}`, {
      category: 'sync',
      source,
      status,
      ...meta,
    });
    // Also log to main app log
    const level = status === 'failed' ? 'error' : 'info';
    baseLogger[level](`Sync ${source}: ${status}`, { category: 'sync', source, ...meta });
  },

  /**
   * Log a user action to audit.log.
   * @param {string} action - e.g. "login", "target_update", "alert_ack"
   * @param {string} userId
   * @param {object} details - action-specific data
   */
  audit: (action, userId, details = {}) => {
    auditLogger.info(action, {
      category: 'audit',
      userId,
      action,
      ...details,
    });
  },
};
