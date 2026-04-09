'use client';

import useSWR from 'swr';
import KPICard from '../components/KPICard';
import MiniChart from '../components/MiniChart';

const fetcher = (url) => fetch(url).then(res => res.json());

const DELAY_COLORS = {
  over_24h: { label: '> 24 год (1 доба)', color: '#F5C518', bg: 'rgba(245, 197, 24, 0.08)' },
  over_48h: { label: '> 48 год (2 доби)', color: '#FF8C00', bg: 'rgba(255, 140, 0, 0.08)' },
  over_72h: { label: '> 72 год (3 доби)', color: '#FF5500', bg: 'rgba(255, 85, 0, 0.08)' },
  over_96h: { label: '> 96 год (4 доби)', color: '#E53935', bg: 'rgba(229, 57, 53, 0.08)' },
  over_120h: { label: '> 120 год (5 діб)', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.08)' },
  over_144h: { label: '> 144 год (6 діб)', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.10)' },
  over_168h: { label: '> 168 год (7+ діб)', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.14)' },
};

export default function WarehousePage() {
  const { data, isLoading } = useSWR('/api/dashboard/warehouse', fetcher, { refreshInterval: 60000 });

  const maxDelay = data ? Math.max(...Object.values(data.delays || {}), 1) : 1;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏭 Склад (відвантаження)</h1>
        <p className="page-subtitle">Блок 3 — дані з KEY CRM</p>
      </div>

      {/* Shipment KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-xl)' }}>
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>📦</span>}
          value={data?.yesterday?.shipped}
          label="Відвантажено вчора"
          change={data?.yesterday?.change}
          isLoading={isLoading}
        />
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>📅</span>}
          value={data?.currentMonth?.shipped}
          label="Відвантажено за місяць"
          change={data?.currentMonth?.change}
          isLoading={isLoading}
        />
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>🏭</span>}
          value={data?.queue?.in_production}
          label="У виробництві"
          isLoading={isLoading}
        />
        <KPICard
          icon={<span style={{ fontSize: '1.25rem' }}>⚠️</span>}
          value={data?.totalDelayed}
          label="Із затримкою"
          isLoading={isLoading}
        />
      </div>

      {/* Queue Status */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Queue details */}
        <div className="glass-card-static">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>📊 Поточний стан черги</h3>
          {isLoading ? (
            <div>{[1,2,3,4].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '3rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {[
                { label: 'У статусі "виробництво"', value: data?.queue?.in_production, icon: '🏭', color: 'var(--accent-orange)' },
                { label: 'НЕ запаковано', value: data?.queue?.not_packed, icon: '📭', color: 'var(--accent-yellow)' },
                { label: 'Запаковано, НЕ відвантажено', value: data?.queue?.packed_not_shipped, icon: '📦', color: 'var(--accent-blue)' },
                { label: 'Загалом НЕ відвантажено', value: data?.queue?.total_not_shipped, icon: '🚫', color: 'var(--accent-red)' },
              ].map((item, i) => {
                const total = data?.queue?.total_not_shipped || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{item.value}</span>
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

        {/* Shipment trend */}
        <div className="glass-card-static">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>📈 Відвантаження за 7 днів</h3>
          {isLoading ? (
            <div className="skeleton-line" style={{ height: '250px', width: '100%' }} />
          ) : (
            <MiniChart data={data?.shipmentTrend || []} dataKey="value" color="#00E676" height={260} showAxis={true} />
          )}
        </div>
      </div>

      {/* Delays Table */}
      <div className="glass-card-static">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
          ⏰ Розбивка по часу затримки
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
            (від підтвердження замовлення)
          </span>
        </h3>
        {isLoading ? (
          <div>{[1,2,3,4,5,6,7].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2.5rem', marginBottom: '8px' }} />)}</div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(DELAY_COLORS).map(([key, config]) => {
              const count = data?.delays?.[key] || 0;
              const pct = Math.round((count / maxDelay) * 100);
              const isCritical = key === 'over_120h' || key === 'over_144h' || key === 'over_168h';

              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: config.bg,
                  border: `1px solid ${config.color}22`,
                  animation: isCritical && count > 0 ? 'pulse-red 1.5s ease-in-out infinite' : 'none',
                }}>
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 500,
                    color: config.color, minWidth: '180px',
                  }}>
                    {config.label}
                  </span>

                  <div style={{ flex: 1 }}>
                    <div className="delay-bar" style={{ height: '8px' }}>
                      <div className="delay-bar-fill" style={{
                        width: `${pct}%`, background: config.color,
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} />
                    </div>
                  </div>

                  <span style={{
                    fontSize: '1.25rem', fontWeight: 700,
                    color: config.color, minWidth: '40px', textAlign: 'right',
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total delayed */}
        {!isLoading && (
          <div style={{
            marginTop: 'var(--space-lg)', padding: '12px 16px',
            borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-card)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600 }}>Загалом із затримкою</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: data?.totalDelayed > 20 ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>
              {data?.totalDelayed}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
