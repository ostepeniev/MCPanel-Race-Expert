# Race Expert MCPanel — Project Map

> **Живий документ.** Оновлюється щоразу, коли зміни впливають на архітектуру, додаються нові сторінки, компоненти, API-ендпоінти або змінюється data flow.
> **Останнє оновлення:** 2026-04-10

---

## 1. Огляд проекту

**MCPanel** — Mission Control Dashboard для компанії Race Expert (e-commerce, спортивне харчування для бігунів).  
CEO-дашборд для моніторингу бізнес-метрик в реальному часі.

| Параметр | Значення |
|---|---|
| **Framework** | Next.js 16.2.3 (App Router, Turbopack) |
| **React** | 19.2.4 |
| **CSS** | Vanilla CSS (globals.css, ~1990 рядків) |
| **Charts** | Recharts 3.8.1 |
| **Data Fetching** | SWR 2.4.1 (client-side, 60s refresh) |
| **Icons** | Lucide React 1.8.0 |
| **Database** | SQLite (better-sqlite3) — dev only |
| **Hosting** | Vercel (static exports + API routes) |
| **Repo** | `https://github.com/ostepeniev/MCPanel-Race-Expert.git` |
| **Production URL** | `https://mc-panel-race-expert.vercel.app/` |
| **Language** | Ukrainian (lang="uk") |

---

## 2. Архітектура (File Tree)

```
mcpanel/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout (html, body, AppShell)
│   ├── globals.css               # Єдиний CSS файл (~1990 рядків)
│   ├── page.js                   # / — Command Center (home)
│   ├── page.module.css           # Legacy module CSS (не використовується)
│   ├── favicon.ico               # Іконка сайту
│   │
│   ├── orders/page.js            # /orders — Замовлення
│   ├── sales/page.js             # /sales — Продажі
│   ├── warehouse/page.js         # /warehouse — Склад
│   ├── finance/page.js           # /finance — Фінанси
│   ├── marketing/page.js         # /marketing — Маркетинг (placeholder)
│   │
│   ├── components/               # Shared UI Components
│   │   ├── AppShell.js           # Layout wrapper (Sidebar + TopNav + BottomTabs + Splash)
│   │   ├── Sidebar.js            # Desktop sidebar navigation
│   │   ├── TopNav.js             # Top navigation bar (tabs, period selector, live)
│   │   ├── MobileBottomTabs.js   # Bottom tab bar (mobile only)
│   │   ├── SplashScreen.js       # Animated intro (5s, session-once)
│   │   ├── KPICard.js            # KPI metric card with trend indicator
│   │   ├── DataTable.js          # Responsive table (desktop: table / mobile: cards)
│   │   ├── MiniChart.js          # Recharts AreaChart wrapper
│   │   ├── StatusBadge.js        # Order/payment status badge + DelayIndicator
│   │   └── DrillLink.js          # Navigation link (DrillLink + QuickNavCard)
│   │
│   └── api/dashboard/            # API Routes (Next.js Route Handlers)
│       ├── command/route.js      # GET /api/dashboard/command
│       ├── orders/route.js       # GET /api/dashboard/orders
│       ├── sales/route.js        # GET /api/dashboard/sales
│       ├── warehouse/route.js    # GET /api/dashboard/warehouse
│       └── finance/route.js      # GET /api/dashboard/finance
│
├── data/                         # Data layer
│   ├── mcpanel.db                # SQLite DB (dev, seed data)
│   └── api/                      # Pre-computed JSON (production)
│       ├── command.json          # Command Center aggregations
│       ├── orders.json           # Orders metrics
│       ├── sales.json            # Sales by brands/suppliers/categories/bundles
│       ├── warehouse.json        # Shipment metrics + delays
│       └── finance.json          # Financial KPIs + balance
│
├── lib/                          # Shared modules
│   ├── db.js                     # SQLite connection (dev + Vercel-aware)
│   └── schema.sql                # Database schema (11 tables, 9 indexes)
│
├── scripts/                      # CLI scripts
│   ├── seed.js                   # Database seeder (populates SQLite)
│   ├── export-data.js            # Generates data/api/*.json from configuration
│   └── data/products.json        # 504 products reference catalogue
│
├── public/                       # Static assets
│   └── logo.svg                  # Race Expert logo
│
├── .env.local                    # Environment (auth credentials, commented out)
├── package.json                  # Dependencies & scripts
├── next.config.mjs               # Next.js config (empty/defaults)
├── jsconfig.json                 # JS path config
└── AGENTS.md                     # AI agent rules for Next.js 16
```

---

## 3. Сторінки та їх функції

### 3.1. `/` — Command Center (page.js)
**Головна сторінка власника.** Зведена інформація по всіх блоках.

| Секція | Дані (API) | Drill-down |
|---|---|---|
| Revenue Ticker | `command.revenueTicker` | → `/sales` |
| Goal Tracker (4 кільця) | `command.goals` | → `/sales`, `/orders`, `/finance`, `/warehouse` |
| Цей місяць vs Минулий | `command.monthComparison` | → `/finance` |
| Потрібна увага (alerts) | `command.alerts` | → `/warehouse`, `/orders` |
| ТОП-5 товарів тижня | `command.weeklyWinners` | → `/sales` |
| Виручка за 30 днів (chart) | `command.revenueTrend30` | — |
| Unit Economics | `command.unitEcon` | — |
| Замовлення 7 днів (chart) | `orders.trend` | → `/orders` |
| Відвантаження 7 днів (chart) | `warehouse.shipTrend` | → `/warehouse` |
| Швидкий доступ (4 cards) | mixed | → all pages |

**Компоненти:** `AnimatedNumber`, `ProgressRing`, `MiniChart`, `DrillLink`, `QuickNavCard`

### 3.2. `/orders` — Замовлення
**Блок 1** — KEY CRM дані (оплачені + післяплата).

| Секція | Дані |
|---|---|
| KPI Grid (Вчора/Сьогодні) | `orders.yesterday`, `orders.today` |
| Поточний місяць | `orders.currentMonth` |
| Статуси замовлень | `orders.statuses` (5 badge) |
| Оплати | `orders.payments` (3 badge) |
| Графік 7 днів | `orders.trend` |

**Компоненти:** `KPICard`, `StatusBadge`, `MiniChart`, `DrillLink`

### 3.3. `/sales` — Продажі
**Блок 2** — дані з 1С (поточний місяць).

| Секція | Дані |
|---|---|
| KPI (виручка, бренди, категорії) | `sales.totalRevenue`, counts |
| Продажі по брендах (DataTable) | `sales.byBrands` (25 рядків) |
| Продажі по постачальниках | `sales.bySuppliers` (11 рядків) |
| Продажі по категоріях | `sales.byCategories` (15 рядків) |
| Продажі наборів | `sales.byBundles` (15 рядків) |
| ТОП-10 по виручці (chart) | `sales.topByRevenue` |
| ТОП-10 по прибутку (chart) | `sales.topByProfit` |

**Компоненти:** `DataTable`, `KPICard`, `BarChart`, `DrillLink`

### 3.4. `/warehouse` — Склад
**Блок 3** — відвантаження та затримки.

| Секція | Дані |
|---|---|
| KPI cards | `warehouse.yesterday`, `warehouse.currentMonth` |
| Черга відвантажень | `warehouse.queue` |
| Затримки | `warehouse.delays` (24h—168h buckets) |
| Графік відвантажень | `warehouse.shipmentTrend` |
| Залишки | `warehouse.totalDelayed` |

**Компоненти:** `KPICard`, `MiniChart`, `DelayIndicator`, `DrillLink`

### 3.5. `/finance` — Фінанси
**Блок 4** — фінансові показники (дані з 1С).

| Секція | Дані |
|---|---|
| KPI Grid (6 карток) | `finance.kpis` |
| Прогнози (3 картки) | `finance.forecast` |
| Баланс по рахунках | `finance.balance.accounts` |
| Дебіторська/Кредиторська | `finance.balance.receivables`, `finance.balance.payables` |
| Запаси | `finance.balance.inventory` |
| Чистий баланс | `finance.balance.net_balance` |

**Компоненти:** `KPICard`, `DrillLink`

### 3.6. `/marketing` — Маркетинг
**Placeholder** — "Coming Soon". Planned: Google Ads, Meta Ads, Analytics.

---

## 4. Компоненти

| Компонент | Файл | Призначення | Props |
|---|---|---|---|
| `AppShell` | `AppShell.js` | Layout wrapper, splash logic | `children` |
| `Sidebar` | `Sidebar.js` | Desktop nav (collapsible) | — |
| `TopNav` | `TopNav.js` | Top bar: tabs, period, logo (mobile), live | `period`, `onPeriodChange` |
| `MobileBottomTabs` | `MobileBottomTabs.js` | 5 bottom tabs (mobile only) | — |
| `SplashScreen` | `SplashScreen.js` | Animated intro, session-once | `onComplete` |
| `KPICard` | `KPICard.js` | Metric card with value, label, trend | `value`, `label`, `icon`, `change`, `prefix`, `suffix`, `isLoading` |
| `DataTable` | `DataTable.js` | Desktop=table, Mobile=cards, sortable | `columns`, `data`, `isLoading`, `title`, `subtitle` |
| `MiniChart` | `MiniChart.js` | Area chart wrapper | `data`, `dataKey`, `color`, `height`, `showAxis` |
| `StatusBadge` | `StatusBadge.js` | Colored badge for order/payment status | `status` |
| `DelayIndicator` | `StatusBadge.js` | Delay severity label (exported) | `hours` |
| `DrillLink` | `DrillLink.js` | Block navigation button (→) | `href`, `label`, `icon`, `variant` |
| `QuickNavCard` | `DrillLink.js` | Navigation card with preview | `href`, `icon`, `title`, `value`, `subtitle`, `color` |

---

## 5. API Endpoints (Data Contracts)

> **Паттерн:** Кожен route handler просто повертає JSON з `data/api/*.json`.  
> Дані **статичні**: генеруються скриптом `npm run export` (`scripts/export-data.js`).

### `GET /api/dashboard/command`
```json
{
  "revenueTicker": { "current": number, "target": number, "dailyAvg": number, "monthProgress": number },
  "monthComparison": {
    "current": { "orders", "revenue", "avg_check", "margin", "gross_profit", "shipped", "profitability" },
    "previous": { ... same ... },
    "monthProgress": number
  },
  "weeklyWinners": [{ "name", "qty", "revenue", "margin" }],
  "goals": {
    "revenue": { "target", "current", "projected" },
    "orders": { "target", "current", "projected" },
    "margin": { "target", "current" },
    "ship_time": { "target", "current" }
  },
  "alerts": [{ "type": "danger|warning|info", "icon", "text", "action" }],
  "revenueTrend30": [{ "date", "revenue", "orders" }],
  "unitEcon": { "aov", "arpu", "repeat_rate", "return_rate", "orders_per_customer", "total_customers", "new_customers" }
}
```

### `GET /api/dashboard/orders`
```json
{
  "yesterday": { "count", "total", "veteran_sport", "other", "count_change", "total_change" },
  "today": { ... same ... },
  "currentMonth": { "count", "total", "veteran_sport", "other", "count_change", "total_change" },
  "statuses": { "new", "awaiting_payment", "agreement", "production", "returned" },
  "payments": { "paid", "unpaid", "cod" },
  "trend": [{ "name": "DD.MM", "orders", "revenue" }]
}
```

### `GET /api/dashboard/sales`
```json
{
  "totalRevenue": number,
  "byBrands": [{ "brand", "total_qty", "revenue", "avg_price", "margin", "gross_profit", "share" }],
  "bySuppliers": [{ "supplier", "total_qty", "revenue", "avg_price", "margin", "gross_profit", "share" }],
  "byCategories": [{ "category", "total_qty", "revenue", "avg_price", "margin", "gross_profit", "share" }],
  "byBundles": [{ "bundle_name", "total_qty", "revenue", "margin", "gross_profit", "orders_share", "revenue_share" }],
  "topByRevenue": [{ "name", "revenue", "profit" }],
  "topByProfit": [{ "name", "revenue", "profit" }]
}
```

### `GET /api/dashboard/warehouse`
```json
{
  "yesterday": { "shipped", "change" },
  "currentMonth": { "shipped", "change" },
  "queue": { "in_production", "not_packed", "packed_not_shipped", "total_not_shipped" },
  "delays": { "over_24h", "over_48h", "over_72h", "over_96h", "over_120h", "over_144h", "over_168h" },
  "totalDelayed": number,
  "shipmentTrend": [{ "name", "value" }],
  "shipTrend": [{ "name", "value", "shipped" }]
}
```

### `GET /api/dashboard/finance`
```json
{
  "kpis": { "order_count", "total_revenue", "avg_check", "margin", "gross_profit", "profitability" },
  "forecast": { "monthly_expenses", "profit_to_date", "projected_profit" },
  "balance": {
    "total_cash": number,
    "accounts": [{ "id", "name", "type", "balance" }],
    "receivables": { "total", "by_customers", "by_suppliers" },
    "payables": { "total", "by_customers", "by_suppliers" },
    "inventory": { "total_qty", "total_cost" },
    "net_balance": number
  }
}
```

---

## 6. Data Pipeline

```
┌──────────────┐     npm run seed     ┌──────────────┐
│  schema.sql  │ ──────────────────▶  │ mcpanel.db   │
│  (11 tables) │     scripts/seed.js  │ (SQLite)     │
└──────────────┘                      └──────┬───────┘
                                             │
┌──────────────────────────────┐             │  npm run export
│  scripts/export-data.js     │◀────────────┘  (or standalone)
│  Pure config → JSON         │
│  Hardcoded: 25K orders/mo   │
│  21.4M UAH revenue          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  data/api/*.json             │  ◀── committed to git
│  command.json (3.5KB)        │
│  orders.json (822B)          │
│  sales.json (11.8KB)         │
│  warehouse.json (851B)       │
│  finance.json (805B)         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  API Routes                  │  import → NextResponse.json()
│  /api/dashboard/{name}       │  Static JSON, no DB at runtime
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Pages (SWR, 60s refresh)    │  useSWR('/api/dashboard/xxx')
│  Client-side rendering       │
└──────────────────────────────┘
```

**Важливо:**
- Runtime **не використовує SQLite** на Vercel (read-only FS).
- Всі дані — pre-computed JSON, імпортовані через `import data from '...'`.
- Щоб оновити дані: `npm run export` → commit JSON → push → Vercel redeploy.
- **Майбутнє:** CI/CD pipeline (GitHub Actions) для автоматичної генерації JSON з реальних джерел (1C, KEY CRM).

---

## 7. CSS Architecture

**Один файл** `globals.css` (~1990 рядків), організований секціями:

| Секція | Рядки | Зміст |
|---|---|---|
| Design Tokens | 1–74 | CSS Custom Properties (:root) |
| Reset & Base | 76–120 | Resets, body, typography |
| App Layout | 120–180 | .app-layout, .main-area, .page-content |
| Sidebar | 180–380 | Desktop sidebar, collapsible, mobile overlay |
| TopNav | 380–460 | Top bar, tabs, period selector, live indicator |
| Glass Cards | 460–530 | .glass-card-static, hover effects |
| KPI Cards | 530–620 | .kpi-card, .kpi-grid, skeletons |
| DataTable | 620–780 | Desktop table + mobile card list |
| Status Badges | 780–830 | .badge, color variants |
| MiniChart | 830–860 | Chart container styles |
| Command Center | 860–930 | .cmd-* (ticker, goals, alerts, winners, unit) |
| Warehouse | 900–930 | .wh-*, delay bars |
| Drill Links | 930–1050 | .drill-link, .quick-nav-card, clickable cards |
| Mobile Logo | 1050–1060 | .topnav-mobile-logo (hidden on desktop) |
| Splash Screen | 1060–1300 | Animation keyframes, overlay |
| Mobile (≤768px) | 1300–1550 | **Complete mobile override** |
| Desktop Sidebar/TopNav | 1700+ | Base desktop rules |

### Design Tokens (CSS Variables)
```css
--bg-primary: #0A0A0C        --accent-green: #00E676
--bg-card: rgba(22,22,30,0.7) --accent-red: #FF1744
--text-primary: #F0F0F5       --accent-purple: #B388FF
--text-secondary: #7E7E96     --accent-yellow: #F5C518
--space-md: 16px              --radius-md: 10px
--sidebar-width: 240px        --topnav-height: 56px
```

### Mobile-First Standards
| Property | Value |
|---|---|
| Base font | 16px |
| Touch targets | ≥ 48px |
| KPI values | 22px |
| Revenue ticker | 32px |
| Labels | 14px |
| Bottom tabs height | 68px |
| Card padding | 14px |

---

## 8. Responsive Strategy

| Viewport | Layout | Navigation |
|---|---|---|
| **Desktop (>768px)** | Sidebar + TopNav tabs | Sidebar (collapsible) |
| **Mobile (≤768px)** | Full-width, card-based | Bottom Tab Bar (5 tabs) |

**Desktop:** Sidebar зліва (240px, collapsible), TopNav зверху з табами.  
**Mobile:** Sidebar hidden, TopNav shows logo "RE" + period + Live, Bottom tabs for nav.  
DataTable renders as classic table (desktop) or card list (mobile).

---

## 9. Навігаційна карта

```mermaid
graph TD
    CC[/ Command Center]
    O[/orders]
    S[/sales]
    W[/warehouse]
    F[/finance]
    M[/marketing]

    CC -->|"Revenue Ticker → Аналіз продажів"| S
    CC -->|"Ціль Виручка"| S
    CC -->|"Ціль Замовлення"| O
    CC -->|"Ціль Маржа → Фінансова звітність"| F
    CC -->|"Ціль Відвантаження"| W
    CC -->|"Потрібна увага"| W
    CC -->|"Потрібна увага"| O
    CC -->|"ТОП-5 товарів"| S
    CC -->|"Графік замовлень"| O
    CC -->|"Графік відвантажень"| W
    CC -->|"Швидкий доступ"| O
    CC -->|"Швидкий доступ"| S
    CC -->|"Швидкий доступ"| W
    CC -->|"Швидкий доступ"| F

    O -->|"Стан відвантажень"| W
    O -->|"Фінансові показники"| F

    S -->|"Фінансовий аналіз виручки"| F
    S -->|"Деталі замовлень"| O

    W -->|"Замовлення в роботі"| O
    W -->|"Аналіз продажів"| S

    F -->|"Аналіз продажів"| S
    F -->|"Деталі замовлень"| O
```

---

## 10. Database Schema

**11 таблиць** (SQLite, dev-only):

| Таблиця | Назва | Ключові поля |
|---|---|---|
| `brands` | Бренди | id, name, country |
| `categories` | Категорії | id, name, parent_id |
| `suppliers` | Постачальники | id, name, country, contact |
| `customers` | Клієнти | id, name, email, type (retail/wholesale/veteran_sport) |
| `products` | Товари (504 шт) | id, sku, name, brand_id, category_id, supplier_id, price, cost |
| `inventory` | Залишки | product_id, quantity, reserved |
| `orders` | Замовлення | id, customer_id, status, payment_status, total_amount, created_at |
| `order_items` | Позиції | order_id, product_id, quantity, unit_price, unit_cost |
| `finance_accounts` | Рахунки | id, name, type (bank/cash), balance |
| `finance_transactions` | Транзакції | account_id, type (income/expense/transfer), amount |
| `receivables/payables` | Дебіторська/Кредиторська | debtor_type, amount, due_date |
| `expenses` | Витрати | month, category, amount |

---

## 11. npm Scripts

| Script | Команда | Опис |
|---|---|---|
| `npm run dev` | `next dev` | Dev server (localhost:3000) |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Production server |
| `npm run seed` | `node scripts/seed.js` | Заповнити SQLite тестовими даними |
| `npm run export` | `node scripts/export-data.js` | Генерувати JSON з конфігурації |
| `npm run lint` | `eslint` | Лінтинг |

---

## 12. Deployment (Vercel)

1. Push to `main` → Vercel auto-deploy
2. Build: `next build` (Turbopack)
3. API routes serve static JSON (no runtime DB)
4. Environment: `.env.local` (auth credentials commented out)
5. Domain: `mc-panel-race-expert.vercel.app`

---

## 13. Disabled / Planned Features

| Feature | Route | Status |
|---|---|---|
| Company Page | `/company` | `disabled: true` in Sidebar |
| Analytics | `/analytics` | `disabled: true` in Sidebar |
| AI Insights | `/ai` | `disabled: true` in Sidebar |
| Marketing Ads | `/marketing` | Placeholder ("Coming Soon") |
| Search (⌘K) | TopNav button | `disabled`, tooltip "Планується" |
| Basic Auth | middleware | Commented out in `.env.local` |
| Real-time Data | CI/CD | Planned: GitHub Actions → 1C/CRM → JSON |

---

## 14. Conventions & Rules

### Для AI-агента (мене):

1. **Оновлюй цей файл** щоразу, коли:
   - Додається нова сторінка або route
   - Додається/видаляється компонент
   - Змінюється API contract (data shape)
   - Змінюється responsive strategy
   - Додається нова секція в CSS
   - Змінюється data pipeline

2. **CSS:** Всі стилі — в `globals.css`. Не створювати нових CSS файлів.

3. **Компоненти:** Всі в `app/components/`. Client-side (`'use client'`).

4. **Дані:** API routes повертають static JSON. Зміна даних = `npm run export` + commit.

5. **Mobile:** Breakpoint `768px`. Mobile = card-based, 16px base, 48px touch.

6. **Naming:**
   - Pages: `app/{name}/page.js`
   - APIs: `app/api/dashboard/{name}/route.js`
   - Data: `data/api/{name}.json`
   - Components: PascalCase (`KPICard.js`)
   - CSS classes: kebab-case (`cmd-ticker-value`)

7. **Перед push:** Завжди `npx next build` для верифікації.

---

## 15. Changelog (Architecture)

| Дата | Зміна |
|---|---|
| 2026-04-09 | v1.0: Initial deployment (5 pages, SQLite → JSON migration) |
| 2026-04-09 | 7 CEO features (Revenue Ticker, Goals, Alerts, Winners, Trend, Unit Economics) |
| 2026-04-09 | Animated splash screen |
| 2026-04-10 | Mobile-first redesign (cards, 16px base, 48px touch, bottom tabs) |
| 2026-04-10 | Mobile logo (RE), drill-down navigation, cross-page links, QuickNavCards |
