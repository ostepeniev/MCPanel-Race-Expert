/**
 * Export script — pre-computes all dashboard API data as static JSON files.
 * Run before `next build` so API routes can read from JSON on Vercel.
 * 
 * Usage: node scripts/export-data.js
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'mcpanel.db');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'api');

// ─── Helpers ──────────────────────────────────────────────────

function formatDatetime(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

function pctChange(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous * 100);
}

// ─── Main ─────────────────────────────────────────────────────

function exportData() {
  console.log('📦 Exporting dashboard data...\n');

  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database not found. Run `node scripts/seed.js` first.');
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });
  db.pragma('foreign_keys = ON');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // ─── 1. ORDERS ──────────────────────────────────────────
  const now = new Date();
  const todayStart = formatDatetime(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const yesterdayStart = formatDatetime(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const dayBeforeStart = formatDatetime(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));
  const monthStart = formatDatetime(new Date(now.getFullYear(), now.getMonth(), 1));
  const prevMonthStart = formatDatetime(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevMonthEnd = formatDatetime(new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59));

  const countOrders = (whereClause, params = []) => {
    return db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE (payment_status IN ('paid','cod') OR payment_method = 'nova_poshta')
      AND ${whereClause}
    `).get(...params);
  };

  const countByType = (whereClause, params = []) => {
    const rows = db.prepare(`
      SELECT order_type, COUNT(*) as count
      FROM orders
      WHERE (payment_status IN ('paid','cod') OR payment_method = 'nova_poshta')
      AND ${whereClause}
      GROUP BY order_type
    `).all(...params);
    const result = { veteran_sport: 0, other: 0 };
    rows.forEach(r => { result[r.order_type] = r.count; });
    return result;
  };

  const yesterday = countOrders('created_at >= ? AND created_at < ?', [yesterdayStart, todayStart]);
  const dayBefore = countOrders('created_at >= ? AND created_at < ?', [dayBeforeStart, yesterdayStart]);
  const yesterdayTypes = countByType('created_at >= ? AND created_at < ?', [yesterdayStart, todayStart]);
  const today = countOrders('created_at >= ?', [todayStart]);
  const todayTypes = countByType('created_at >= ?', [todayStart]);
  const nowTime = now.toTimeString().substring(0, 8);
  const yesterdaySameTime = countOrders('created_at >= ? AND created_at < ? AND TIME(created_at) <= ?', [yesterdayStart, todayStart, nowTime]);
  const currentMonth = countOrders('created_at >= ?', [monthStart]);
  const prevMonth = countOrders('created_at >= ? AND created_at <= ?', [prevMonthStart, prevMonthEnd]);
  const currentMonthTypes = countByType('created_at >= ?', [monthStart]);

  const statusCounts = db.prepare(`SELECT status, COUNT(*) as count FROM orders WHERE status NOT IN ('done') GROUP BY status`).all();
  const paymentCounts = db.prepare(`SELECT payment_status, COUNT(*) as count FROM orders WHERE status NOT IN ('done') GROUP BY payment_status`).all();

  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStart = formatDatetime(date);
    const dateEnd = formatDatetime(new Date(date.getTime() + 86400000));
    const dayData = countOrders('created_at >= ? AND created_at < ?', [dateStart, dateEnd]);
    trend.push({
      name: date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
      orders: dayData.count,
      revenue: Math.round(dayData.total),
    });
  }

  const ordersData = {
    yesterday: { count: yesterday.count, total: Math.round(yesterday.total), veteran_sport: yesterdayTypes.veteran_sport, other: yesterdayTypes.other, count_change: pctChange(yesterday.count, dayBefore.count), total_change: pctChange(yesterday.total, dayBefore.total) },
    today: { count: today.count, total: Math.round(today.total), veteran_sport: todayTypes.veteran_sport, other: todayTypes.other, count_change: pctChange(today.count, yesterdaySameTime.count), total_change: pctChange(today.total, yesterdaySameTime.total) },
    currentMonth: { count: currentMonth.count, total: Math.round(currentMonth.total), veteran_sport: currentMonthTypes.veteran_sport, other: currentMonthTypes.other, count_change: pctChange(currentMonth.count, prevMonth.count), total_change: pctChange(currentMonth.total, prevMonth.total) },
    statuses: Object.fromEntries(statusCounts.map(s => [s.status, s.count])),
    payments: Object.fromEntries(paymentCounts.map(p => [p.payment_status, p.count])),
    trend,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'orders.json'), JSON.stringify(ordersData));
  console.log('  ✓ orders.json');

  // ─── 2. SALES ───────────────────────────────────────────
  const salesQuery = (groupBy, groupLabel) => {
    return db.prepare(`
      SELECT ${groupBy} as name, COUNT(DISTINCT o.id) as orders, SUM(oi.quantity * oi.unit_price) as revenue,
        ROUND(AVG(oi.unit_price), 0) as avg_price, ROUND(AVG((oi.unit_price - oi.unit_cost) / NULLIF(oi.unit_price, 0) * 100), 1) as margin,
        SUM(oi.quantity * oi.unit_price) - SUM(oi.quantity * oi.unit_cost) as profit,
        ROUND(SUM(oi.quantity * oi.unit_price) * 100.0 / (SELECT SUM(oi2.quantity * oi2.unit_price) FROM order_items oi2 JOIN orders o2 ON oi2.order_id = o2.id WHERE o2.created_at >= ?), 1) as share
      FROM order_items oi 
      JOIN orders o ON oi.order_id = o.id 
      JOIN products p ON oi.product_id = p.id
      ${groupBy.includes('b.name') ? 'JOIN brands b ON p.brand_id = b.id' : ''}
      ${groupBy.includes('s.name') ? 'JOIN suppliers s ON p.supplier_id = s.id' : ''}
      ${groupBy.includes('c.name') ? 'JOIN categories c ON p.category_id = c.id' : ''}
      WHERE o.created_at >= ?
      GROUP BY ${groupBy}
      ORDER BY revenue DESC
    `).all(monthStart, monthStart);
  };

  const salesData = {
    brands: salesQuery('b.name', 'Бренд'),
    suppliers: salesQuery('s.name', 'Постачальник'),
    bundles: db.prepare(`
      SELECT p.name, COUNT(DISTINCT o.id) as orders, SUM(oi.quantity * oi.unit_price) as revenue,
        ROUND(AVG(oi.unit_price), 0) as avg_price, ROUND(AVG((oi.unit_price - oi.unit_cost) / NULLIF(oi.unit_price, 0) * 100), 1) as margin,
        SUM(oi.quantity * oi.unit_price) - SUM(oi.quantity * oi.unit_cost) as profit
      FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id
      WHERE o.created_at >= ? AND p.is_bundle = 1
      GROUP BY p.id ORDER BY revenue DESC
    `).all(monthStart),
    categories: salesQuery('c.name', 'Категорія'),
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sales.json'), JSON.stringify(salesData));
  console.log('  ✓ sales.json');

  // ─── 3. WAREHOUSE ───────────────────────────────────────
  const inProduction = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'production'`).get();
  const notPacked = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'production' AND is_packed = 0`).get();
  const packedNotShipped = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'production' AND is_packed = 1`).get();
  const shippedYesterday = countOrders(`shipped_at >= ? AND shipped_at < ?`, [yesterdayStart, todayStart]);
  const shippedMonth = countOrders(`shipped_at >= ?`, [monthStart]);
  const shippedPrevMonth = countOrders(`shipped_at >= ? AND shipped_at <= ?`, [prevMonthStart, prevMonthEnd]);

  const delayBreakdown = [24, 48, 72, 96, 120, 144, 168].map(hours => {
    const count = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE status = 'production' AND confirmed_at IS NOT NULL
      AND (julianday('now') - julianday(confirmed_at)) * 24 > ?
    `).get(hours);
    return { hours, count: count.count };
  });

  const totalDelayed = db.prepare(`
    SELECT COUNT(*) as count FROM orders
    WHERE status = 'production' AND confirmed_at IS NOT NULL
    AND (julianday('now') - julianday(confirmed_at)) * 24 > 24
  `).get();

  const shipTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const ds = formatDatetime(date);
    const de = formatDatetime(new Date(date.getTime() + 86400000));
    const d = countOrders('shipped_at >= ? AND shipped_at < ?', [ds, de]);
    shipTrend.push({
      name: date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
      shipped: d.count,
    });
  }

  const warehouseData = {
    queue: { inProduction: inProduction.count, notPacked: notPacked.count, packedNotShipped: packedNotShipped.count },
    shipped: { yesterday: shippedYesterday.count, month: shippedMonth.count, yesterdayChange: pctChange(shippedYesterday.count, shippedPrevMonth.count / 30), monthChange: pctChange(shippedMonth.count, shippedPrevMonth.count) },
    delays: delayBreakdown,
    totalDelayed: totalDelayed.count,
    shipTrend,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'warehouse.json'), JSON.stringify(warehouseData));
  console.log('  ✓ warehouse.json');

  // ─── 4. FINANCE ─────────────────────────────────────────
  const accounts = db.prepare('SELECT * FROM finance_accounts').all();
  const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0);

  const monthIncome = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE type = 'income' AND created_at >= ?`).get(monthStart);
  const monthExpenses = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE type = 'expense' AND created_at >= ?`).get(monthStart);
  const prevMonthIncome = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE type = 'income' AND created_at >= ? AND created_at <= ?`).get(prevMonthStart, prevMonthEnd);

  const receivablesTotal = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM receivables').get();
  const payablesTotal = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payables').get();
  const inventoryValue = db.prepare('SELECT COALESCE(SUM(i.quantity * p.cost), 0) as total FROM inventory i JOIN products p ON i.product_id = p.id').get();
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY month DESC, amount DESC').all();

  const financeData = {
    accounts, totalCash: Math.round(totalCash),
    monthIncome: Math.round(monthIncome.total), monthExpenses: Math.round(monthExpenses.total),
    monthProfit: Math.round(monthIncome.total - monthExpenses.total),
    incomeChange: pctChange(monthIncome.total, prevMonthIncome.total),
    receivables: Math.round(receivablesTotal.total), payables: Math.round(payablesTotal.total),
    inventoryValue: Math.round(inventoryValue.total),
    netAssets: Math.round(totalCash + receivablesTotal.total - payablesTotal.total + inventoryValue.total),
    expenses,
    profitMargin: monthIncome.total > 0 ? Math.round((monthIncome.total - monthExpenses.total) / monthIncome.total * 100 * 10) / 10 : 0,
    forecast: {
      daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
      daysPassed: now.getDate(),
      projectedIncome: Math.round(monthIncome.total / Math.max(now.getDate(), 1) * new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()),
    },
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'finance.json'), JSON.stringify(financeData));
  console.log('  ✓ finance.json');

  db.close();
  console.log('\n✅ Export complete! Files in:', OUTPUT_DIR);
}

try {
  exportData();
} catch (err) {
  console.error('❌ Export failed:', err);
  process.exit(1);
}
