-- ─── ДОВІДНИКИ ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  country   TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  parent_id INTEGER REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  country   TEXT,
  contact   TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  type        TEXT CHECK(type IN ('retail','wholesale','veteran_sport','other'))
              DEFAULT 'retail'
);

-- ─── ТОВАРИ ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY,
  sku           TEXT UNIQUE,
  name          TEXT NOT NULL,
  brand_id      INTEGER REFERENCES brands(id),
  category_id   INTEGER REFERENCES categories(id),
  supplier_id   INTEGER REFERENCES suppliers(id),
  price         REAL NOT NULL,
  cost          REAL NOT NULL,
  is_bundle     INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory (
  id            INTEGER PRIMARY KEY,
  product_id    INTEGER UNIQUE REFERENCES products(id),
  quantity      INTEGER DEFAULT 0,
  reserved      INTEGER DEFAULT 0
);

-- ─── ЗАМОВЛЕННЯ ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id              INTEGER PRIMARY KEY,
  customer_id     INTEGER REFERENCES customers(id),
  status          TEXT CHECK(status IN (
                    'new','awaiting_payment','agreement',
                    'production','returned','delivery','done'
                  )) DEFAULT 'new',
  payment_status  TEXT CHECK(payment_status IN (
                    'paid','unpaid','cod'
                  )) DEFAULT 'unpaid',
  payment_method  TEXT,
  order_type      TEXT CHECK(order_type IN (
                    'veteran_sport','other'
                  )) DEFAULT 'other',

  total_amount    REAL NOT NULL,
  discount        REAL DEFAULT 0,

  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed_at    DATETIME,
  shipped_at      DATETIME,
  completed_at    DATETIME,

  is_packed       INTEGER DEFAULT 0,
  notes           TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id),
  product_id  INTEGER REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_price  REAL NOT NULL,
  unit_cost   REAL NOT NULL
);

-- ─── ФІНАНСИ ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS finance_accounts (
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  type    TEXT CHECK(type IN ('bank','cash','other')),
  balance REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id          INTEGER PRIMARY KEY,
  account_id  INTEGER REFERENCES finance_accounts(id),
  type        TEXT CHECK(type IN ('income','expense','transfer')),
  amount      REAL NOT NULL,
  description TEXT,
  category    TEXT,
  order_id    INTEGER REFERENCES orders(id),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receivables (
  id            INTEGER PRIMARY KEY,
  debtor_type   TEXT CHECK(debtor_type IN ('customer','supplier')),
  debtor_id     INTEGER,
  amount        REAL NOT NULL,
  due_date      DATE,
  description   TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payables (
  id            INTEGER PRIMARY KEY,
  creditor_type TEXT CHECK(creditor_type IN ('customer','supplier')),
  creditor_id   INTEGER,
  amount        REAL NOT NULL,
  due_date      DATE,
  description   TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id          INTEGER PRIMARY KEY,
  month       TEXT NOT NULL,
  category    TEXT NOT NULL,
  amount      REAL NOT NULL,
  description TEXT
);

-- ─── ІНДЕКСИ ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_confirmed_at ON orders(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at   ON orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type   ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date   ON finance_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_product   ON inventory(product_id);
