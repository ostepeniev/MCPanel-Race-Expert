'use client';

import useSWR from 'swr';
import KPICard from '../components/KPICard';
import MiniChart from '../components/MiniChart';
import StatusBadge from '../components/StatusBadge';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function OrdersPage() {
  const { data, isLoading } = useSWR('/api/dashboard/orders', fetcher, { refreshInterval: 60000 });

  const statusLabels = {
    new: { label: 'Новий', icon: '🆕' },
    awaiting_payment: { label: 'Очікування оплати', icon: '⏳' },
    agreement: { label: 'Погодження', icon: '📋' },
    production: { label: 'Виробництво', icon: '🏭' },
    returned: { label: 'Повернуто складом', icon: '↩️' },
  };

  const renderColumn = (title, period, emoji) => {
    if (!period) return null;
    return (
      <div className="glass-card-static">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{emoji}</span> {title}
        </h3>

        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Кількість замовлень</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{period.count}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Сума замовлень</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{period.total?.toLocaleString('uk-UA')} ₴</span>
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>🎖️ Ветеранський спорт</span>
            <span style={{ fontWeight: 600 }}>{period.veteran_sport}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>📦 Інші</span>
            <span style={{ fontWeight: 600 }}>{period.other}</span>
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <span className={`kpi-change ${period.count_change > 0 ? 'positive' : period.count_change < 0 ? 'negative' : 'neutral'}`}>
              Кількість: {period.count_change > 0 ? '+' : ''}{period.count_change?.toFixed(1)}%
            </span>
            <span className={`kpi-change ${period.total_change > 0 ? 'positive' : period.total_change < 0 ? 'negative' : 'neutral'}`}>
              Сума: {period.total_change > 0 ? '+' : ''}{period.total_change?.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦 Замовлення</h1>
        <p className="page-subtitle">Блок 1 — дані з KEY CRM (оплачені + післяплата)</p>
      </div>

      {/* 3-column layout: Yesterday | Today | Month */}
      {isLoading ? (
        <div className="grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card-static">
              <div className="skeleton-line w-40" style={{ height: '1.25rem', marginBottom: '24px' }} />
              <div className="skeleton-line w-60" style={{ height: '2rem', marginBottom: '16px' }} />
              <div className="skeleton-line w-50" style={{ height: '1.5rem', marginBottom: '16px' }} />
              <div className="skeleton-line w-40" style={{ marginBottom: '8px' }} />
              <div className="skeleton-line w-40" style={{ marginBottom: '16px' }} />
              <div className="skeleton-line w-80" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
          {renderColumn('Минула доба', data?.yesterday, '📅')}
          {renderColumn('Сьогодні', data?.today, '☀️')}
          {renderColumn('Поточний місяць', data?.currentMonth, '📆')}
        </div>
      )}

      {/* Statuses + Payment */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Order Statuses */}
        <div className="glass-card-static">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>📊 Статуси замовлень</h3>
          {isLoading ? (
            <div>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '8px' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
              {Object.entries(statusLabels).map(([key, { label, icon }]) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                    <span>{icon}</span>
                    <StatusBadge status={key} />
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {data?.statuses?.[key] || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Breakdown */}
        <div className="glass-card-static">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>💳 Оплата (активні замовлення)</h3>
          {isLoading ? (
            <div>
              {[1,2,3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2.5rem', marginBottom: '12px' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {[
                { key: 'paid', label: 'Оплачено', icon: '✅', color: 'var(--accent-green)' },
                { key: 'unpaid', label: 'Не оплачено', icon: '❌', color: 'var(--accent-red)' },
                { key: 'cod', label: 'Післяплата', icon: '📮', color: 'var(--accent-yellow)' },
              ].map(({ key, label, icon, color }) => {
                const count = data?.payments?.[key] || 0;
                const total = Object.values(data?.payments || {}).reduce((s, c) => s + c, 0) || 1;
                const pct = (count / total * 100).toFixed(0);
                return (
                  <div key={key} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{icon}</span> {label}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{count}</span>
                    </div>
                    <div className="delay-bar">
                      <div className="delay-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trend chart */}
      <div className="glass-card-static">
        <div className="section-header">
          <h3 className="section-title">📈 Тренд замовлень (7 днів)</h3>
        </div>
        {isLoading ? (
          <div className="skeleton-line" style={{ height: '200px', width: '100%' }} />
        ) : (
          <MiniChart data={data?.trend || []} dataKey="orders" color="#B388FF" height={220} showAxis={true} />
        )}
      </div>
    </div>
  );
}
