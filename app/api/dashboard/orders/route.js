import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().replace('T', ' ').substring(0, 19);
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().replace('T', ' ').substring(0, 19);
    const dayBeforeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString().replace('T', ' ').substring(0, 19);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().replace('T', ' ').substring(0, 19);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().replace('T', ' ').substring(0, 19);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString().replace('T', ' ').substring(0, 19);

    // Helper to count orders with filters
    const countOrders = (whereClause, params = []) => {
      const row = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM orders
        WHERE (payment_status IN ('paid','cod') OR payment_method = 'nova_poshta')
        AND ${whereClause}
      `).get(...params);
      return row;
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

    // 1. YESTERDAY (past day)
    const yesterday = countOrders('created_at >= ? AND created_at < ?', [yesterdayStart, todayStart]);
    const dayBefore = countOrders('created_at >= ? AND created_at < ?', [dayBeforeStart, yesterdayStart]);
    const yesterdayTypes = countByType('created_at >= ? AND created_at < ?', [yesterdayStart, todayStart]);

    // 2. TODAY
    const today = countOrders('created_at >= ?', [todayStart]);
    const todayTypes = countByType('created_at >= ?', [todayStart]);

    // Yesterday same time comparison
    const nowTime = now.toTimeString().substring(0, 8);
    const yesterdaySameTime = countOrders(
      `created_at >= ? AND created_at < ? AND TIME(created_at) <= ?`,
      [yesterdayStart, todayStart, nowTime]
    );

    // 3. CURRENT MONTH
    const currentMonth = countOrders('created_at >= ?', [monthStart]);
    const prevMonth = countOrders('created_at >= ? AND created_at <= ?', [prevMonthStart, prevMonthEnd]);
    const currentMonthTypes = countByType('created_at >= ?', [monthStart]);

    // 4. ORDER STATUSES
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count FROM orders
      WHERE status NOT IN ('done')
      GROUP BY status
    `).all();

    const paymentCounts = db.prepare(`
      SELECT payment_status, COUNT(*) as count FROM orders
      WHERE status NOT IN ('done')
      GROUP BY payment_status
    `).all();

    // Calculate % changes
    const pctChange = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100);
    };

    // 7-day trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStart = date.toISOString().replace('T', ' ').substring(0, 19);
      const dateEnd = new Date(date.getTime() + 86400000).toISOString().replace('T', ' ').substring(0, 19);
      const dayData = countOrders('created_at >= ? AND created_at < ?', [dateStart, dateEnd]);
      trend.push({
        name: date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
        orders: dayData.count,
        revenue: Math.round(dayData.total),
      });
    }

    const result = {
      yesterday: {
        count: yesterday.count,
        total: Math.round(yesterday.total),
        veteran_sport: yesterdayTypes.veteran_sport,
        other: yesterdayTypes.other,
        count_change: pctChange(yesterday.count, dayBefore.count),
        total_change: pctChange(yesterday.total, dayBefore.total),
      },
      today: {
        count: today.count,
        total: Math.round(today.total),
        veteran_sport: todayTypes.veteran_sport,
        other: todayTypes.other,
        count_change: pctChange(today.count, yesterdaySameTime.count),
        total_change: pctChange(today.total, yesterdaySameTime.total),
      },
      currentMonth: {
        count: currentMonth.count,
        total: Math.round(currentMonth.total),
        veteran_sport: currentMonthTypes.veteran_sport,
        other: currentMonthTypes.other,
        count_change: pctChange(currentMonth.count, prevMonth.count),
        total_change: pctChange(currentMonth.total, prevMonth.total),
      },
      statuses: Object.fromEntries(statusCounts.map(s => [s.status, s.count])),
      payments: Object.fromEntries(paymentCounts.map(p => [p.payment_status, p.count])),
      trend,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
