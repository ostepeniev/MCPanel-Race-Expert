# Sync Module

Синхронізація даних із зовнішніх систем: KEY CRM, MonoPay, 1C.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `triggerSync(source, user)` | SyncSource, Session | `sync:trigger` | SyncLog |
| `getSyncStatus(user)` | Session | `sync:read` | SyncStatus[] |
| `getSyncLogs(limit, user)` | number, Session | `sync:read` | SyncLog[] |
| `handleMonoPayWebhook(body, signature)` | object, string | public (signature check) | void |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/shared/lib/logger` — sync logging
- `@/src/core/middleware` — permission check
- `@/src/core/event-bus` — emit sync events
- `axios` — HTTP client for external APIs
- `node-cron` — scheduled execution

## Events Emitted

| Event | Payload | When |
|---|---|---|
| `sync:completed` | `{ source, records, duration }` | After successful sync |
| `sync:failed` | `{ source, error }` | On sync failure |
| `order:status_changed` | `{ orderId, from, to }` | When imported order has different status |

## Events Consumed

_None_

## Data Schema

- `SyncLog` — sync_logs (source, status, records, duration)
- `SyncCursor` — sync_cursors (source, cursor — last synced position)

## External APIs

| Source | Base URL | Auth | Rate Limit |
|---|---|---|---|
| KEY CRM | `https://openapi.keycrm.app/v1` | Bearer token | 60 req/min |
| MonoPay | `https://api.monobank.ua/api/merchant` | X-Token header | — |
| 1C | Configurable | Basic Auth | — |

## Cron Schedule

| Cron | Task |
|---|---|
| `0 * * * *` | KEY CRM orders sync |
| `15 * * * *` | KEY CRM inventory sync |
| `30 * * * *` | MonoPay transactions |
| `0 2 * * *` | 1C full sync (nightly) |
