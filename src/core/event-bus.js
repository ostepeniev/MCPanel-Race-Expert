/**
 * Typed Event Bus — fire-and-forget, error-isolated listeners.
 *
 * @module core/event-bus
 *
 * Event catalog (see ARCHITECTURE.md for full list):
 *   sync:completed       — after successful data sync
 *   sync:failed          — on sync error
 *   order:status_changed — order status transition
 *   alert:triggered      — alert rule fired
 *   alert:acknowledged   — alert dismissed by user
 *   audit:action         — user action logged
 *   target:updated       — monthly target changed
 */

/**
 * @typedef {Object} AppEvents
 * @property {{ source: 'keycrm'|'monopay'|'onec', records: number, duration: number }} sync:completed
 * @property {{ source: 'keycrm'|'monopay'|'onec', error: string }} sync:failed
 * @property {{ orderId: string, from: string, to: string }} order:status_changed
 * @property {{ ruleId: string, severity: 'info'|'warning'|'danger'|'critical', message: string }} alert:triggered
 * @property {{ ruleId: string, userId: string }} alert:acknowledged
 * @property {{ userId: string, action: string, details?: object }} audit:action
 * @property {{ metric: string, oldValue: number, newValue: number }} target:updated
 */

let loggerRef = null;

class TypedEventBus {
  /** @type {Map<string, Set<Function>>} */
  #listeners = new Map();

  /**
   * Inject logger (avoids circular dependency with shared/lib/logger).
   * @param {object} logger
   */
  setLogger(logger) {
    loggerRef = logger;
  }

  /**
   * Emit event — fire-and-forget, NEVER blocks the emitter.
   * Each listener runs in its own try/catch + setImmediate.
   *
   * @template {keyof AppEvents} K
   * @param {K} event
   * @param {AppEvents[K]} payload
   */
  emit(event, payload) {
    const handlers = this.#listeners.get(event);
    if (!handlers || handlers.size === 0) return;

    for (const handler of handlers) {
      setImmediate(async () => {
        try {
          await handler(payload);
        } catch (err) {
          // Log error but NEVER propagate to emitter
          if (loggerRef) {
            loggerRef.error(`EventBus listener error [${event}]`, {
              event,
              error: err.message,
              stack: err.stack,
            });
          } else {
            console.error(`[EventBus] Listener error for "${event}":`, err);
          }
        }
      });
    }
  }

  /**
   * Subscribe to an event.
   * Returns an unsubscribe function.
   *
   * @template {keyof AppEvents} K
   * @param {K} event
   * @param {(payload: AppEvents[K]) => void|Promise<void>} handler
   * @returns {() => void} unsubscribe function
   */
  on(event, handler) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(handler);

    // Return unsubscribe function
    return () => {
      this.#listeners.get(event)?.delete(handler);
    };
  }

  /**
   * Subscribe to an event, but only fire once.
   *
   * @template {keyof AppEvents} K
   * @param {K} event
   * @param {(payload: AppEvents[K]) => void|Promise<void>} handler
   */
  once(event, handler) {
    const unsub = this.on(event, (payload) => {
      unsub();
      return handler(payload);
    });
  }

  /**
   * Get count of listeners for an event (for testing/debugging).
   * @param {string} event
   * @returns {number}
   */
  listenerCount(event) {
    return this.#listeners.get(event)?.size || 0;
  }
}

/** @type {TypedEventBus} */
export const eventBus = new TypedEventBus();
