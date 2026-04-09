import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current_month';

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
      default: {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().replace('T', ' ').substring(0, 19);
        dateFilter = 'AND o.created_at >= ?';
        dateParams = [start];
      }
    }

    const paidFilter = `(o.payment_status IN ('paid','cod') OR o.payment_method = 'nova_poshta')`;

    // 1. Current month financial KPIs
    const monthKPIs = db.prepare(`
      SELECT 
        COUNT(*) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(AVG(o.total_amount), 0) as avg_check
      FROM orders o
      WHERE ${paidFilter} ${dateFilter}
    `).get(...dateParams);

    const marginData = db.prepare(`
      SELECT 
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue,
        COALESCE(SUM(oi.unit_cost * oi.quantity), 0) as cost
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE ${paidFilter} ${dateFilter}
    `).get(...dateParams);

    const grossProfit = (marginData.revenue || 0) - (marginData.cost || 0);
    const marginPct = marginData.revenue > 0 ? (grossProfit / marginData.revenue * 100) : 0;

    // 2. Forecasts
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const expenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE month = ?
    `).get(currentMonth);

    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const profitToDate = grossProfit - (expenses.total || 0);
    const dailyRate = dayOfMonth > 0 ? grossProfit / dayOfMonth : 0;
    const projectedProfit = (dailyRate * daysInMonth) - (expenses.total || 0);
    const profitability = monthKPIs.total_revenue > 0 ? (profitToDate / monthKPIs.total_revenue * 100) : 0;

    // 3. Balance
    const accounts = db.prepare(`
      SELECT id, name, type, balance FROM finance_accounts ORDER BY type, name
    `).all();

    const totalCash = accounts.reduce((s, a) => s + a.balance, 0);

    // Receivables
    const receivablesTotal = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM receivables
    `).get();

    const receivablesByCustomers = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM receivables WHERE debtor_type = 'customer'
    `).get();

    const receivablesBySuppliers = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM receivables WHERE debtor_type = 'supplier'
    `).get();

    // Payables
    const payablesTotal = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payables
    `).get();

    const payablesByCustomers = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payables WHERE creditor_type = 'customer'
    `).get();

    const payablesBySuppliers = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payables WHERE creditor_type = 'supplier'
    `).get();

    // Inventory value
    const inventoryData = db.prepare(`
      SELECT 
        COALESCE(SUM(i.quantity), 0) as total_qty,
        COALESCE(SUM(i.quantity * p.cost), 0) as total_cost
      FROM inventory i
      JOIN products p ON i.product_id = p.id
    `).get();

    // Net balance
    const netBalance = totalCash + receivablesTotal.total + inventoryData.total_cost - payablesTotal.total;

    return NextResponse.json({
      kpis: {
        order_count: monthKPIs.order_count,
        total_revenue: Math.round(monthKPIs.total_revenue),
        avg_check: Math.round(monthKPIs.avg_check),
        margin: parseFloat(marginPct.toFixed(1)),
        gross_profit: Math.round(grossProfit),
        profitability: parseFloat(profitability.toFixed(1)),
      },
      forecast: {
        monthly_expenses: Math.round(expenses.total),
        profit_to_date: Math.round(profitToDate),
        projected_profit: Math.round(projectedProfit),
      },
      balance: {
        accounts,
        total_cash: Math.round(totalCash),
        receivables: {
          total: Math.round(receivablesTotal.total),
          by_customers: Math.round(receivablesByCustomers.total),
          by_suppliers: Math.round(receivablesBySuppliers.total),
        },
        payables: {
          total: Math.round(payablesTotal.total),
          by_customers: Math.round(payablesByCustomers.total),
          by_suppliers: Math.round(payablesBySuppliers.total),
        },
        inventory: {
          total_qty: inventoryData.total_qty,
          total_cost: Math.round(inventoryData.total_cost),
        },
        net_balance: Math.round(netBalance),
      },
    });
  } catch (error) {
    console.error('Finance API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
