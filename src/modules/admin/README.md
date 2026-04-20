# Admin Module

Адміністрування: користувачі, місячні цілі, налаштування системи.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `getUsers(user)` | Session | `users:read` | User[] |
| `createUser(data, user)` | CreateUserInput, Session | `users:manage` | User |
| `updateUser(id, data, user)` | cuid, UpdateUserInput, Session | `users:manage` | User |
| `deleteUser(id, user)` | cuid, Session | `users:manage` | void |
| `getTargets(year, month, user)` | number, number, Session | `targets:read` | MonthlyTarget[] |
| `upsertTarget(data, user)` | MonthlyTargetInput, Session | `targets:write` | MonthlyTarget |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/middleware` — permission check
- `@/src/core/event-bus` — emit target updates
- `bcryptjs` — password hashing for user creation

## Events Emitted

| Event | Payload | When |
|---|---|---|
| `target:updated` | `{ metric, oldValue, newValue }` | Monthly target changed |
| `audit:action` | `{ userId, action, details }` | Any admin action |

## Events Consumed

_None_

## Data Schema

- `User` — users (email, role, department)
- `MonthlyTarget` — monthly_targets (year, month, metric, targetValue)
