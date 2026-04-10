'use client';

import useSWR from 'swr';
import KPICard from '../components/KPICard';
import MiniChart from '../components/MiniChart';
import DrillLink from '../components/DrillLink';

const fetcher = (url) => fetch(url).then(res => res.json());

const DELAY_COLORS = {
  over_24h: { label: '> 24г', color: '#F5C518', bg: 'rgba(245, 197, 24, 0.08)' },
  over_48h: { label: '> 48г', color: '#FF8C00', bg: 'rgba(255, 140, 0, 0.08)' },
  over_72h: { label: '> 72г', color: '#FF5500', bg: 'rgba(255, 85, 0, 0.08)' },
  over_96h: { label: '> 96г', color: '#E53935', bg: 'rgba(229, 57, 53, 0.08)' },
  over_120h: { label: '> 120г', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.08)' },
  over_144h: { label: '> 144г', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.10)' },
  over_168h: { label: '> 168г', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.14)' },
};

export default function WarehousePage() {
  const { data, isLoading } = useSWR('/api/dashboard/warehouse', fetcher, { refreshInterval: 60000 });

  const maxDelay = data ? Math.max(...Object.values(data.delays || {}), 1) : 1;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏭 Склад</h1>
        <p className="page-subtitle">Блок 3 — відвантаження (KEY CRM)</p>
      </div>

      {/* KPIs — uses CSS class, no inline grid */}
      <div className="kpi-grid mobile-kpi-2 page-section">
        <KPICard icon={<span style={{ fontSize: '1.25rem' }}>📦</span>} value={data?.yesterday?.shipped} label="Вчора" change={data?.yesterday?.change} isLoading={isLoading} />
        <KPICard icon={<span style={{ fontSize: '1.25rem' }}>📅</span>} value={data?.currentMonth?.shipped} label="За місяць" change={data?.currentMonth?.change} isLoading={isLoading} />
        <KPICard icon={<span style={{ fontSize: '1.25rem' }}>🏭</span>} value={data?.queue?.in_production} label="Виробництво" isLoading={isLoading} />
        <KPICard icon={<span style={{ fontSize: '1.25rem' }}>⚠️</span>} value={data?.totalDelayed} label="Затримка" isLoading={isLoading} />
      </div>

      {/* Queue + Trend */}
      <div className="grid-2 page-section">
        <div className="glass-card-static">
          <h3 className="cmd-card-title">📊 Стан черги</h3>
          {isLoading ? (
            <div>{[1,2,3,4].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2.5rem', marginBottom: '10px' }} />)}</div>
          ) : (
            <div className="cmd-rows">
              {[
                { label: 'Виробництво', value: data?.queue?.in_production, icon: '🏭', color: 'var(--accent-orange)' },
                { label: 'НЕ запаковано', value: data?.queue?.not_packed, icon: '📭', color: 'var(--accent-yellow)' },
                { label: 'Запаковано', value: data?.queue?.packed_not_shipped, icon: '📦', color: 'var(--accent-blue)' },
                { label: 'Не відвантажено', value: data?.queue?.total_not_shipped, icon: '🚫', color: 'var(--accent-red)' },
              ].map((item, i) => {
                const total = data?.queue?.total_not_shipped || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={i} className="wh-queue-item">
                    <div className="wh-queue-top">
                      <span className="wh-queue-label">{item.icon} {item.label}</span>
                      <span className="wh-queue-value">{item.value}</span>
                    </div>
                    <div className="delay-bar">
                      <div className="delay-bar-fill" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card-static">
          <h3 className="cmd-card-title">📈 Відвантаження · 7 днів</h3>
          {isLoading ? (
            <div className="skeleton-line" style={{ height: '200px', width: '100%' }} />
          ) : (
            <MiniChart data={data?.shipmentTrend || []} dataKey="value" color="#00E676" height={220} showAxis={true} />
          )}
        </div>
      </div>

      {/* Delays */}
      <div className="glass-card-static">
        <h3 className="cmd-card-title">⏰ Затримки відвантаження</h3>
        {isLoading ? (
          <div>{[1,2,3,4,5].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '8px' }} />)}</div>
        ) : (
          <div className="cmd-rows">
            {Object.entries(DELAY_COLORS).map(([key, config]) => {
              const count = data?.delays?.[key] || 0;
              const pct = Math.round((count / maxDelay) * 100);
              const isCritical = key === 'over_120h' || key === 'over_144h' || key === 'over_168h';

              return (
                <div key={key} className="wh-delay-row" style={{
                  background: config.bg,
                  borderColor: `${config.color}22`,
                  animation: isCritical && count > 0 ? 'pulse-red 1.5s ease-in-out infinite' : 'none',
                }}>
                  <span className="wh-delay-label" style={{ color: config.color }}>{config.label}</span>
                  <div className="wh-delay-bar">
                    <div className="delay-bar" style={{ height: '6px' }}>
                      <div className="delay-bar-fill" style={{ width: `${pct}%`, background: config.color }} />
                    </div>
                  </div>
                  <span className="wh-delay-count" style={{ color: config.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        {!isLoading && (
          <div className="wh-total-delayed">
            <span>Загалом із затримкою</span>
            <span className="wh-total-value" style={{ color: data?.totalDelayed > 20 ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>
              {data?.totalDelayed}
            </span>
          </div>
        )}
      </div>

      {/* Cross-links */}
      <div className="grid-2 page-section">
        <DrillLink href="/orders" label="Замовлення в роботі" icon="📦" />
        <DrillLink href="/sales" label="Аналіз продажів" icon="💰" />
      </div>
    </div>
  );
}
