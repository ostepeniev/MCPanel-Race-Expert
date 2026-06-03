const { deflateSync } = require('zlib');

function toMermaidLiveUrl(code) {
  const json = JSON.stringify({
    code,
    mermaid: { theme: 'dark' },
    autoSync: true,
    updateDiagram: true,
  });
  const compressed = deflateSync(json, { level: 9 });
  const encoded = compressed.toString('base64url');
  return 'https://mermaid.live/edit#pako:' + encoded;
}

// ── Diagram 1: Architecture ──
const d1 = `graph TB
    subgraph BROWSER["Iнтерфейс CEO"]
        LOGIN["Захищений вхiд"]
        DASH["Command Center"]
        ORDERS["Замовлення"]
        SALES["Продажi"]
        WH["Склад"]
        FIN["Фiнанси"]
        ALERTS["Smart Alerts"]
        SETTINGS["Налаштування"]
    end
    subgraph SERVER["Сервер Next.js + Node.js"]
        AUTH["Авторизацiя RBAC"]
        API["9 бiзнес-модулiв"]
        EVENTBUS["Event Bus"]
        LOGGER["Логування 4 канали"]
        CRON["Cron Scheduler"]
        ALERTENG["Alert Engine"]
    end
    subgraph EXTERNAL["Зовнiшнi системи"]
        KEYCRM["KEY CRM API"]
        MONO["MonoPay API"]
        ONEC["1C"]
    end
    subgraph INFRA["Iнфраструктура"]
        DB["PostgreSQL 18 таблиць"]
        LOGS["Логи 90 днiв"]
        PM2["PM2 авто-рестарт"]
        NGINX["Nginx + SSL"]
    end
    BROWSER --> AUTH
    AUTH --> API
    API --> DB
    API --> EVENTBUS
    EVENTBUS --> ALERTENG
    CRON --> KEYCRM
    CRON --> MONO
    CRON --> ONEC
    CRON --> DB
    ALERTENG --> ALERTS
    LOGGER --> LOGS
    SERVER --> INFRA
    style BROWSER fill:#1a1a2e,stroke:#00E676,color:#fff
    style SERVER fill:#16213e,stroke:#448AFF,color:#fff
    style EXTERNAL fill:#0f3460,stroke:#FFD740,color:#fff
    style INFRA fill:#1a1a2e,stroke:#FF3D3D,color:#fff`;

// ── Diagram 2: Modules ──
const d2 = `graph LR
    subgraph MODULES["src/modules/ — 9 iзольованих модулiв"]
        AUTH["auth"]
        CMD["command"]
        ORD["orders"]
        SAL["sales"]
        WH["warehouse"]
        FIN["finance"]
        SYNC["sync"]
        ALR["alerts"]
        ADM["admin"]
    end
    subgraph STRUCTURE["Кожен модуль має:"]
        A["api/ — публiчний iнтерфейс"]
        D["domain/ — бiзнес-логiка"]
        DA["data/ — робота з БД"]
        U["ui/ — iнтерфейс"]
        R["README.md — документацiя"]
    end
    AUTH --> A
    CMD --> A
    ORD --> A
    style MODULES fill:#1a1a2e,stroke:#00E676,color:#fff
    style STRUCTURE fill:#16213e,stroke:#448AFF,color:#fff`;

// ── Diagram 3: AI ──
const d3 = `graph TB
    CEO["CEO: Чому впала маржа на 226ERS?"]
    AI["AI Agent GPT-4 / Claude"]
    API["MCPanel API"]
    DB["PostgreSQL"]
    ANSWER["Маржа впала через зростання закупiвельної цiни на 8%"]
    CEO --> AI
    AI --> API
    API --> DB
    DB --> AI
    AI --> ANSWER
    style CEO fill:#1a1a2e,stroke:#00E676,color:#fff
    style AI fill:#16213e,stroke:#FFD740,color:#fff
    style ANSWER fill:#0f3460,stroke:#00E676,color:#fff`;

// ── Diagram 4: Handoff ──
const d4 = `graph LR
    A["Документацiя вже є"] --> B["Новий розробник читає README"]
    B --> C["Вивчає 1 модуль"]
    C --> D["Робить змiну, ESLint перевiряє"]
    D --> E["Тестує npm run dev"]
    E --> F["Деплоїть git push"]
    style A fill:#1a1a2e,stroke:#00E676,color:#fff
    style F fill:#0f3460,stroke:#00E676,color:#fff`;

console.log('=== DIAGRAM 1: Архітектура MCPanel v2.0 ===');
console.log(toMermaidLiveUrl(d1));
console.log();
console.log('=== DIAGRAM 2: Модульна архітектура ===');
console.log(toMermaidLiveUrl(d2));
console.log();
console.log('=== DIAGRAM 3: Фундамент для AI ===');
console.log(toMermaidLiveUrl(d3));
console.log();
console.log('=== DIAGRAM 4: Сценарій передачі ===');
console.log(toMermaidLiveUrl(d4));
