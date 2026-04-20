# Alerts Module

Розумні алерти: автоматичний моніторинг метрик із drill-down контекстом.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `getActiveAlerts(user)` | Session | `alerts:read` | AlertEvent[] |
| `acknowledgeAlert(alertId, user)` | cuid, Session | `alerts:read` | void |
| `getAlertRules(user)` | Session | `alerts:manage` | AlertRule[] |
| `createAlertRule(data, user)` | AlertRuleInput, Session | `alerts:manage` | AlertRule |
| `updateAlertRule(id, data, user)` | cuid, Partial, Session | `alerts:manage` | AlertRule |
| `deleteAlertRule(id, user)` | cuid, Session | `alerts:manage` | void |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/middleware` — permission check
- `@/src/core/event-bus` — emit + listen

## Events Emitted

| Event | Payload | When |
|---|---|---|
| `alert:triggered` | `{ ruleId, severity, message }` | Alert rule condition met |
| `alert:acknowledged` | `{ ruleId, userId }` | User acknowledges alert |

## Events Consumed

| Event | Source | Handler |
|---|---|---|
| `sync:completed` | sync module | Re-evaluate all active alert rules |

## Metric Calculators

| Metric | Description | Threshold Example |
|---|---|---|
| `margin_by_brand` | Margin % change per brand vs 7-day avg | CHANGE_LT -3 |
| `unshipped_48h` | Count of unshipped orders older than 48h | GT 100 |
| `daily_revenue` | Today's revenue | LT 500000 |
| `avg_ship_time` | Average hours from order to shipment | GT 24 |
| `return_rate` | Return rate % for current month | GT 5 |
| `low_stock` | Products with quantity < threshold | GT 0 |
| `unpaid_48h` | Unpaid orders older than 48h | GT 50 |

## Data Schema

- `AlertRule` — alert_rules (metric, operator, threshold, severity, cooldown)
- `AlertEvent` — alert_events (message, currentValue, drillContext, acknowledged)
