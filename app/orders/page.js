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
    returned: { label: 'Повернуто', icon: '↩️' },
  };

  const renderColumn = (title, period, emoji) => {
    if (!period) return null;
    return (
      <div className="glass-card-static">
        <h3 className="cmd-card-title">{emoji} {title}</h3>
        <div className="cmd-rows" style={{ gap: 'var(--space-md)' }}>
          <div className="cmd-row">
            <span className="cmd-row-label">Замовлень</span>
            <span className="ord-big-val">{period.count}</span>
          </div>
          <div className="cmd-row">
            <span className="cmd-row-label">Сума</span>
            <span className="cmd-row-value">{period.total?.toLocaleString('uk-UA')} ₴</span>
          </div>
          <div className="cmd-row">
            <span className="cmd-row-label">🎖️ Ветеранський</span>
            <span className="cmd-row-value">{period.veteran_sport}</span>
          </div>
          <div className="cmd-row">
            <span className="cmd-row-label">📦 Інші</span>
            <span className="cmd-row-value">{period.other}</span>
          </div>
          <div className="ord-changes">
            <span className={`kpi-change ${period.count_change > 0 ? 'positive' : period.count_change < 0 ? 'negative' : 'neutral'}`}>
              К-ть: {period.count_change > 0 ? '+' : ''}{period.count_change?.toFixed(1)}%
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
        <p className="page-subtitle">Блок 1 — KEY CRM (оплачені + післяплата)</p>
      </div>

      {/* 3-column: Yesterday | Today | Month */}
      {isLoading ? (
        <div className="grid-3 page-section">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card-static">
              <div className="skeleton-line w-40" style={{ height: '1.25rem', marginBottom: '20px' }} />
              <div className="skeleton-line w-60" style={{ height: '2rem', marginBottom: '14px' }} />
              <div className="skeleton-line w-50" style={{ height: '1.5rem', marginBottom: '14px' }} />
              <div className="skeleton-line w-40" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-3 page-section">
          {renderColumn('Вчора', data?.yesterday, '📅')}
          {renderColumn('Сьогодні', data?.today, '☀️')}
          {renderColumn('Місяць', data?.currentMonth, '📆')}
        </div>
      )}

      {/* Statuses + Payment */}
      <div className="grid-2 page-section">
        <div className="glass-card-static">
          <h3 className="cmd-card-title">📊 Статуси</h3>
          {isLoading ? (
            <div>{[1,2,3,4,5].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '8px' }} />)}</div>
          ) : (
            <div className="cmd-rows">
              {Object.entries(statusLabels).map(([key, { icon }]) => (
                <div key={key} className="cmd-row">
                  <span className="cmd-row-label">
                    {icon} <StatusBadge status={key} />
                  </span>
                  <span className="ord-big-val">{data?.statuses?.[key] || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card-static">
          <h3 className="cmd-card-title">💳 Оплата</h3>
          {isLoading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2.5rem', marginBottom: '10px' }} />)}</div>
          ) : (
            <div className="cmd-rows" style={{ gap: 'var(--space-md)' }}>
              {[
                { key: 'paid', label: 'Оплачено', icon: '✅', color: 'var(--accent-green)' },
                { key: 'unpaid', label: 'Не оплачено', icon: '❌', color: 'var(--accent-red)' },
                { key: 'cod', label: 'Післяплата', icon: '📮', color: 'var(--accent-yellow)' },
              ].map(({ key, label, icon, color }) => {
                const count = data?.payments?.[key] || 0;
                const total = Object.values(data?.payments || {}).reduce((s, c) => s + c, 0) || 1;
                const pct = (count / total * 100).toFixed(0);
                return (
                  <div key={key} className="ord-payment-item">
                    <div className="ord-payment-top">
                      <span>{icon} {label}</span>
                      <span className="ord-payment-count">{count}</span>
                    </div>
                    <div className="delay-bar">
                      <div className="delay-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="ord-payment-pct">{pct}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trend */}
      <div className="glass-card-static">
        <h3 className="cmd-card-title">📈 Тренд · 7 днів</h3>
        {isLoading ? (
          <div className="skeleton-line" style={{ height: '180px', width: '100%' }} />
        ) : (
          <MiniChart data={data?.trend || []} dataKey="orders" color="#B388FF" height={180} showAxis={true} />
        )}
      </div>
    </div>
  );
}
