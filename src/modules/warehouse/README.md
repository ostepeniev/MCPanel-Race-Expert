# Warehouse Module

Складська аналітика: відвантаження, затримки, SLA, черга.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `getWarehouseData(period, user)` | PeriodEnum, Session | `warehouse:read` | WarehouseData |
| `getDelayAnalysis(user)` | Session | `warehouse:read` | DelayAnalysis |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/middleware` — permission check

## Events Emitted

_None_

## Events Consumed

| Event | Source | Handler |
|---|---|---|
| `order:status_changed` | orders module | Update shipment queue |

## Data Schema

- `Order` — orders (status, shippedAt, packedAt — for SLA/delay calc)
- `Inventory` — inventory (quantity, reserved)
