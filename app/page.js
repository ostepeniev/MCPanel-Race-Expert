'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import KPICard from './components/KPICard';
import MiniChart from './components/MiniChart';
import { Package, DollarSign, Factory, ShoppingCart, TrendingUp, Play, ClipboardCheck, PlusSquare, AlertTriangle, Info } from 'lucide-react';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function CommandCenter() {
  const { data: orders, isLoading: ordersLoading } = useSWR('/api/dashboard/orders', fetcher, { refreshInterval: 60000 });
  const { data: warehouse, isLoading: warehouseLoading } = useSWR('/api/dashboard/warehouse', fetcher, { refreshInterval: 60000 });
  const { data: finance, isLoading: financeLoading } = useSWR('/api/dashboard/finance', fetcher, { refreshInterval: 60000 });

  const isLoading = ordersLoading || warehouseLoading || financeLoading;

  const now = new Date();
  const dateStr = now.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  // Build insights from data
  const insights = [];
  if (warehouse && warehouse.totalDelayed > 0) {
    insights.push({
      type: warehouse.totalDelayed > 10 ? 'danger' : 'warning',
      icon: '⚠️',
      text: `${warehouse.totalDelayed} замовлень у черзі з затримкою >24 години`,
    });
  }
  if (warehouse?.delays?.over_120h > 0) {
    insights.push({
      type: 'danger',
      icon: '🔴',
      text: `${warehouse.delays.over_120h + (warehouse.delays.over_144h || 0) + (warehouse.delays.over_168h || 0)} замовлень з критичною затримкою >5 діб`,
    });
  }
  if (orders && orders.today?.count === 0) {
    insights.push({
      type: 'warning',
      icon: '📦',
      text: 'Сьогодні ще немає замовлень — перевірте статус сайту',
    });
  }
  if (finance?.forecast?.projected_profit < 0) {
    insights.push({
      type: 'danger',
      icon: '💸',
      text: `Прогнозований збиток на кінець місяця: ${Math.abs(finance.forecast.projected_profit).toLocaleString('uk-UA')} ₴`,
    });
  }
  if (insights.length === 0 && !isLoading) {
    insights.push({
      type: 'success',
      icon: '✅',
      text: 'Все працює штатно. Критичних проблем не виявлено.',
    });
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">{dateStr}, {timeStr}</p>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>📦</span>}
          value={orders?.today?.count}
          label="Замовлень сьогодні"
          change={orders?.today?.count_change}
          isLoading={ordersLoading}
        />
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>💰</span>}
          value={orders?.today?.total}
          label="Виручка сьогодні"
          suffix=" ₴"
          change={orders?.today?.total_change}
          isLoading={ordersLoading}
        />
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>🏭</span>}
          value={warehouse?.queue?.total_not_shipped}
          label="Не відвантажено"
          isLoading={warehouseLoading}
        />
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>🧾</span>}
          value={finance?.kpis?.avg_check}
          label="Середній чек"
          suffix=" ₴"
          isLoading={financeLoading}
        />
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>📊</span>}
          value={finance?.kpis?.margin}
          label="Маржинальність"
          suffix="%"
          isLoading={financeLoading}
        />
      </div>

      {/* Quick Actions + System Status */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Quick Actions */}
        <div>
          <div className="section-header">
            <h2 className="section-title">⚡ Швидкі дії</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
            <div className="quick-action quick-action-primary" id="action-run-agent">
              <Play size={20} />
              <div className="quick-action-text">
                <div className="quick-action-title">Run Agent</div>
                <div className="quick-action-desc">Запустити AI worker</div>
              </div>
            </div>
            <div className="quick-action" id="action-approvals">
              <ClipboardCheck size={20} />
              <div className="quick-action-text">
                <div className="quick-action-title">Approvals</div>
                <div className="quick-action-desc">Перевірити рішення</div>
              </div>
            </div>
            <div className="quick-action" id="action-add-task">
              <PlusSquare size={20} />
              <div className="quick-action-text">
                <div className="quick-action-title">Add Task</div>
                <div className="quick-action-desc">Створити задачу</div>
              </div>
            </div>
            <div className="quick-action" id="action-search">
              <Info size={20} />
              <div className="quick-action-text">
                <div className="quick-action-title">Search Memory</div>
                <div className="quick-action-desc">Запит до бази знань</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <div className="section-header">
            <h2 className="section-title">🧠 AI Insights</h2>
            <span className="section-subtitle">Автоматичний аналіз</span>
          </div>
          <div className="glass-card-static">
            {isLoading ? (
              <div>
                <div className="skeleton-line w-80" style={{ marginBottom: '12px' }} />
                <div className="skeleton-line w-60" style={{ marginBottom: '12px' }} />
                <div className="skeleton-line w-50" />
              </div>
            ) : (
              insights.map((insight, i) => (
                <div key={i} className="insight-item">
                  <span className={`insight-icon insight-${insight.type}`}>{insight.icon}</span>
                  <span className="insight-text">{insight.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        <div className="glass-card-static">
          <div className="section-header">
            <h2 className="section-title">📈 Замовлення за 7 днів</h2>
          </div>
          {ordersLoading ? (
            <div className="skeleton-line" style={{ height: '200px', width: '100%' }} />
          ) : (
            <MiniChart
              data={orders?.trend || []}
              dataKey="orders"
              color="#B388FF"
              height={200}
              showAxis={true}
            />
          )}
        </div>

        <div className="glass-card-static">
          <div className="section-header">
            <h2 className="section-title">📦 Відвантаження за 7 днів</h2>
          </div>
          {warehouseLoading ? (
            <div className="skeleton-line" style={{ height: '200px', width: '100%' }} />
          ) : (
            <MiniChart
              data={warehouse?.shipmentTrend || []}
              dataKey="value"
              color="#00E676"
              height={200}
              showAxis={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
