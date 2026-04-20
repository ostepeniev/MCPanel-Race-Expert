# Finance Module

Фінансова аналітика: KPI, прибуток, маржа, баланс рахунків, дебіторка/кредиторка.

## Public API (`api/index.js`)

| Function | Params | Permission | Returns |
|---|---|---|---|
| `getFinanceData(period, user)` | PeriodEnum, Session | `finance:read` | FinanceData |
| `getAccountDetail(accountId, user)` | cuid, Session | `finance:read` | AccountDetail |

## Dependencies

- `@/src/shared/lib/prisma` — DB access
- `@/src/core/middleware` — permission check

## Events Emitted

_None_

## Events Consumed

| Event | Source | Handler |
|---|---|---|
| `sync:completed` | sync module | Update account balances |

## Data Schema

- `FinanceAccount` — finance_accounts (name, type, balance)
- `Transaction` — transactions (type, amount, category)
- `Receivable` — receivables (debtor, amount, dueDate)
- `Payable` — payables (creditor, amount, dueDate)
