import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current_month';

    // Build date filter
    const now = new Date();
    let dateFilter = '';
    let dateParams = [];

    switch (period) {
      case 'today': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().replace('T', ' ').substring(0, 19);
        dateFilter = 'AND o.created_at >= ?';
        dateParams = [start];
        break;
      }
      case 'yesterday': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().replace('T', ' ').substring(0, 19);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().replace('T', ' ').substring(0, 19);
        dateFilter = 'AND o.created_at >= ? AND o.created_at < ?';
        dateParams = [start, end];
        break;
      }
      case 'prev_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().replace('T', ' ').substring(0, 19);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString().replace('T', ' ').substring(0, 19);
        dateFilter = 'AND o.created_at >= ? AND o.created_at <= ?';
        dateParams = [start, end];
        break;
      }
      default: { // current_month
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().replace('T', ' ').substring(0, 19);
        dateFilter = 'AND o.created_at >= ?';
        dateParams = [start];
        break;
      }
    }

    const paidFilter = `(o.payment_status IN ('paid','cod') OR o.payment_method = 'nova_poshta')`;

    // 1. Sales by brands
    const byBrands = db.prepare(`
      SELECT 
        b.name as brand,
        COUNT(DISTINCT oi.id) as units,
        SUM(oi.quantity) as total_qty,
        SUM(oi.unit_price * oi.quantity) as revenue,
        AVG(oi.unit_price) as avg_price,
        CASE WHEN SUM(oi.unit_price * oi.quantity) > 0 
          THEN (SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity)) / SUM(oi.unit_price * oi.quantity) * 100
          ELSE 0 END as margin,
        SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity) as gross_profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${paidFilter} ${dateFilter}
      GROUP BY b.id
      ORDER BY revenue DESC
    `).all(...dateParams);

    // Calculate total revenue for share %
    const totalRevenue = byBrands.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const brandsWithShare = byBrands.map(r => ({
      ...r,
      revenue: Math.round(r.revenue || 0),
      avg_price: Math.round(r.avg_price || 0),
      margin: parseFloat((r.margin || 0).toFixed(1)),
      gross_profit: Math.round(r.gross_profit || 0),
      share: totalRevenue > 0 ? parseFloat(((r.revenue || 0) / totalRevenue * 100).toFixed(1)) : 0,
    }));

    // 2. Sales by suppliers
    const bySuppliers = db.prepare(`
      SELECT 
        s.name as supplier,
        SUM(oi.quantity) as total_qty,
        SUM(oi.unit_price * oi.quantity) as revenue,
        AVG(oi.unit_price) as avg_price,
        CASE WHEN SUM(oi.unit_price * oi.quantity) > 0 
          THEN (SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity)) / SUM(oi.unit_price * oi.quantity) * 100
          ELSE 0 END as margin,
        SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity) as gross_profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE ${paidFilter} ${dateFilter}
      GROUP BY s.id
      ORDER BY revenue DESC
    `).all(...dateParams);

    const suppliersWithShare = bySuppliers.map(r => ({
      ...r,
      revenue: Math.round(r.revenue || 0),
      avg_price: Math.round(r.avg_price || 0),
      margin: parseFloat((r.margin || 0).toFixed(1)),
      gross_profit: Math.round(r.gross_profit || 0),
      share: totalRevenue > 0 ? parseFloat(((r.revenue || 0) / totalRevenue * 100).toFixed(1)) : 0,
    }));

    // 3. Sales by bundles
    const byBundles = db.prepare(`
      SELECT 
        p.name as bundle_name,
        SUM(oi.quantity) as total_qty,
        SUM(oi.unit_price * oi.quantity) as revenue,
        CASE WHEN SUM(oi.unit_price * oi.quantity) > 0 
          THEN (SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity)) / SUM(oi.unit_price * oi.quantity) * 100
          ELSE 0 END as margin,
        SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity) as gross_profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE p.is_bundle = 1 AND ${paidFilter} ${dateFilter}
      GROUP BY p.id
      ORDER BY revenue DESC
    `).all(...dateParams);

    const totalOrders = db.prepare(`
      SELECT COUNT(*) as count FROM orders o WHERE ${paidFilter} ${dateFilter}
    `).get(...dateParams);

    const bundleOrders = db.prepare(`
      SELECT COUNT(DISTINCT o.id) as count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.is_bundle = 1 AND ${paidFilter} ${dateFilter}
    `).get(...dateParams);

    const bundlesWithShare = byBundles.map(r => ({
      ...r,
      revenue: Math.round(r.revenue || 0),
      margin: parseFloat((r.margin || 0).toFixed(1)),
      gross_profit: Math.round(r.gross_profit || 0),
      orders_share: totalOrders.count > 0 ? parseFloat(((bundleOrders.count) / totalOrders.count * 100).toFixed(1)) : 0,
      revenue_share: totalRevenue > 0 ? parseFloat(((r.revenue || 0) / totalRevenue * 100).toFixed(1)) : 0,
    }));

    // 4. Sales by categories
    const byCategories = db.prepare(`
      SELECT 
        c.name as category,
        SUM(oi.quantity) as total_qty,
        SUM(oi.unit_price * oi.quantity) as revenue,
        AVG(oi.unit_price) as avg_price,
        CASE WHEN SUM(oi.unit_price * oi.quantity) > 0 
          THEN (SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity)) / SUM(oi.unit_price * oi.quantity) * 100
          ELSE 0 END as margin,
        SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity) as gross_profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${paidFilter} ${dateFilter}
      GROUP BY c.id
      ORDER BY revenue DESC
    `).all(...dateParams);

    const categoriesWithShare = byCategories.map(r => ({
      ...r,
      revenue: Math.round(r.revenue || 0),
      avg_price: Math.round(r.avg_price || 0),
      margin: parseFloat((r.margin || 0).toFixed(1)),
      gross_profit: Math.round(r.gross_profit || 0),
      share: totalRevenue > 0 ? parseFloat(((r.revenue || 0) / totalRevenue * 100).toFixed(1)) : 0,
    }));

    // 5. TOP-10 by revenue and by profit
    const topByRevenue = db.prepare(`
      SELECT 
        p.name,
        b.name as brand,
        SUM(oi.unit_price * oi.quantity) as revenue,
        SUM(oi.quantity) as qty
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${paidFilter} ${dateFilter}
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT 10
    `).all(...dateParams).map(r => ({ ...r, revenue: Math.round(r.revenue) }));

    const topByProfit = db.prepare(`
      SELECT 
        p.name,
        b.name as brand,
        SUM(oi.unit_price * oi.quantity) - SUM(oi.unit_cost * oi.quantity) as profit,
        SUM(oi.quantity) as qty
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${paidFilter} ${dateFilter}
      GROUP BY p.id
      ORDER BY profit DESC
      LIMIT 10
    `).all(...dateParams).map(r => ({ ...r, profit: Math.round(r.profit) }));

    return NextResponse.json({
      byBrands: brandsWithShare,
      bySuppliers: suppliersWithShare,
      byBundles: bundlesWithShare,
      byCategories: categoriesWithShare,
      topByRevenue,
      topByProfit,
      totalRevenue: Math.round(totalRevenue),
    });
  } catch (error) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
