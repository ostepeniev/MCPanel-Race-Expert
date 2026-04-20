# Sales Module

Продажі: аналітика по брендах, категоріях, постачальниках, наборах.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `getSalesData(period, user)` | PeriodEnum, Session | `sales:read` | SalesData |
| `getBrandDetail(brandId, period, user)` | cuid, PeriodEnum, Session | `sales:read` | BrandDetail |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/middleware` — permission check

## Events Emitted

_None_

## Events Consumed

| Event | Source | Handler |
|---|---|---|
| `sync:completed` | sync module | Recalculate aggregations |

## Data Schema

- `Product` — products (sku, name, price, cost, isBundle)
- `Brand` — brands (name, country)
- `Category` — categories (name, parentId — tree)
- `OrderItem` — for revenue/margin calculations (JOIN with orders)
