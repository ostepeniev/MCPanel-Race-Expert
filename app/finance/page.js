'use client';

import useSWR from 'swr';
import KPICard from '../components/KPICard';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function FinancePage() {
  const { data, isLoading } = useSWR('/api/dashboard/finance?period=current_month', fetcher, { refreshInterval: 60000 });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💵 Фінанси</h1>
        <p className="page-subtitle">Блок 4 — фінансові показники (дані з 1C)</p>
      </div>

      {/* Monthly KPIs */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          📊 Поточний місяць
        </h3>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          <KPICard icon={<span>📦</span>} value={data?.kpis?.order_count} label="Замовлення" isLoading={isLoading} />
          <KPICard icon={<span>💰</span>} value={data?.kpis?.total_revenue} label="Сума замовлень" suffix=" ₴" isLoading={isLoading} />
          <KPICard icon={<span>🧾</span>} value={data?.kpis?.avg_check} label="Середній чек" suffix=" ₴" isLoading={isLoading} />
          <KPICard icon={<span>📊</span>} value={data?.kpis?.margin} label="Маржинальність" suffix="%" isLoading={isLoading} />
          <KPICard icon={<span>💎</span>} value={data?.kpis?.gross_profit} label="Валовий прибуток" suffix=" ₴" isLoading={isLoading} />
          <KPICard icon={<span>📈</span>} value={data?.kpis?.profitability} label="Рентабельність" suffix="%" isLoading={isLoading} />
        </div>
      </div>

      {/* Forecasts */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          🔮 Прогнози
        </h3>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <KPICard icon={<span>💸</span>} value={data?.forecast?.monthly_expenses} label="Орієнтовні витрати на місяць" suffix=" ₴" isLoading={isLoading} />
          <KPICard
            icon={<span>💵</span>}
            value={data?.forecast?.profit_to_date}
            label="Прибуток на поточну дату"
            suffix=" ₴"
            isLoading={isLoading}
            className={data?.forecast?.profit_to_date < 0 ? 'kpi-card-negative' : ''}
          />
          <KPICard
            icon={<span>🎯</span>}
            value={data?.forecast?.projected_profit}
            label="Прогнозований прибуток"
            suffix=" ₴"
            isLoading={isLoading}
            className={data?.forecast?.projected_profit < 0 ? 'kpi-card-negative' : ''}
          />
        </div>
      </div>

      {/* Balance Section */}
      <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
        💼 Фінанси — Баланс
      </h3>

      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Money */}
        <div className="glass-card-static">
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💰 Гроші
          </h4>
          {isLoading ? (
            <div>{[1,2,3,4].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Загальний залишок коштів</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  {data?.balance?.total_cash?.toLocaleString('uk-UA')} ₴
                </div>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                {data?.balance?.accounts?.map((acc) => (
                  <div key={acc.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{acc.type === 'bank' ? '🏦' : acc.type === 'cash' ? '💵' : '📋'}</span>
                      {acc.name}
                    </span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {Math.round(acc.balance).toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Receivables */}
        <div className="glass-card-static">
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📥 Дебіторська заборгованість
          </h4>
          {isLoading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Загальна дебіторка</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  {data?.balance?.receivables?.total?.toLocaleString('uk-UA')} ₴
                </div>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8125rem' }}>👤 По клієнтах</span>
                  <span style={{ fontWeight: 600 }}>{data?.balance?.receivables?.by_customers?.toLocaleString('uk-UA')} ₴</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8125rem' }}>🚚 По постачальниках</span>
                  <span style={{ fontWeight: 600 }}>{data?.balance?.receivables?.by_suppliers?.toLocaleString('uk-UA')} ₴</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Payables */}
        <div className="glass-card-static">
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📤 Кредиторська заборгованість
          </h4>
          {isLoading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Загальна кредиторка</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                  {data?.balance?.payables?.total?.toLocaleString('uk-UA')} ₴
                </div>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8125rem' }}>👤 По клієнтах</span>
                  <span style={{ fontWeight: 600 }}>{data?.balance?.payables?.by_customers?.toLocaleString('uk-UA')} ₴</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8125rem' }}>🚚 По постачальниках</span>
                  <span style={{ fontWeight: 600 }}>{data?.balance?.payables?.by_suppliers?.toLocaleString('uk-UA')} ₴</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Inventory */}
        <div className="glass-card-static">
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📦 Товар на складі
          </h4>
          {isLoading ? (
            <div>{[1,2].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Загальна кількість</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                  {data?.balance?.inventory?.total_qty?.toLocaleString('uk-UA')} шт
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Загальна собівартість</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                  {data?.balance?.inventory?.total_cost?.toLocaleString('uk-UA')} ₴
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Net Balance */}
      <div className="glass-card-static" style={{
        background: 'linear-gradient(135deg, rgba(179, 136, 255, 0.06), rgba(0, 230, 118, 0.04))',
        borderColor: 'rgba(179, 136, 255, 0.15)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
            🏦 Чистий баланс
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            гроші + дебіторка + товар − кредиторка
          </div>
          {isLoading ? (
            <div className="skeleton-value" style={{ margin: '0 auto', width: '200px', height: '3rem' }} />
          ) : (
            <div style={{
              fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em',
              color: (data?.balance?.net_balance || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>
              {data?.balance?.net_balance?.toLocaleString('uk-UA')} ₴
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
