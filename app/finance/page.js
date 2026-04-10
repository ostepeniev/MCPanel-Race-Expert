'use client';

import useSWR from 'swr';
import KPICard from '../components/KPICard';
import DrillLink from '../components/DrillLink';

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
      <div className="page-section">
        <h3 className="cmd-section-title">📊 Поточний місяць</h3>
        <div className="kpi-grid mobile-kpi-3">
          <KPICard icon={<span>📦</span>} value={data?.kpis?.order_count} label="Замовлення" isLoading={isLoading} />
          <KPICard icon={<span>💰</span>} value={data?.kpis?.total_revenue} label="Сума замовлень" suffix=" ₴" isLoading={isLoading} />
          <KPICard icon={<span>🧾</span>} value={data?.kpis?.avg_check} label="Середній чек" suffix=" ₴" isLoading={isLoading} />
          <KPICard icon={<span>📊</span>} value={data?.kpis?.margin} label="Маржинальність" suffix="%" isLoading={isLoading} />
          <KPICard icon={<span>💎</span>} value={data?.kpis?.gross_profit} label="Вал. прибуток" suffix=" ₴" isLoading={isLoading} />
          <KPICard icon={<span>📈</span>} value={data?.kpis?.profitability} label="Рентабельність" suffix="%" isLoading={isLoading} />
        </div>
      </div>

      {/* Forecasts */}
      <div className="page-section">
        <h3 className="cmd-section-title">🔮 Прогнози</h3>
        <div className="kpi-grid mobile-kpi-3">
          <KPICard icon={<span>💸</span>} value={data?.forecast?.monthly_expenses} label="Витрати/місяць" suffix=" ₴" isLoading={isLoading} />
          <KPICard
            icon={<span>💵</span>}
            value={data?.forecast?.profit_to_date}
            label="Прибуток на дату"
            suffix=" ₴"
            isLoading={isLoading}
            className={data?.forecast?.profit_to_date < 0 ? 'kpi-card-negative' : ''}
          />
          <KPICard
            icon={<span>🎯</span>}
            value={data?.forecast?.projected_profit}
            label="Прогноз прибутку"
            suffix=" ₴"
            isLoading={isLoading}
            className={data?.forecast?.projected_profit < 0 ? 'kpi-card-negative' : ''}
          />
        </div>
      </div>

      {/* Balance Section */}
      <h3 className="cmd-section-title">💼 Фінанси — Баланс</h3>

      <div className="grid-2 page-section">
        {/* Money */}
        <div className="glass-card-static">
          <h4 className="cmd-card-title">💰 Гроші</h4>
          {isLoading ? (
            <div>{[1,2,3,4].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <>
              <div className="fin-big-number">
                <div className="fin-big-label">Загальний залишок коштів</div>
                <div className="fin-big-value green">{data?.balance?.total_cash?.toLocaleString('uk-UA')} ₴</div>
              </div>
              <div className="cmd-rows">
                {data?.balance?.accounts?.map((acc) => (
                  <div key={acc.id} className="cmd-row">
                    <span className="cmd-row-label">
                      {acc.type === 'bank' ? '🏦' : acc.type === 'cash' ? '💵' : '📋'} {acc.name}
                    </span>
                    <span className="cmd-row-value">{Math.round(acc.balance).toLocaleString('uk-UA')} ₴</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Receivables */}
        <div className="glass-card-static">
          <h4 className="cmd-card-title">📥 Дебіторка</h4>
          {isLoading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <>
              <div className="fin-big-number">
                <div className="fin-big-label">Загальна дебіторка</div>
                <div className="fin-big-value blue">{data?.balance?.receivables?.total?.toLocaleString('uk-UA')} ₴</div>
              </div>
              <div className="cmd-rows">
                <div className="cmd-row">
                  <span className="cmd-row-label">👤 По клієнтах</span>
                  <span className="cmd-row-value">{data?.balance?.receivables?.by_customers?.toLocaleString('uk-UA')} ₴</span>
                </div>
                <div className="cmd-row">
                  <span className="cmd-row-label">🚚 По постачальниках</span>
                  <span className="cmd-row-value">{data?.balance?.receivables?.by_suppliers?.toLocaleString('uk-UA')} ₴</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid-2 page-section">
        {/* Payables */}
        <div className="glass-card-static">
          <h4 className="cmd-card-title">📤 Кредиторка</h4>
          {isLoading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <>
              <div className="fin-big-number">
                <div className="fin-big-label">Загальна кредиторка</div>
                <div className="fin-big-value red">{data?.balance?.payables?.total?.toLocaleString('uk-UA')} ₴</div>
              </div>
              <div className="cmd-rows">
                <div className="cmd-row">
                  <span className="cmd-row-label">👤 По клієнтах</span>
                  <span className="cmd-row-value">{data?.balance?.payables?.by_customers?.toLocaleString('uk-UA')} ₴</span>
                </div>
                <div className="cmd-row">
                  <span className="cmd-row-label">🚚 По постачальниках</span>
                  <span className="cmd-row-value">{data?.balance?.payables?.by_suppliers?.toLocaleString('uk-UA')} ₴</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Inventory */}
        <div className="glass-card-static">
          <h4 className="cmd-card-title">📦 Товар на складі</h4>
          {isLoading ? (
            <div>{[1,2].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <div className="cmd-rows" style={{ gap: 'var(--space-md)' }}>
              <div>
                <div className="fin-big-label">Загальна кількість</div>
                <div className="fin-mid-value">{data?.balance?.inventory?.total_qty?.toLocaleString('uk-UA')} шт</div>
              </div>
              <div>
                <div className="fin-big-label">Загальна собівартість</div>
                <div className="fin-mid-value purple">{data?.balance?.inventory?.total_cost?.toLocaleString('uk-UA')} ₴</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Net Balance */}
      <div className="glass-card-static fin-net-balance">
        <div className="fin-big-label" style={{ marginBottom: '4px' }}>🏦 Чистий баланс</div>
        <div className="fin-net-formula">гроші + дебіторка + товар − кредиторка</div>
        {isLoading ? (
          <div className="skeleton-value" style={{ margin: '0 auto', width: '200px', height: '3rem' }} />
        ) : (
          <div className="fin-net-value" style={{ color: (data?.balance?.net_balance || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {data?.balance?.net_balance?.toLocaleString('uk-UA')} ₴
          </div>
        )}
      </div>

      {/* Cross-links */}
      <div className="grid-2 page-section">
        <DrillLink href="/sales" label="Аналіз продажів" icon="💰" />
        <DrillLink href="/orders" label="Деталі замовлень" icon="📦" />
      </div>
    </div>
  );
}
