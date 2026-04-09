/**
 * Export script — generates realistic demo data for MCPanel dashboard.
 * Target: ~25,000 orders/month, ~20M UAH revenue, 504 products.
 * No database dependency — pure data generation.
 */

const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'api');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — realistic e-commerce data for Race Expert
// ═══════════════════════════════════════════════════════════════

const MONTHLY_ORDERS = 24850;
const MONTHLY_REVENUE = 21_450_000; // 21.45M UAH
const AVG_CHECK = Math.round(MONTHLY_REVENUE / MONTHLY_ORDERS); // ~863 UAH
const MARGIN_PCT = 47.5;
const GROSS_PROFIT = Math.round(MONTHLY_REVENUE * MARGIN_PCT / 100);
const DAILY_AVG_ORDERS = Math.round(MONTHLY_ORDERS / 30);
const DAILY_AVG_REVENUE = Math.round(MONTHLY_REVENUE / 30);
const PREV_MONTH_ORDERS = 23100;
const PREV_MONTH_REVENUE = 19_830_000;
const VETERAN_SPORT_PCT = 0.13;

// ═══════════════════════════════════════════════════════════════

const BRANDS = [
  { name: 'Science In Sport (SIS)', share: 0.185 },
  { name: 'Maurten', share: 0.145 },
  { name: 'PFH (Precision Fuel & Hydration)', share: 0.11 },
  { name: 'NUTREND', share: 0.095 },
  { name: 'NOW FOODS', share: 0.09 },
  { name: 'Sponser', share: 0.075 },
  { name: '226ERS', share: 0.06 },
  { name: 'GU Energy', share: 0.055 },
  { name: 'Enervit', share: 0.04 },
  { name: 'Life Extension', share: 0.035 },
  { name: 'Solgar', share: 0.025 },
  { name: 'Hydria', share: 0.02 },
  { name: 'Swanson', share: 0.015 },
  { name: 'Olimp', share: 0.012 },
  { name: 'SaltStick', share: 0.008 },
  { name: 'RACE EXPERT', share: 0.007 },
  { name: 'Doctor\'s Best', share: 0.006 },
  { name: 'Natural Factors', share: 0.005 },
  { name: 'NutriBiotic', share: 0.004 },
  { name: 'Natrol', share: 0.003 },
  { name: '21st Century', share: 0.003 },
  { name: 'ЇDLO', share: 0.003 },
  { name: 'Beet It Sport', share: 0.002 },
  { name: 'Universal Nutrition', share: 0.002 },
  { name: 'NUTRIVERSUM', share: 0.002 },
];

const CATEGORIES = [
  { name: 'Гелі енергетичні', share: 0.28 },
  { name: 'Електроліти (гідратація)', share: 0.18 },
  { name: 'Вуглеводні напої', share: 0.09 },
  { name: 'Енергетичні батончики', share: 0.08 },
  { name: 'Набори', share: 0.07 },
  { name: 'Вітаміни', share: 0.07 },
  { name: 'Мікроелементи', share: 0.055 },
  { name: 'Протеїнові добавки', share: 0.045 },
  { name: 'Відновлювальні напої', share: 0.04 },
  { name: 'Омега', share: 0.03 },
  { name: 'Амінокислоти', share: 0.025 },
  { name: 'Креатин', share: 0.02 },
  { name: 'Передтренувальні комплекси', share: 0.015 },
  { name: 'Фляги', share: 0.01 },
  { name: 'Сумочки та пояси', share: 0.005 },
];

const SUPPLIERS = [
  { name: 'SIS Distribution', country: 'UK', share: 0.22 },
  { name: 'Maurten AB', country: 'Sweden', share: 0.15 },
  { name: 'PFH Direct', country: 'UK', share: 0.12 },
  { name: 'Nutrend D.S.', country: 'Czech Republic', share: 0.10 },
  { name: 'NOW International', country: 'USA', share: 0.10 },
  { name: 'Sponser Sport Food', country: 'Switzerland', share: 0.08 },
  { name: '226ERS SL', country: 'Spain', share: 0.06 },
  { name: 'GU Sports Nutrition', country: 'USA', share: 0.055 },
  { name: 'Euro Nutrition', country: 'Italy', share: 0.045 },
  { name: 'Vitamin Distribution UA', country: 'USA', share: 0.04 },
  { name: 'Hydria Ukraine', country: 'Ukraine', share: 0.03 },
];

const BUNDLE_NAMES = [
  { name: 'Набір харчування SiS для бігу на 42 км', revenue: 1_248_000, orders: 1438 },
  { name: 'Набір харчування Maurten для забігу на 42 км', revenue: 985_000, orders: 661 },
  { name: 'Набір гелів SiS GO Isotonic Gel (MIX), 35шт', revenue: 824_000, orders: 277 },
  { name: 'Набір гелів Maurten GEL 100 (MIX), 12шт', revenue: 612_000, orders: 250 },
  { name: 'Набір харчування PFH для забігу на 42 км', revenue: 542_000, orders: 491 },
  { name: 'Набір харчування SiS для бігу на 21 км', revenue: 498_000, orders: 1127 },
  { name: 'Набір батончиків SiS GO Energy Bake (MIX), 12шт', revenue: 345_000, orders: 369 },
  { name: 'Набір харчування Maurten для забігу на 21 км', revenue: 312_000, orders: 406 },
  { name: 'Набір харчування PFH для забігу на 21 км', revenue: 287_000, orders: 459 },
  { name: 'Набір харчування Sponser для забігу на 10 км', revenue: 198_000, orders: 369 },
  { name: 'Набір із 10 гелів SiS', revenue: 178_000, orders: 171 },
  { name: 'Набір NUTREND Performance Pack', revenue: 156_000, orders: 185 },
  { name: 'Набір харчування 226ERS Trail Running 42 км', revenue: 142_000, orders: 58 },
  { name: 'Набір харчування SiS для бігу на 10 км', revenue: 125_000, orders: 558 },
  { name: 'Набір Sponser Marathon Kit', revenue: 112_000, orders: 163 },
];

function rand(min, max) { return Math.round(min + Math.random() * (max - min)); }
function jitter(base, pct = 0.15) { return Math.round(base * (1 + (Math.random() - 0.5) * 2 * pct)); }
function pctChange(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round((current - previous) / previous * 1000) / 10;
}

function exportData() {
  console.log('📦 Generating realistic dashboard data...\n');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = dayOfMonth / daysInMonth;

  // ═══════════════════════════════════════════════════════════
  // 1. ORDERS
  // ═══════════════════════════════════════════════════════════
  const todayOrders = jitter(DAILY_AVG_ORDERS, 0.2);
  const todayRevenue = jitter(DAILY_AVG_REVENUE, 0.2);
  const yesterdayOrders = jitter(DAILY_AVG_ORDERS, 0.2);
  const yesterdayRevenue = jitter(DAILY_AVG_REVENUE, 0.2);
  const dayBeforeOrders = jitter(DAILY_AVG_ORDERS, 0.2);
  const dayBeforeRevenue = jitter(DAILY_AVG_REVENUE, 0.2);
  const monthOrders = Math.round(MONTHLY_ORDERS * monthProgress);
  const monthRevenue = Math.round(MONTHLY_REVENUE * monthProgress);
  const prevMonthSamePoint = Math.round(PREV_MONTH_ORDERS * monthProgress);
  const prevMonthSameRevenue = Math.round(PREV_MONTH_REVENUE * monthProgress);

  const yesterdaySameTime = jitter(yesterdayOrders * 0.65, 0.1);
  const yesterdaySameRevenue = jitter(yesterdayRevenue * 0.65, 0.1);

  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const dayOrders = jitter(DAILY_AVG_ORDERS * (isWeekend ? 0.7 : 1.1), 0.15);
    trend.push({
      name: d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
      orders: dayOrders,
      revenue: jitter(dayOrders * AVG_CHECK, 0.1),
    });
  }

  const activeOrders = Math.round(MONTHLY_ORDERS * 0.18);
  const ordersData = {
    yesterday: {
      count: yesterdayOrders, total: yesterdayRevenue,
      veteran_sport: Math.round(yesterdayOrders * VETERAN_SPORT_PCT),
      other: Math.round(yesterdayOrders * (1 - VETERAN_SPORT_PCT)),
      count_change: pctChange(yesterdayOrders, dayBeforeOrders),
      total_change: pctChange(yesterdayRevenue, dayBeforeRevenue),
    },
    today: {
      count: todayOrders, total: todayRevenue,
      veteran_sport: Math.round(todayOrders * VETERAN_SPORT_PCT),
      other: Math.round(todayOrders * (1 - VETERAN_SPORT_PCT)),
      count_change: pctChange(todayOrders, yesterdaySameTime),
      total_change: pctChange(todayRevenue, yesterdaySameRevenue),
    },
    currentMonth: {
      count: monthOrders, total: monthRevenue,
      veteran_sport: Math.round(monthOrders * VETERAN_SPORT_PCT),
      other: Math.round(monthOrders * (1 - VETERAN_SPORT_PCT)),
      count_change: pctChange(monthOrders, prevMonthSamePoint),
      total_change: pctChange(monthRevenue, prevMonthSameRevenue),
    },
    statuses: {
      new: rand(380, 520),
      awaiting_payment: rand(280, 420),
      agreement: rand(150, 250),
      production: rand(850, 1200),
      returned: rand(80, 160),
    },
    payments: {
      paid: rand(1800, 2400),
      unpaid: rand(600, 900),
      cod: rand(900, 1300),
    },
    trend,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'orders.json'), JSON.stringify(ordersData));
  console.log('  ✓ orders.json');

  // ═══════════════════════════════════════════════════════════
  // 2. SALES
  // ═══════════════════════════════════════════════════════════
  const totalRevenue = monthRevenue;
  const totalBundleRevenue = BUNDLE_NAMES.reduce((s, b) => s + b.revenue, 0);
  const totalBundleOrders = BUNDLE_NAMES.reduce((s, b) => s + b.orders, 0);

  const byBrands = BRANDS.map(b => {
    const rev = Math.round(totalRevenue * b.share);
    const orders = Math.round(rev / jitter(AVG_CHECK, 0.3));
    const qty = Math.round(orders * jitter(2.3, 0.3));
    const margin = jitter(MARGIN_PCT * 10, 0.12) / 10;
    return {
      brand: b.name, total_qty: qty, revenue: rev,
      avg_price: Math.round(rev / Math.max(qty, 1)),
      margin: margin, gross_profit: Math.round(rev * margin / 100),
      share: Math.round(b.share * 1000) / 10,
    };
  });

  const bySuppliers = SUPPLIERS.map(s => {
    const rev = Math.round(totalRevenue * s.share);
    const orders = Math.round(rev / jitter(AVG_CHECK, 0.3));
    const qty = Math.round(orders * jitter(2.3, 0.3));
    const margin = jitter(MARGIN_PCT * 10, 0.12) / 10;
    return {
      supplier: s.name, total_qty: qty, revenue: rev,
      avg_price: Math.round(rev / Math.max(qty, 1)),
      margin: margin, gross_profit: Math.round(rev * margin / 100),
      share: Math.round(s.share * 1000) / 10,
    };
  });

  const byCategories = CATEGORIES.map(c => {
    const rev = Math.round(totalRevenue * c.share);
    const orders = Math.round(rev / jitter(AVG_CHECK, 0.3));
    const qty = Math.round(orders * jitter(2.1, 0.3));
    const margin = jitter(MARGIN_PCT * 10, 0.15) / 10;
    return {
      category: c.name, total_qty: qty, revenue: rev,
      avg_price: Math.round(rev / Math.max(qty, 1)),
      margin: margin, gross_profit: Math.round(rev * margin / 100),
      share: Math.round(c.share * 1000) / 10,
    };
  });

  const byBundles = BUNDLE_NAMES.map(b => {
    const margin = jitter(42, 0.15);
    return {
      bundle_name: b.name, total_qty: b.orders, revenue: b.revenue,
      margin: margin, gross_profit: Math.round(b.revenue * margin / 100),
      orders_share: Math.round(b.orders / totalBundleOrders * 1000) / 10,
      revenue_share: Math.round(b.revenue / totalBundleRevenue * 1000) / 10,
    };
  });

  // TOP-10 products
  const topProducts = [
    'Гель ізотонічний SiS Go Isotonic Gel (апельсин) 60мл',
    'Гель Maurten GEL 100 (нейтральний) 40г',
    'Ізотонік PH 1500 Tube, 10 таблеток',
    'Гель вуглеводний PF 30 Gel, 51г',
    'Maurten Drink Mix 320 (нейтральний) 80г',
    'Гель SiS Beta Fuel + Electrolyte (малина-лимон) 60мл',
    'Батончик SiS GO Energy Bake (апельсин) 50г',
    'Гель Sponser Carbo Hydrogel (м\'ятний) 60г',
    'SaltStick Caps, 100 капсул',
    'Електролітний комплекс Hydria Perform (лимон) 1 стік',
    'Омега-3 NOW FOODS Ultra Omega-3, 180 софтгелів',
    'Магній NOW FOODS Magnesium Citrate, 200мг, 250 таблеток',
  ];

  const topByRevenue = topProducts.map((name, i) => ({
    name, revenue: Math.round(jitter(580_000 - i * 42_000, 0.1)),
    profit: Math.round(jitter(260_000 - i * 18_000, 0.15)),
  }));
  const topByProfit = [...topByRevenue].sort((a, b) => b.profit - a.profit);

  const salesData = {
    totalRevenue, byBrands, bySuppliers, byCategories, byBundles,
    topByRevenue, topByProfit,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sales.json'), JSON.stringify(salesData));
  console.log('  ✓ sales.json');

  // ═══════════════════════════════════════════════════════════
  // 3. WAREHOUSE
  // ═══════════════════════════════════════════════════════════
  const shippedYesterday = jitter(DAILY_AVG_ORDERS * 0.82, 0.15);
  const shippedMonth = Math.round(MONTHLY_ORDERS * 0.78 * monthProgress);
  const shippedPrevMonth = Math.round(PREV_MONTH_ORDERS * 0.78);
  const inProduction = rand(1100, 1600);
  const notPacked = Math.round(inProduction * 0.42);
  const packedNotShipped = Math.round(inProduction * 0.28);
  const totalDelayed = rand(310, 520);

  const shipTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    shipTrend.push({
      name: d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
      shipped: jitter(shippedYesterday * (isWeekend ? 0.55 : 1.1), 0.15),
    });
  }

  const warehouseData = {
    queue: { inProduction, notPacked, packedNotShipped },
    shipped: {
      yesterday: shippedYesterday,
      month: shippedMonth,
      yesterdayChange: pctChange(shippedYesterday, shippedPrevMonth / 30),
      monthChange: pctChange(shippedMonth, Math.round(shippedPrevMonth * monthProgress)),
    },
    delays: [
      { hours: 24, count: rand(180, 260) },
      { hours: 48, count: rand(90, 150) },
      { hours: 72, count: rand(20, 55) },
      { hours: 96, count: rand(10, 30) },
      { hours: 120, count: rand(3, 12) },
      { hours: 144, count: rand(0, 5) },
      { hours: 168, count: rand(0, 3) },
    ],
    totalDelayed,
    shipTrend,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'warehouse.json'), JSON.stringify(warehouseData));
  console.log('  ✓ warehouse.json');

  // ═══════════════════════════════════════════════════════════
  // 4. FINANCE
  // ═══════════════════════════════════════════════════════════
  const monthExpenses = Math.round(MONTHLY_REVENUE * 0.38);
  const profitToDate = Math.round((monthRevenue - monthExpenses * monthProgress));
  const projectedProfit = Math.round(MONTHLY_REVENUE - monthExpenses);
  
  const financeData = {
    kpis: {
      order_count: monthOrders,
      total_revenue: monthRevenue,
      avg_check: Math.round(monthRevenue / Math.max(monthOrders, 1)),
      margin: MARGIN_PCT,
      gross_profit: Math.round(monthRevenue * MARGIN_PCT / 100),
      profitability: Math.round((monthRevenue * MARGIN_PCT / 100 - monthExpenses * monthProgress) / monthRevenue * 1000) / 10,
    },
    forecast: {
      monthly_expenses: monthExpenses,
      profit_to_date: profitToDate,
      projected_profit: projectedProfit,
    },
    balance: {
      total_cash: rand(4_200_000, 5_800_000),
      accounts: [
        { id: 1, name: 'Приватбанк (основний)', type: 'bank', balance: rand(2_100_000, 3_200_000) },
        { id: 2, name: 'Mono Business', type: 'bank', balance: rand(850_000, 1_400_000) },
        { id: 3, name: 'Каса (готівка)', type: 'cash', balance: rand(120_000, 280_000) },
        { id: 4, name: 'Резервний рахунок', type: 'bank', balance: rand(350_000, 650_000) },
      ],
      receivables: {
        total: rand(1_800_000, 2_600_000),
        by_customers: rand(1_200_000, 1_800_000),
        by_suppliers: rand(400_000, 800_000),
      },
      payables: {
        total: rand(2_200_000, 3_400_000),
        by_customers: rand(300_000, 600_000),
        by_suppliers: rand(1_800_000, 2_800_000),
      },
      inventory: {
        total_qty: rand(28_000, 42_000),
        total_cost: rand(8_500_000, 12_000_000),
      },
      net_balance: 0,
    },
  };
  // Calculate actual net balance
  financeData.balance.net_balance = financeData.balance.total_cash +
    financeData.balance.receivables.total +
    financeData.balance.inventory.total_cost -
    financeData.balance.payables.total;
  // Update total_cash to sum of accounts
  financeData.balance.total_cash = financeData.balance.accounts.reduce((s, a) => s + a.balance, 0);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'finance.json'), JSON.stringify(financeData));
  console.log('  ✓ finance.json');

  // ═══════════════════════════════════════════════════════════
  console.log(`
✅ Export complete!

  Monthly Orders:  ${MONTHLY_ORDERS.toLocaleString()}
  Monthly Revenue: ${MONTHLY_REVENUE.toLocaleString()} UAH
  Avg Check:       ${AVG_CHECK} UAH
  Margin:          ${MARGIN_PCT}%
  Products:        504
  Brands:          ${BRANDS.length}
  Categories:      ${CATEGORIES.length}
  Suppliers:       ${SUPPLIERS.length}
  `);
}

try {
  exportData();
} catch (err) {
  console.error('❌ Export failed:', err);
  process.exit(1);
}
