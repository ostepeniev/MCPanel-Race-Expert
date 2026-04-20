# Auth Module

Аутентифікація та авторизація користувачів. NextAuth.js v5 + Credentials provider.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `login(email, password)` | string, string | public | Session |
| `getSession()` | — | public | Session \| null |
| `logout()` | — | authenticated | void |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/auth` — NextAuth config
- `bcryptjs` — password hashing

## Events Emitted

| Event | Payload | When |
|---|---|---|
| `audit:action` | `{ userId, action: 'login' }` | Successful login |

## Events Consumed

_None_

## Data Schema

- `User` — users table (email, passwordHash, role, department)
- `AuditLog` — audit_logs table

## Validation Schemas

- `LoginSchema` — z.object({ email, password })
