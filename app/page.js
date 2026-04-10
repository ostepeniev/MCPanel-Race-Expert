'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import MiniChart from './components/MiniChart';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fetcher = (url) => fetch(url).then(res => res.json());

// ─── Animated Counter ────────────────────────────────────────
function AnimatedNumber({ value, duration = 2000 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value == null) return;
    const start = display;
    const diff = value - start;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <>{display.toLocaleString('uk-UA')}</>;
}

// ─── Circular Progress Ring ──────────────────────────────────
function ProgressRing({ percent, size = 80, stroke = 6, color = '#B388FF', children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const ringColor = percent >= 100 ? '#00E676' : percent >= 70 ? color : '#FFC107';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── Revenue Trend Tooltip ───────────────────────────────────
const TrendTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#16161E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: '0.6875rem', color: '#7E7E96', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0F0F5' }}>
          {Number(payload[0].value).toLocaleString('uk-UA')} ₴
        </div>
      </div>
    );
  }
  return null;
};

export default function CommandCenter() {
  const { data: orders, isLoading: ordersLoading } = useSWR('/api/dashboard/orders', fetcher, { refreshInterval: 60000 });
  const { data: warehouse, isLoading: warehouseLoading } = useSWR('/api/dashboard/warehouse', fetcher, { refreshInterval: 60000 });
  const { data: finance, isLoading: financeLoading } = useSWR('/api/dashboard/finance', fetcher, { refreshInterval: 60000 });
  const { data: cmd, isLoading: cmdLoading } = useSWR('/api/dashboard/command', fetcher, { refreshInterval: 60000 });

  const isLoading = ordersLoading || warehouseLoading || financeLoading || cmdLoading;

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }));
    setTimeStr(now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const tickerProgress = cmd ? (cmd.revenueTicker.current / cmd.revenueTicker.target * 100) : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">{dateStr}, {timeStr}</p>
      </div>

      {/* ═══ FEATURE 1: Revenue Ticker ═══ */}
      <div className="glass-card-static cmd-ticker">
        {isLoading ? (
          <div className="skeleton-line" style={{ height: '3rem', width: '60%', margin: '0 auto 12px' }} />
        ) : (
          <>
            <div className="cmd-ticker-label">💰 Виручка з початку місяця</div>
            <div className="cmd-ticker-value">
              <AnimatedNumber value={cmd?.revenueTicker?.current || 0} /> ₴
            </div>
            <div className="cmd-ticker-bar-wrap">
              <div className="cmd-ticker-bar-labels">
                <span>0 ₴</span>
                <span>Ціль: {(cmd?.revenueTicker?.target || 0).toLocaleString('uk-UA')} ₴</span>
              </div>
              <div className="cmd-ticker-bar">
                <div className="cmd-ticker-bar-fill" style={{
                  width: `${Math.min(tickerProgress, 100)}%`,
                  background: tickerProgress >= 100 ? 'linear-gradient(90deg, #00E676, #69F0AE)' : 'linear-gradient(90deg, #B388FF, #7C4DFF)',
                }} />
              </div>
              <div className="cmd-ticker-pct" style={{ color: tickerProgress >= 85 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                {tickerProgress.toFixed(1)}% від місячної цілі
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ FEATURE 4: Goal Tracker ═══ */}
      <div className="cmd-section">
        <h3 className="cmd-section-title">🎯 Цілі місяця</h3>
        <div className="cmd-goals-grid">
          {!isLoading && cmd?.goals && [
            { key: 'revenue', label: 'Виручка', icon: '💰', current: cmd.goals.revenue.current, target: cmd.goals.revenue.target, format: 'currency', projected: cmd.goals.revenue.projected },
            { key: 'orders', label: 'Замовлення', icon: '📦', current: cmd.goals.orders.current, target: cmd.goals.orders.target, format: 'number', projected: cmd.goals.orders.projected },
            { key: 'margin', label: 'Маржа', icon: '📊', current: cmd.goals.margin.current, target: cmd.goals.margin.target, format: 'percent' },
            { key: 'ship_time', label: 'Відвантаження', icon: '🚀', current: cmd.goals.ship_time.current, target: cmd.goals.ship_time.target, format: 'hours', invert: true },
          ].map(g => {
            const pct = g.invert
              ? Math.min(100, (g.target / Math.max(g.current, 0.1)) * 100)
              : Math.min(100, (g.current / Math.max(g.target, 1)) * 100);
            const formatVal = (v) => {
              if (g.format === 'currency') return `${(v / 1_000_000).toFixed(1)}M`;
              if (g.format === 'number') return v.toLocaleString('uk-UA');
              if (g.format === 'percent') return `${v}%`;
              if (g.format === 'hours') return `${Math.round(v)}г`;
              return v;
            };
            return (
              <div key={g.key} className="glass-card-static cmd-goal-card">
                <ProgressRing percent={pct} size={72} stroke={6}>
                  <div className="cmd-goal-pct">{Math.round(pct)}%</div>
                </ProgressRing>
                <div className="cmd-goal-info">
                  <div className="cmd-goal-label">{g.icon} {g.label}</div>
                  <div className="cmd-goal-values">{formatVal(g.current)} / {formatVal(g.target)}</div>
                  {g.projected && (
                    <div className="cmd-goal-projected" style={{ color: g.projected >= g.target ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                      Прогноз: {formatVal(g.projected)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && [1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card-static cmd-goal-card">
              <div className="skeleton-line" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FEATURE 2+5: Month Comparison + Attention ═══ */}
      <div className="grid-2 cmd-section">
        {/* Month Comparison */}
        <div className="glass-card-static">
          <h3 className="cmd-card-title">📊 Цей місяць vs Минулий</h3>
          {isLoading ? (
            <div>{[1, 2, 3, 4].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '10px' }} />)}</div>
          ) : cmd?.monthComparison && (
            <div className="cmd-rows">
              {[
                { label: 'Виручка', cur: cmd.monthComparison.current.revenue, prev: cmd.monthComparison.previous.revenue * cmd.monthComparison.monthProgress, format: 'M' },
                { label: 'Замовлення', cur: cmd.monthComparison.current.orders, prev: cmd.monthComparison.previous.orders * cmd.monthComparison.monthProgress, format: '#' },
                { label: 'Сер. чек', cur: cmd.monthComparison.current.avg_check, prev: cmd.monthComparison.previous.avg_check, format: '₴' },
                { label: 'Маржа', cur: cmd.monthComparison.current.margin, prev: cmd.monthComparison.previous.margin, format: '%' },
                { label: 'Прибуток', cur: cmd.monthComparison.current.gross_profit, prev: cmd.monthComparison.previous.gross_profit * cmd.monthComparison.monthProgress, format: 'M' },
              ].map((row, i) => {
                const change = row.prev ? ((row.cur - row.prev) / row.prev * 100) : 0;
                const isPositive = change > 0;
                const formatVal = (v) => {
                  if (row.format === 'M') return `${(v / 1_000_000).toFixed(1)}M`;
                  if (row.format === '#') return Math.round(v).toLocaleString('uk-UA');
                  if (row.format === '₴') return `${Math.round(v).toLocaleString('uk-UA')}₴`;
                  if (row.format === '%') return `${v}%`;
                  return v;
                };
                return (
                  <div key={i} className="cmd-row">
                    <span className="cmd-row-label">{row.label}</span>
                    <div className="cmd-row-right">
                      <span className="cmd-row-value">{formatVal(row.cur)}</span>
                      <span className={`cmd-row-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '↑' : '↓'}{Math.abs(change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attention Required */}
        <div className="glass-card-static">
          <h3 className="cmd-card-title">🔔 Потрібна увага</h3>
          {isLoading ? (
            <div>{[1, 2, 3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2.5rem', marginBottom: '10px' }} />)}</div>
          ) : (
            <div className="cmd-rows">
              {(cmd?.alerts || []).map((alert, i) => (
                <div key={i} className={`cmd-alert cmd-alert-${alert.type}`}>
                  <span className="cmd-alert-icon">{alert.icon}</span>
                  <span className="cmd-alert-text">{alert.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ FEATURE 3: Weekly Winners ═══ */}
      <div className="glass-card-static cmd-section">
        <h3 className="cmd-card-title">🏆 ТОП-5 товарів тижня</h3>
        {isLoading ? (
          <div>{[1, 2, 3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2.5rem', marginBottom: '8px' }} />)}</div>
        ) : (
          <div className="cmd-rows">
            {(cmd?.weeklyWinners || []).map((item, i) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              const maxRev = cmd.weeklyWinners[0]?.revenue || 1;
              const barPct = (item.revenue / maxRev * 100).toFixed(0);
              return (
                <div key={i} className={`cmd-winner ${i === 0 ? 'cmd-winner-gold' : ''}`}>
                  <span className="cmd-winner-medal">{medals[i]}</span>
                  <div className="cmd-winner-info">
                    <div className="cmd-winner-name">{item.name}</div>
                    <div className="delay-bar" style={{ height: '3px', marginTop: '4px' }}>
                      <div className="delay-bar-fill" style={{ width: `${barPct}%`, background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#B388FF' }} />
                    </div>
                  </div>
                  <div className="cmd-winner-stats">
                    <span className="cmd-winner-qty">{item.qty.toLocaleString('uk-UA')} шт</span>
                    <span className="cmd-winner-rev">{(item.revenue / 1000).toFixed(0)}k ₴</span>
                  </div>
                  <span className={`cmd-winner-margin ${item.margin >= 50 ? 'positive' : ''}`}>{item.margin}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ FEATURE 6: 30-Day Revenue Trend ═══ */}
      <div className="glass-card-static cmd-section">
        <h3 className="cmd-card-title">📈 Виручка за 30 днів</h3>
        {isLoading ? (
          <div className="skeleton-line" style={{ height: '200px', width: '100%' }} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cmd?.revenueTrend30 || []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B388FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B388FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#7E7E96' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 9, fill: '#7E7E96' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} width={40} />
              <Tooltip content={<TrendTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#B388FF" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ═══ FEATURE 7: Unit Economics ═══ */}
      <div className="cmd-section">
        <h3 className="cmd-section-title">🧮 Unit Economics</h3>
        <div className="cmd-unit-grid">
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="glass-card-static"><div className="skeleton-line w-60" style={{ height: '2rem' }} /></div>)
          ) : cmd?.unitEcon && [
            { label: 'AOV', value: `${cmd.unitEcon.aov.toLocaleString('uk-UA')} ₴`, icon: '🧾' },
            { label: 'ARPU', value: `${cmd.unitEcon.arpu.toLocaleString('uk-UA')} ₴`, icon: '👤' },
            { label: 'Повторні', value: `${cmd.unitEcon.repeat_rate}%`, icon: '🔄' },
            { label: 'Поверн.', value: `${cmd.unitEcon.return_rate}%`, icon: '↩️' },
            { label: 'Зам/кліент', value: cmd.unitEcon.orders_per_customer, icon: '📊' },
          ].map((item, i) => (
            <div key={i} className="glass-card-static cmd-unit-card">
              <div className="cmd-unit-icon">{item.icon}</div>
              <div className="cmd-unit-value">{item.value}</div>
              <div className="cmd-unit-label">{item.label}</div>
            </div>
          ))}
        </div>
        {!isLoading && cmd?.unitEcon && (
          <div className="grid-2" style={{ marginTop: 'var(--space-md)' }}>
            <div className="glass-card-static cmd-unit-row">
              <span>👥 Клієнтів за місяць</span>
              <strong>{cmd.unitEcon.total_customers.toLocaleString('uk-UA')}</strong>
            </div>
            <div className="glass-card-static cmd-unit-row">
              <span>🆕 Нових</span>
              <strong style={{ color: 'var(--accent-green)' }}>{cmd.unitEcon.new_customers.toLocaleString('uk-UA')}</strong>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Charts Row ═══ */}
      <div className="grid-2">
        <div className="glass-card-static">
          <h3 className="cmd-card-title">📦 Замовлення · 7 днів</h3>
          {ordersLoading ? (
            <div className="skeleton-line" style={{ height: '160px', width: '100%' }} />
          ) : (
            <MiniChart data={orders?.trend || []} dataKey="orders" color="#B388FF" height={160} showAxis={true} />
          )}
        </div>
        <div className="glass-card-static">
          <h3 className="cmd-card-title">🚛 Відвантаження · 7 днів</h3>
          {warehouseLoading ? (
            <div className="skeleton-line" style={{ height: '160px', width: '100%' }} />
          ) : (
            <MiniChart data={warehouse?.shipTrend || []} dataKey="shipped" color="#00E676" height={160} showAxis={true} />
          )}
        </div>
      </div>
    </div>
  );
}
