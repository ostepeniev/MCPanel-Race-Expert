# Race Expert MCPanel — Project Map

> **Живий документ.** Оновлюється щоразу, коли зміни впливають на архітектуру, додаються нові сторінки, компоненти, API-ендпоінти або змінюється data flow.
>
> **Правило:** При кожній зміні, що додає/видаляє сторінку, компонент, API-ендпоінт, CSS-секцію, або змінює data contract — цей файл **ОБОВ'ЯЗКОВО** оновлюється в тому ж коміті.
>
> **Останнє оновлення:** 2026-04-14

---

## 1. Огляд проекту

**MCPanel** (Mission Control Panel) — CEO-дашборд для компанії **Race Expert** (e-commerce, спортивне харчування для бігунів, Україна).  
Призначення: моніторинг бізнес-метрик в реальному часі для прийняття рішень власником.

| Параметр | Значення |
|---|---|
| **Framework** | Next.js 16.2.3 (App Router, Turbopack) |
| **React** | 19.2.4 |
| **CSS** | Vanilla CSS — єдиний файл `globals.css` (1988 рядків, 57.8 KB) |
| **Charts** | Recharts 3.8.1 |
| **Data Fetching** | SWR 2.4.1 (client-side, 60s auto-refresh) |
| **Icons** | Lucide React 1.8.0 |
| **Database** | SQLite (better-sqlite3 12.8.0) — dev & seed only |
| **Hosting** | Vercel (auto-deploy from main) |
| **Repo** | `https://github.com/ostepeniev/MCPanel-Race-Expert.git` |
| **Production URL** | `https://mc-panel-race-expert.vercel.app/` |
| **Language** | Ukrainian (lang="uk") |
| **Font** | Inter (Google Fonts: 400/500/600/700/800) |

---

## 2. Архітектура (File Tree)

```
mcpanel/
├── app/                              # Next.js App Router
│   ├── layout.js                     # Root layout (html, body, AppShell) — 28 lines
│   ├── globals.css                   # Єдиний CSS файл — 1988 lines, 57.8 KB
│   ├── page.js                       # / — Command Center (home) — 20.3 KB
│   ├── page.module.css               # Legacy module CSS (НЕ використовується)
│   ├── favicon.ico                   # Іконка сайту
│   │
│   ├── orders/page.js                # /orders — Замовлення — 6.8 KB
│   ├── sales/page.js                 # /sales — Продажі — 7.3 KB
│   ├── warehouse/page.js             # /warehouse — Склад — 6.5 KB
│   ├── finance/page.js               # /finance — Фінанси — 8.6 KB
│   ├── marketing/page.js             # /marketing — Маркетинг (placeholder) — 2.1 KB
│   │
│   ├── components/                   # 10 Shared UI Components
│   │   ├── AppShell.js               # Layout wrapper (35 lines)
│   │   ├── Sidebar.js                # Desktop sidebar navigation (127 lines)
│   │   ├── TopNav.js                 # Top bar + mobile logo (95 lines)
│   │   ├── MobileBottomTabs.js       # Bottom tab bar, mobile only (35 lines)
│   │   ├── SplashScreen.js           # Animated intro, session-once (92 lines)
│   │   ├── KPICard.js                # KPI metric card (45 lines)
│   │   ├── DataTable.js              # Responsive table/cards (156 lines)
│   │   ├── MiniChart.js              # Recharts AreaChart wrapper (73 lines)
│   │   ├── StatusBadge.js            # Order/payment badges + DelayIndicator (57 lines)
│   │   └── DrillLink.js              # Navigation links + QuickNavCard (41 lines)
│   │
│   └── api/dashboard/                # 5 API Route Handlers
│       ├── command/route.js          # GET /api/dashboard/command
│       ├── orders/route.js           # GET /api/dashboard/orders
│       ├── sales/route.js            # GET /api/dashboard/sales
│       ├── warehouse/route.js        # GET /api/dashboard/warehouse
│       └── finance/route.js          # GET /api/dashboard/finance
│
├── data/                             # Data layer
│   ├── mcpanel.db                    # SQLite DB (~820 KB, dev seed data)
│   ├── mcpanel.db-shm               # SQLite shared memory
│   ├── mcpanel.db-wal                # SQLite write-ahead log
│   └── api/                          # Pre-computed JSON (production runtime)
│       ├── command.json              # 3.5 KB — Command Center aggregations
│       ├── orders.json               # 822 B — Orders metrics
│       ├── sales.json                # 11.8 KB — Sales by brands/suppliers/categories/bundles
│       ├── warehouse.json            # 851 B — Shipment metrics + delays
│       └── finance.json              # 805 B — Financial KPIs + balance
│
├── lib/                              # Shared modules
│   ├── db.js                         # SQLite connection (Vercel-aware, read-only on prod)
│   └── schema.sql                    # Database schema (11 tables, 9 indexes)
│
├── scripts/                          # CLI tooling
│   ├── seed.js                       # Database seeder (47.5 KB) — populates SQLite
│   ├── export-data.js                # JSON generator (24.6 KB) — config → data/api/*.json
│   └── data/
│       └── products.json             # 504 products reference catalogue (24.2 KB)
│
├── public/                           # Static assets
│   ├── logo.svg                      # Race Expert logo (667 B)
│   ├── file.svg, globe.svg           # Default Next.js icons
│   ├── next.svg, vercel.svg          # Framework logos
│   └── window.svg                    # Default Next.js icon
│
├── PROJECT_MAP.md                    # ← ЦЕЙ ФАЙЛ (жива карта проекту)
├── AGENTS.md                         # AI agent rules for Next.js 16
├── CLAUDE.md                         # Claude agent config
├── README.md                         # Project readme
├── .env.local                        # Environment (auth commented out)
├── package.json                      # Dependencies & npm scripts
├── package-lock.json                 # Lock file (238 KB)
├── next.config.mjs                   # Next.js config (default, empty)
├── jsconfig.json                     # JS path config
├── eslint.config.mjs                 # ESLint config
└── .gitignore                        # Git ignore rules
```

### Статистика кодової бази

| Категорія | Файлів | Загальний розмір |
|---|---|---|
| Pages (app/*.js) | 6 | ~51 KB |
| Components | 10 | ~25 KB |
| API Routes | 5 | ~825 B |
| CSS | 1 | 57.8 KB |
| Data JSON | 5 | ~17.7 KB |
| Scripts | 2 | ~72 KB |
| **Всього (без node_modules)** | **~35 файлів** | **~225 KB** |

---

## 3. Сторінки та їх функції

### 3.1. `/` — Command Center (app/page.js, 20.3 KB)

**Головна сторінка власника.** Зведена інформація по всіх блоках. Найбільший файл — містить inline-компоненти `AnimatedNumber`, `ProgressRing`.

| Секція | JSON ключ (command.json) | Drill-down | Опис |
|---|---|---|---|
| Revenue Ticker | `revenueTicker` | → `/sales` | Великий тікер виручки + прогрес бар до місячної цілі |
| Goal Tracker (4 кільця) | `goals` | revenue→`/sales`, orders→`/orders`, margin→`/finance`, ship_time→`/warehouse` | Прогрес-кільця з прогнозом |
| Цей місяць vs Минулий | `monthComparison` | → `/finance` | Таблиця порівняння 7 метрик |
| Потрібна увага (alerts) | `alerts` | danger→`/warehouse`, warning→`/orders` | Клікабельні алерти |
| ТОП-5 товарів тижня | `weeklyWinners` | → `/sales` | Таблиця лідерів |
| Виручка за 30 днів (chart) | `revenueTrend30` | — | MiniChart, area graph |
| Unit Economics | `unitEcon` | — | AOV, ARPU, repeat rate, return rate, LTV |
| Замовлення 7 днів (chart) | via orders API | → `/orders` | MiniChart |
| Відвантаження 7 днів (chart) | via warehouse API | → `/warehouse` | MiniChart |
| Швидкий доступ (4 cards) | mixed | → all pages | QuickNavCard з превʼю значень |

**Inline-компоненти:** `AnimatedNumber` (counting animation), `ProgressRing` (SVG donut chart)

### 3.2. `/orders` — Замовлення (app/orders/page.js, 6.8 KB)

**Блок 1** — KEY CRM дані (оплачені + післяплата).

| Секція | JSON ключ | Опис |
|---|---|---|
| KPI Grid — Вчора / Сьогодні / Місяць | `yesterday`, `today`, `currentMonth` | 3 glass-cards у grid-3 |
| Статуси замовлень | `statuses` | 5 StatusBadge (new, awaiting_payment, agreement, production, returned) |
| Оплати | `payments` | 3 progress bars (paid, unpaid, cod) |
| Графік 7 днів | `trend` | MiniChart (area, orders) |
| Cross-links | — | → `/warehouse`, → `/finance` |

### 3.3. `/sales` — Продажі (app/sales/page.js, 7.3 KB)

**Блок 2** — дані з 1С (поточний місяць).

| Секція | JSON ключ | Опис |
|---|---|---|
| KPI | `totalRevenue`, counts | Загальна виручка + кількість брендів/категорій |
| Продажі по брендах | `byBrands` | DataTable, 25 рядків |
| Продажі по постачальниках | `bySuppliers` | DataTable, 11 рядків |
| Продажі по категоріях | `byCategories` | DataTable, 15 рядків |
| Продажі наборів | `byBundles` | DataTable, 15 рядків |
| ТОП-10 по виручці (chart) | `topByRevenue` | Recharts BarChart (горизонтальний) |
| ТОП-10 по прибутку (chart) | `topByProfit` | Recharts BarChart (горизонтальний) |
| Cross-links | — | → `/finance`, → `/orders` |

### 3.4. `/warehouse` — Склад (app/warehouse/page.js, 6.5 KB)

**Блок 3** — відвантаження та затримки.

| Секція | JSON ключ | Опис |
|---|---|---|
| KPI cards | `yesterday`, `currentMonth` | Відвантажено + % зміни |
| Черга відвантажень | `queue` | in_production, not_packed, packed_not_shipped |
| Затримки | `delays` | 6 delay buckets (24h → 168h), кольорові бари |
| Графік відвантажень | `shipmentTrend` | MiniChart |
| Залишки | `totalDelayed` | Загальна кількість затриманих |
| Cross-links | — | → `/orders`, → `/sales` |

### 3.5. `/finance` — Фінанси (app/finance/page.js, 8.6 KB)

**Блок 4** — фінансові показники (дані з 1С).

| Секція | JSON ключ | Опис |
|---|---|---|
| KPI Grid (6 карток) | `kpis` | order_count, total_revenue, avg_check, margin, gross_profit, profitability |
| Прогнози (3 картки) | `forecast` | monthly_expenses, profit_to_date, projected_profit |
| Баланс по рахунках | `balance.accounts` | 4 рахунки (Приватбанк, Mono, Каса, Резервний) |
| Дебіторська заборгованість | `balance.receivables` | by_customers, by_suppliers |
| Кредиторська заборгованість | `balance.payables` | by_customers, by_suppliers |
| Залишки на складі | `balance.inventory` | total_qty, total_cost |
| Чистий баланс | `balance.net_balance` | Великий кольоровий індикатор |
| Cross-links | — | → `/sales`, → `/orders` |

### 3.6. `/marketing` — Маркетинг (app/marketing/page.js, 2.1 KB)

**Placeholder** — "Coming Soon". Planned: Google Ads, Meta Ads, Analytics ROI/CAC/LTV.

---

## 4. Компоненти

### 4.1. Каталог компонентів

| # | Компонент | Файл | Рядків | Призначення |
|---|---|---|---|---|
| 1 | `AppShell` | `AppShell.js` | 35 | Layout wrapper: Splash → Sidebar + TopNav + BottomTabs + children |
| 2 | `Sidebar` | `Sidebar.js` | 127 | Desktop: collapsible nav (4 секції, 8 пунктів). Mobile: drawer overlay |
| 3 | `TopNav` | `TopNav.js` | 95 | Desktop: tab bar + period + search + live. Mobile: RE logo + period + live |
| 4 | `MobileBottomTabs` | `MobileBottomTabs.js` | 35 | 5 bottom tabs (Головна, Замовлення, Продажі, Склад, Фінанси) |
| 5 | `SplashScreen` | `SplashScreen.js` | 92 | Animated intro (5s), SVG chevrons, brand + tagline + loader bar |
| 6 | `KPICard` | `KPICard.js` | 45 | Metric card: value + label + trend arrow (TrendingUp/Down/Minus) |
| 7 | `DataTable` | `DataTable.js` | 156 | Desktop: sortable table. Mobile: card list (1st col = title, rest = metrics) |
| 8 | `MiniChart` | `MiniChart.js` | 73 | Recharts AreaChart wrapper with gradient fill, custom tooltip |
| 9 | `StatusBadge` | `StatusBadge.js` | 57 | Colored badge for 10 order/payment statuses. Exports `DelayIndicator` |
| 10 | `DrillLink` | `DrillLink.js` | 41 | Block/inline nav button with →. Exports `QuickNavCard` |

### 4.2. Props Reference

```
AppShell        { children }
Sidebar         — (uses usePathname, internal state: collapsed, mobileOpen)
TopNav          { period, onPeriodChange }
MobileBottomTabs — (uses usePathname)
SplashScreen    { onComplete }
KPICard         { value, label, icon, change, prefix, suffix, isLoading, className }
DataTable       { columns[], data[], isLoading, title, subtitle }
MiniChart       { data[], dataKey, color, height, showAxis, showTooltip }
StatusBadge     { status }
DelayIndicator  { hours }
DrillLink       { href, label, variant="block"|"inline", icon }
QuickNavCard    { href, icon, title, value, subtitle, color }
```

### 4.3. Sidebar Navigation Structure

```
MAIN
├── Command Center    /           LayoutDashboard
└── Компанія          /company    Building2        [disabled]

ОПЕРАЦІЇ
├── Замовлення        /orders     Package
├── Продажі           /sales      DollarSign
├── Склад             /warehouse  Factory
├── Аналітика         /analytics  BarChart3        [disabled]
└── Маркетинг         /marketing  Megaphone

ФІНАНСИ
└── Фінанси           /finance    Landmark

AI
└── AI Інсайти        /ai         Bot              [disabled]
```

---

## 5. API Endpoints (Data Contracts)

> **Паттерн:** Кожен route handler — 7 рядків. Імпортує static JSON → `NextResponse.json(data)`.  
> Дані **pre-computed:** генеруються скриптом `npm run export` (`scripts/export-data.js`).  
> На Vercel — read-only filesystem, runtime DB не використовується.

### `GET /api/dashboard/command` (3.5 KB)

```typescript
{
  revenueTicker: {
    current: number,       // 6_435_000
    target: number,        // 25_000_000
    dailyAvg: number,      // 715_000
    monthProgress: number  // 0.3
  },
  monthComparison: {
    current: { orders, revenue, avg_check, margin, gross_profit, shipped, profitability },
    previous: { ...same... },
    monthProgress: number
  },
  weeklyWinners: [{ name: string, qty: number, revenue: number, margin: number }],  // 5 items
  goals: {
    revenue:   { target, current, projected },
    orders:    { target, current, projected },
    margin:    { target, current },
    ship_time: { target, current }
  },
  alerts: [{
    type: "danger" | "warning" | "info",
    icon: string,
    text: string,
    action: string
  }],                                                     // 5 items
  revenueTrend30: [{ date: "DD.MM", revenue, orders }],   // 30 items
  unitEcon: {
    aov, arpu, repeat_rate, return_rate,
    orders_per_customer, total_customers, new_customers
  }
}
```

### `GET /api/dashboard/orders` (822 B)

```typescript
{
  yesterday:    { count, total, veteran_sport, other, count_change, total_change },
  today:        { ...same... },
  currentMonth: { ...same... },
  statuses: { new, awaiting_payment, agreement, production, returned },    // 5 keys
  payments: { paid, unpaid, cod },                                          // 3 keys
  trend: [{ name: "DD.MM", orders: number, revenue: number }]              // 7 items
}
```

### `GET /api/dashboard/sales` (11.8 KB)

```typescript
{
  totalRevenue: number,
  byBrands:     [{ brand, total_qty, revenue, avg_price, margin, gross_profit, share }],     // 25 items
  bySuppliers:  [{ supplier, total_qty, revenue, avg_price, margin, gross_profit, share }],   // 11 items
  byCategories: [{ category, total_qty, revenue, avg_price, margin, gross_profit, share }],   // 15 items
  byBundles:    [{ bundle_name, total_qty, revenue, margin, gross_profit, orders_share, revenue_share }], // 15
  topByRevenue: [{ name, revenue, profit }],   // 12 items
  topByProfit:  [{ name, revenue, profit }]    // 12 items
}
```

### `GET /api/dashboard/warehouse` (851 B)

```typescript
{
  yesterday:    { shipped: number, change: number },
  currentMonth: { shipped: number, change: number },
  queue: { in_production, not_packed, packed_not_shipped, total_not_shipped },
  delays: { over_24h, over_48h, over_72h, over_96h, over_120h, over_144h, over_168h },
  totalDelayed: number,
  shipmentTrend: [{ name: "DD.MM", value: number }],              // 7 items
  shipTrend:     [{ name: "DD.MM", value: number, shipped: number }]  // 7 items
}
```

### `GET /api/dashboard/finance` (805 B)

```typescript
{
  kpis: { order_count, total_revenue, avg_check, margin, gross_profit, profitability },
  forecast: { monthly_expenses, profit_to_date, projected_profit },
  balance: {
    total_cash: number,
    accounts: [{ id, name, type: "bank"|"cash", balance }],   // 4 items
    receivables: { total, by_customers, by_suppliers },
    payables:    { total, by_customers, by_suppliers },
    inventory:   { total_qty, total_cost },
    net_balance: number
  }
}
```

---

## 6. Data Pipeline

```
                                    ┌─────────────────────────┐
                                    │  scripts/export-data.js │
                                    │  (24.6 KB)              │
                                    │                         │
                                    │  Hardcoded config:      │
                                    │  • 24,850 orders/month  │
                                    │  • 21.4M UAH revenue    │
                                    │  • 47.5% margin         │
                                    │  • 25 brands            │
                                    │  • 15 categories        │
                                    │  • 15 bundles           │
                                    └────────────┬────────────┘
                                                 │
                                    npm run export
                                                 │
                                                 ▼
                                    ┌─────────────────────────┐
                                    │  data/api/*.json        │
                                    │  (committed to git)     │
                                    │                         │
                                    │  command.json   3.5 KB  │
                                    │  orders.json    822 B   │
                                    │  sales.json    11.8 KB  │
                                    │  warehouse.json  851 B  │
                                    │  finance.json    805 B  │
                                    └────────────┬────────────┘
                                                 │
                               import data from '...'
                                                 │
                                                 ▼
                                    ┌─────────────────────────┐
                                    │  API Routes             │
                                    │  /api/dashboard/{name}  │
                                    │                         │
                                    │  Each: 7 lines          │
                                    │  → NextResponse.json()  │
                                    └────────────┬────────────┘
                                                 │
                                    SWR (60s refresh)
                                                 │
                                                 ▼
                                    ┌─────────────────────────┐
                                    │  Pages                  │
                                    │  Client-side render     │
                                    │  useSWR() → components  │
                                    └─────────────────────────┘
```

**Важливо:**
- На **Vercel** runtime **НЕ** використовує SQLite (read-only FS). Всі дані — static JSON.
- SQLite (`data/mcpanel.db`) існує тільки для dev-сценарію, наповнюється через `npm run seed`.
- Щоб оновити дані: відредагувати конфіг в `export-data.js` → `npm run export` → commit JSON → push → Vercel redeploy автоматично.
- **Майбутнє:** CI/CD pipeline (GitHub Actions) для автоматичної генерації JSON з реальних джерел (1C, KEY CRM API).

---

## 7. CSS Architecture

**Один файл** `app/globals.css` — 1988 рядків, 57.8 KB.  
**Design system:** dark theme, glassmorphism, Inter font.

### 7.1. Секції файлу

| # | Рядки | Секція | Опис |
|---|---|---|---|
| 1 | 1–7 | Google Fonts | `@import` Inter |
| 2 | 9–74 | CSS Custom Properties | `:root` — 34 design tokens |
| 3 | 76–109 | Reset & Base | Box-sizing, html/body/a/button |
| 4 | 110–149 | App Layout | `.app-layout`, `.main-area`, `.page-content`, `.page-header` |
| 5 | 150–174 | Glass Card | `.glass-card`, `.glass-card-static` |
| 6 | 175–265 | KPI Card | `.kpi-card`, `.kpi-grid`, `.kpi-value`, `.kpi-change` |
| 7 | 266–309 | Skeleton Loader | `.skeleton-value`, `.skeleton-label`, animations |
| 8 | 310–387 | Data Table | `.dt-wrapper`, desktop `.dt-table`, mobile `.dt-card-list` |
| 9 | 388–430 | Status Badges | `.badge`, `.badge-green/red/yellow/purple/blue/orange` |
| 10 | 431–459 | Delay Indicators | `.delay-bar`, `.delay-24h` → `.delay-120h` |
| 11 | 460–486 | Section Headers | `.cmd-section-title`, `.page-section` |
| 12 | 487–505 | Grid Helpers | `.grid-2`, `.grid-3`, `.grid-4` |
| 13 | 506–555 | Quick Actions | `.quick-action-grid` |
| 14 | 556–592 | Insight Card | `.insight-card` |
| 15 | 593–628 | Coming Soon | `.coming-soon`, `.coming-soon-icon/title/desc/badge` |
| 16 | 629–639 | Charts | `.recharts-tooltip-*` |
| 17 | 640–658 | Scrollbar | Custom webkit scrollbar |
| 18 | 659–926 | **Command Center** | `.cmd-*` (ticker, goals, alerts, winners, unit econ, warehouse) |
| 19 | 928–1048 | **Drill Links & Quick Nav** | `.drill-link`, `.quick-nav-card`, `.cmd-goal-clickable`, `.cmd-alert-clickable`, `.topnav-mobile-logo` (hidden desktop) |
| 20 | 1049–1248 | **Splash Screen** | `.splash-*`, animations, keyframes |
| 21 | 1249–1293 | **Tablet (≤1024px)** | `@media (max-width: 1024px)` — grids, kpi, topnav, finance |
| 22 | 1294–1627 | **Phone (≤768px)** | `@media (max-width: 768px)` — complete mobile override |
| 23 | 1629–1636 | **Print** | `@media print` — hide nav, reset padding |
| 24 | 1639–1831 | Sidebar (base) | `.sidebar`, `.sidebar-logo`, `.sidebar-nav`, `.sidebar-item` |
| 25 | 1832–1989 | TopNav (base) | `.topnav`, `.topnav-tabs`, `.topnav-period`, `.topnav-live` |

### 7.2. Design Tokens (CSS Variables)

```css
/* Backgrounds */
--bg-primary: #0A0A0C          --bg-card: rgba(22,22,30,0.7)
--bg-secondary: #111114        --bg-card-hover: rgba(30,30,42,0.85)
--bg-sidebar: #0E0E11          --bg-card-solid: #16161E
--bg-topnav: rgba(14,14,17,0.85) --bg-input: rgba(255,255,255,0.04)

/* Borders */
--border-subtle: rgba(255,255,255,0.06)
--border-card: rgba(255,255,255,0.08)
--border-active: rgba(255,255,255,0.12)

/* Text */
--text-primary: #F0F0F5        --text-secondary: #7E7E96
--text-muted: #4E4E62          --text-inverse: #0A0A0C

/* Accents */
--accent-green: #00E676        --accent-red: #FF1744
--accent-yellow: #F5C518       --accent-orange: #FF8C00
--accent-purple: #B388FF       --accent-blue: #448AFF
--accent-cyan: #18FFFF         --accent-dark-orange: #FF5500

/* Spacing: xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48 */
/* Radius: sm=6, md=10, lg=14, xl=20 */
/* Layout: sidebar-width=240px, topnav-height=56px */
/* Transitions: fast=150ms, normal=250ms, slow=400ms */
```

### 7.3. Mobile Standards (≤768px)

| Property | Desktop | Mobile |
|---|---|---|
| Base font | 14px | **16px** |
| KPI values | — | **22px** |
| Revenue ticker | — | **32px** |
| Labels | — | **14px** |
| Touch targets | — | **≥ 48px** |
| Bottom tabs height | — | **68px** |
| TopNav height | 56px | **52px** |
| Card padding | 24px | **14px** |
| Sidebar | 240px visible | **Hidden** (drawer) |
| TopNav tabs | Visible | **Hidden** (!important) |
| Search button | Visible | **Hidden** (!important) |
| Mobile logo (RE) | Hidden | **Visible** (!important) |
| Bottom tabs | Hidden | **Visible** (sticky bottom) |
| DataTable | Classic `<table>` | **Cards** (dt-card-list) |

---

## 8. Responsive Strategy

| Breakpoint | Target | Layout | Navigation |
|---|---|---|---|
| `>1024px` | Desktop | Sidebar + TopNav tabs | Sidebar (collapsible) |
| `≤1024px` | Tablet | Grid adjustments, smaller topnav | TopNav tabs + sidebar |
| `≤768px` | **Phone** | Full-width cards, 16px base | **Bottom Tab Bar** (5 tabs) |

**Phone key changes:**
- Sidebar → hidden drawer (mobile toggle hidden, RE logo replaces it)
- TopNav → RE logo zліва, period selector, Live indicator
- Tables → cards (each row = card with name + 2x2 metric grid)
- Grids → single column
- KPI grid → 2 columns

---

## 9. Навігаційна карта (Cross-Links)

```
                    ┌─────────────────────────────────━━━┐
                    │         COMMAND CENTER (/)          │
                    │                                     │
                    │  Revenue Ticker ──────────→ /sales  │
                    │  Goal: Виручка ──────────→ /sales  │
                    │  Goal: Замовлення ───────→ /orders │
                    │  Goal: Маржа ────────────→ /finance│
                    │  Goal: Час відвантаження ─→ /warehouse│
                    │  Alerts (danger) ────────→ /warehouse│
                    │  Alerts (warning) ───────→ /orders │
                    │  ТОП-5 товарів ──────────→ /sales  │
                    │  Chart замовлень ────────→ /orders │
                    │  Chart відвантажень ─────→ /warehouse│
                    │  QuickNav (4 cards) ─────→ ALL     │
                    └─────────────────────────────────━━━┘

    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │   /orders    │     │   /sales     │     │  /warehouse  │     │  /finance    │
    │              │     │              │     │              │     │              │
    │  → /warehouse│     │  → /finance  │     │  → /orders   │     │  → /sales    │
    │  → /finance  │     │  → /orders   │     │  → /sales    │     │  → /orders   │
    └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 10. Database Schema (dev only)

**11 таблиць, 9 індексів** — `lib/schema.sql` (149 рядків)

| Таблиця | Призначення | Ключові поля |
|---|---|---|
| `brands` | Бренди (25) | id, name, country |
| `categories` | Категорії (15) | id, name, parent_id |
| `suppliers` | Постачальники (11) | id, name, country, contact |
| `customers` | Клієнти (~14.7K) | id, name, email, type (retail/wholesale/veteran_sport/other) |
| `products` | Товари (504) | id, sku, name, brand_id, category_id, supplier_id, price, cost, is_bundle |
| `inventory` | Залишки | product_id (unique), quantity, reserved |
| `orders` | Замовлення (~25K/mo) | customer_id, status (7 values), payment_status (3), total_amount, timestamps |
| `order_items` | Позиції замовлень | order_id, product_id, quantity, unit_price, unit_cost |
| `finance_accounts` | Рахунки (4) | name, type (bank/cash/other), balance |
| `finance_transactions` | Транзакції | account_id, type (income/expense/transfer), amount, category |
| `receivables` / `payables` | Дебіторська / Кредиторська | debtor_type, amount, due_date |
| `expenses` | Витрати | month, category, amount |

**Індекси:** `orders(status)`, `orders(created_at)`, `orders(confirmed_at)`, `orders(shipped_at)`, `order_items(order_id)`, `order_items(product_id)`, `finance_transactions(type)`, `finance_transactions(created_at)`, `inventory(product_id)`

---

## 11. npm Scripts

| Script | Команда | Опис |
|---|---|---|
| `npm run dev` | `next dev` | Dev server (localhost:3000) |
| `npm run build` | `next build` | Production build (Turbopack) |
| `npm run start` | `next start` | Production server |
| `npm run seed` | `node scripts/seed.js` | Заповнити SQLite тестовими даними |
| `npm run export` | `node scripts/export-data.js` | Згенерувати `data/api/*.json` з конфігурації |
| `npm run lint` | `eslint` | Лінтинг ESLint |

---

## 12. Deployment (Vercel)

| Параметр | Значення |
|---|---|
| Provider | Vercel |
| Branch | `main` |
| Auto-deploy | ✅ Push to main → auto-build → deploy |
| Build command | `next build` (Turbopack) |
| Output | Serverless + Static |
| Domain | `mc-panel-race-expert.vercel.app` |
| Runtime DB | ❌ Read-only FS, JSON imports only |
| Environment | `.env.local` (auth credentials commented out) |

---

## 13. Disabled / Planned Features

| Feature | Route | Sidebar Status | Деталі |
|---|---|---|---|
| Company Page | `/company` | `disabled: true` | Інформація про компанію |
| Analytics | `/analytics` | `disabled: true` | Розширена аналітика |
| AI Insights | `/ai` | `disabled: true` | AI-рекомендації |
| Marketing Ads | `/marketing` | active (placeholder) | Google Ads, Meta Ads, ROI/CAC/LTV |
| Search (⌘K) | TopNav button | `disabled` | Глобальний пошук |
| Basic Auth | middleware | commented out | `ADMIN_USER / ADMIN_PASS` |
| Real-time Data | CI/CD | planned | GitHub Actions → 1C/CRM API → JSON |

---

## 14. Conventions & Rules

### Для AI-агента:

1. **🔄 ОНОВЛЮЙ PROJECT_MAP.md** при кожній зміні, що:
   - Додає/видаляє сторінку (route)
   - Додає/видаляє компонент
   - Змінює API data contract (JSON shape)
   - Додає нову CSS-секцію
   - Змінює responsive breakpoints
   - Змінює data pipeline або deployment

2. **CSS:** Всі стилі — ТІЛЬКИ в `app/globals.css`. Нових CSS файлів НЕ створювати.

3. **Компоненти:** Всі в `app/components/`. Кожен — `'use client'`. PascalCase.

4. **Дані:** API routes повертають static JSON. Зміна даних = `npm run export` + commit.

5. **Mobile-first:** Breakpoint `768px`. Mobile = card-based, 16px base, ≥48px touch targets.

6. **Іменування:**
   - Pages: `app/{name}/page.js`
   - APIs: `app/api/dashboard/{name}/route.js`
   - Data: `data/api/{name}.json`
   - Components: PascalCase (`KPICard.js`)
   - CSS classes: kebab-case (`cmd-ticker-value`)
   - CSS sections: коментарі з `─── Section Name ───`

7. **Перед push:** Завжди `npx next build` для верифікації.

8. **Git commits:** Semantic format: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`

---

## 15. Changelog (Architecture)

| Дата | Зміна | Commit |
|---|---|---|
| 2026-04-09 | v1.0: Initial deployment (5 pages, SQLite runtime) | `e65d966` |
| 2026-04-09 | SQLite → static JSON migration for Vercel | `5937e00` |
| 2026-04-09 | Remove deprecated middleware.js | `08c839f` |
| 2026-04-09 | Realistic data: 25K orders/month, 21.4M UAH | `1a1d454` |
| 2026-04-09 | 7 CEO features: Revenue Ticker, Goal Tracker, Month Comparison, Alerts, Weekly Winners, 30-day Trend, Unit Economics | `d7d13a2` |
| 2026-04-10 | Animated splash screen (5s, session-once) | `3f48ed9` |
| 2026-04-10 | Mobile responsive: CSS classes instead of inline styles | `80d00d6` |
| 2026-04-10 | Capital mobile rewrite: cards, scrollable tables | `c7702d5` |
| 2026-04-10 | **True mobile-first redesign:** 16px fonts, 48px touch, card layouts, bottom tabs, hidden top tabs | `38e82d9` |
| 2026-04-10 | Mobile logo (RE), drill-down navigation, cross-page links, QuickNavCards, clickable goals/alerts | `dd17e6b` |
| 2026-04-10 | PROJECT_MAP.md — living architecture document | `b13c20b` |
