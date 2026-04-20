# Orders Module

Управління замовленнями: KPI, статуси, оплати, деталі замовлень.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `getOrdersData(period, user)` | PeriodEnum, Session | `orders:read` | OrdersKPI |
| `getOrderById(id, user)` | cuid, Session | `orders:read` | OrderDetail |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/middleware` — permission check

## Events Emitted

| Event | Payload | When |
|---|---|---|
| `order:status_changed` | `{ orderId, from, to }` | Order status updated during sync |

## Events Consumed

| Event | Source | Handler |
|---|---|---|
| `sync:completed` | sync module | Recalculate cached KPIs |

## Data Schema

- `Order` — orders (status, payment, amounts, timestamps)
- `OrderItem` — order_items (product, qty, price, cost)
- `Customer` — customers (name, type, tags, totals)

## Validation Schemas

- `PeriodSchema` — z.enum(['today','yesterday','current_month','prev_month'])
- `OrderIdSchema` — z.string().cuid()
