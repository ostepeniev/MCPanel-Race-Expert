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

    // 1. YESTERDAY — shipped orders (production → delivery/done)
    const yesterdayShipped = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE shipped_at >= ? AND shipped_at < ?
    `).get(yesterdayStart, todayStart);

    const dayBeforeShipped = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE shipped_at >= ? AND shipped_at < ?
    `).get(dayBeforeStart, yesterdayStart);

    // 2. CURRENT MONTH — shipped
    const monthShipped = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE shipped_at >= ?
    `).get(monthStart);

    const prevMonthShipped = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE shipped_at >= ? AND shipped_at <= ?
    `).get(prevMonthStart, prevMonthEnd);

    // 3. QUEUE STATUS
    const inProduction = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'production'
    `).get();

    const notPacked = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'production' AND is_packed = 0
    `).get();

    const packedNotShipped = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'production' AND is_packed = 1
    `).get();

    const totalNotShipped = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE status IN ('production', 'agreement') AND shipped_at IS NULL
    `).get();

    // 3.2 DELAYS — hours since confirmed_at for unshipped orders
    const nowISO = now.toISOString().replace('T', ' ').substring(0, 19);
    
    const delayQuery = (minHours, maxHours) => {
      if (maxHours) {
        return db.prepare(`
          SELECT COUNT(*) as count FROM orders
          WHERE status = 'production' AND confirmed_at IS NOT NULL AND shipped_at IS NULL
          AND ((julianday(?) - julianday(confirmed_at)) * 24) > ?
          AND ((julianday(?) - julianday(confirmed_at)) * 24) <= ?
        `).get(nowISO, minHours, nowISO, maxHours);
      }
      return db.prepare(`
        SELECT COUNT(*) as count FROM orders
        WHERE status = 'production' AND confirmed_at IS NOT NULL AND shipped_at IS NULL
        AND ((julianday(?) - julianday(confirmed_at)) * 24) > ?
      `).get(nowISO, minHours);
    };

    const delays = {
      over_24h: delayQuery(24, 48).count,
      over_48h: delayQuery(48, 72).count,
      over_72h: delayQuery(72, 96).count,
      over_96h: delayQuery(96, 120).count,
      over_120h: delayQuery(120, 144).count,
      over_144h: delayQuery(144, 168).count,
      over_168h: delayQuery(168, null).count,
    };

    // Calculate total delay orders
    const totalDelayed = Object.values(delays).reduce((s, c) => s + c, 0);

    // Pct change helpers
    const pctChange = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100);
    };

    // 7-day shipment trend
    const shipmentTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dStart = date.toISOString().replace('T', ' ').substring(0, 19);
      const dEnd = new Date(date.getTime() + 86400000).toISOString().replace('T', ' ').substring(0, 19);
      const dayShipped = db.prepare(`
        SELECT COUNT(*) as count FROM orders WHERE shipped_at >= ? AND shipped_at < ?
      `).get(dStart, dEnd);
      shipmentTrend.push({
        name: date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
        value: dayShipped.count,
      });
    }

    return NextResponse.json({
      yesterday: {
        shipped: yesterdayShipped.count,
        change: pctChange(yesterdayShipped.count, dayBeforeShipped.count),
      },
      currentMonth: {
        shipped: monthShipped.count,
        change: pctChange(monthShipped.count, prevMonthShipped.count),
      },
      queue: {
        in_production: inProduction.count,
        not_packed: notPacked.count,
        packed_not_shipped: packedNotShipped.count,
        total_not_shipped: totalNotShipped.count,
      },
      delays,
      totalDelayed,
      shipmentTrend,
    });
  } catch (error) {
    console.error('Warehouse API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
