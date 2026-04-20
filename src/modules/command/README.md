# Command Center Module

Головна сторінка CEO — зведена інформація по всіх блоках бізнесу.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `getCommandData(period, user)` | PeriodEnum, Session | `orders:read` | CommandCenterData |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/middleware` — permission check
- `@/src/modules/alerts/api` — active alerts (cross-module via API)

## Events Emitted

_None_

## Events Consumed

| Event | Source | Handler |
|---|---|---|
| `sync:completed` | sync module | Invalidate cached aggregations |
| `target:updated` | admin module | Recalculate goal progress rings |
| `alert:triggered` | alerts module | Update live alert banner |

## Data Schema

Uses aggregations from: `Order`, `OrderItem`, `Product`, `Brand`, `MonthlyTarget`, `AlertEvent`

## Key Components

- `RevenueTicker` — Animated revenue counter with progress bar
- `GoalTracker` — 4 progress rings (revenue, orders, margin, SLA)
- `MonthComparison` — Current vs previous month table
- `WeeklyWinners` — Top-5 products by revenue
- `QuickAccessGrid` — 4 navigation cards
