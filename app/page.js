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
  const bgColor = percent >= 100 ? 'rgba(0,230,118,0.12)' : percent >= 70 ? 'rgba(179,136,255,0.08)' : 'rgba(255,193,7,0.08)';
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
        {payload[1] && (
          <div style={{ fontSize: '0.75rem', color: '#7E7E96' }}>
            {payload[1].value} замовлень
          </div>
        )}
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

  const now = new Date();
  const dateStr = now.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  const tickerProgress = cmd ? (cmd.revenueTicker.current / cmd.revenueTicker.target * 100) : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">{dateStr}, {timeStr}</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE 1: Revenue Ticker                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card-static revenue-ticker-card" style={{ marginBottom: 'var(--space-xl)', textAlign: 'center', padding: '28px 24px' }}>
        {isLoading ? (
          <div className="skeleton-line" style={{ height: '4rem', width: '60%', margin: '0 auto 12px' }} />
        ) : (
          <>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              💰 Виручка з початку місяця
            </div>
            <div className="revenue-ticker-value" style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #B388FF, #00E676)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <AnimatedNumber value={cmd?.revenueTicker?.current || 0} /> ₴
            </div>
            <div style={{ marginTop: '16px', maxWidth: '500px', margin: '16px auto 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>0 ₴</span>
                <span>Ціль: {(cmd?.revenueTicker?.target || 0).toLocaleString('uk-UA')} ₴</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px', width: `${Math.min(tickerProgress, 100)}%`,
                  background: tickerProgress >= 100 ? 'linear-gradient(90deg, #00E676, #69F0AE)' : 'linear-gradient(90deg, #B388FF, #7C4DFF)',
                  transition: 'width 2s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: tickerProgress >= 85 ? 'var(--accent-green)' : 'var(--text-secondary)', marginTop: '6px', fontWeight: 600 }}>
                {tickerProgress.toFixed(1)}% від місячної цілі
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE 4: Goal Tracker (4 circular progress rings)        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          🎯 Цілі місяця
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
          {!isLoading && cmd?.goals && [
            { key: 'revenue', label: 'Виручка', icon: '💰', current: cmd.goals.revenue.current, target: cmd.goals.revenue.target, format: 'currency', projected: cmd.goals.revenue.projected },
            { key: 'orders', label: 'Замовлення', icon: '📦', current: cmd.goals.orders.current, target: cmd.goals.orders.target, format: 'number', projected: cmd.goals.orders.projected },
            { key: 'margin', label: 'Маржинальність', icon: '📊', current: cmd.goals.margin.current, target: cmd.goals.margin.target, format: 'percent' },
            { key: 'ship_time', label: 'Час відвантаження', icon: '🚀', current: cmd.goals.ship_time.current, target: cmd.goals.ship_time.target, format: 'hours', invert: true },
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
              <div key={g.key} className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', gap: '12px' }}>
                <ProgressRing percent={pct} size={90} stroke={7}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{Math.round(pct)}%</div>
                </ProgressRing>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>{g.icon} {g.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatVal(g.current)} / {formatVal(g.target)}
                  </div>
                  {g.projected && (
                    <div style={{ fontSize: '0.6875rem', color: g.projected >= g.target ? 'var(--accent-green)' : 'var(--accent-yellow)', marginTop: '4px' }}>
                      Прогноз: {formatVal(g.projected)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && [1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card-static" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="skeleton-line" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE 2: Month-over-Month + FEATURE 5: Attention Required */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Month Comparison */}
        <div className="glass-card-static">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>📊 Цей місяць vs Минулий</h3>
          {isLoading ? (
            <div>{[1, 2, 3, 4].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '12px' }} />)}</div>
          ) : cmd?.monthComparison && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                { label: 'Виручка', cur: cmd.monthComparison.current.revenue, prev: cmd.monthComparison.previous.revenue * cmd.monthComparison.monthProgress, format: 'M' },
                { label: 'Замовлення', cur: cmd.monthComparison.current.orders, prev: cmd.monthComparison.previous.orders * cmd.monthComparison.monthProgress, format: '#' },
                { label: 'Середній чек', cur: cmd.monthComparison.current.avg_check, prev: cmd.monthComparison.previous.avg_check, format: '₴' },
                { label: 'Маржинальність', cur: cmd.monthComparison.current.margin, prev: cmd.monthComparison.previous.margin, format: '%' },
                { label: 'Вал. прибуток', cur: cmd.monthComparison.current.gross_profit, prev: cmd.monthComparison.previous.gross_profit * cmd.monthComparison.monthProgress, format: 'M' },
              ].map((row, i) => {
                const change = row.prev ? ((row.cur - row.prev) / row.prev * 100) : 0;
                const isPositive = change > 0;
                const formatVal = (v) => {
                  if (row.format === 'M') return `${(v / 1_000_000).toFixed(1)}M ₴`;
                  if (row.format === '#') return Math.round(v).toLocaleString('uk-UA');
                  if (row.format === '₴') return `${Math.round(v).toLocaleString('uk-UA')} ₴`;
                  if (row.format === '%') return `${v}%`;
                  return v;
                };
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatVal(row.cur)}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', minWidth: '50px', textAlign: 'right' }}>
                        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
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
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>🔔 Потрібна увага</h3>
          {isLoading ? (
            <div>{[1, 2, 3].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '3rem', marginBottom: '12px' }} />)}</div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {(cmd?.alerts || []).map((alert, i) => {
                const bgMap = { danger: 'rgba(255,23,68,0.06)', warning: 'rgba(255,193,7,0.06)', info: 'rgba(179,136,255,0.06)' };
                const borderMap = { danger: 'rgba(255,23,68,0.15)', warning: 'rgba(255,193,7,0.15)', info: 'rgba(179,136,255,0.15)' };
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '10px',
                    background: bgMap[alert.type] || bgMap.info,
                    border: `1px solid ${borderMap[alert.type] || borderMap.info}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span style={{ fontSize: '1.125rem' }}>{alert.icon}</span>
                      <span style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>{alert.text}</span>
                    </div>
                    <button style={{
                      fontSize: '0.6875rem', padding: '4px 10px', borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '8px',
                    }}>{alert.action}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE 3: Weekly Winners (TOP-5 podium)                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card-static" style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>🏆 ТОП-5 товарів тижня</h3>
        {isLoading ? (
          <div>{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '2.5rem', marginBottom: '8px' }} />)}</div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {(cmd?.weeklyWinners || []).map((item, i) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              const maxRev = cmd.weeklyWinners[0]?.revenue || 1;
              const barPct = (item.revenue / maxRev * 100).toFixed(0);
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 60px',
                  alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px',
                  background: i === 0 ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.12)' : 'var(--border-subtle)'}`,
                }}>
                  <span style={{ fontSize: '1.25rem', textAlign: 'center' }}>{medals[i]}</span>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div className="delay-bar" style={{ height: '4px', marginTop: '6px' }}>
                      <div className="delay-bar-fill" style={{ width: `${barPct}%`, background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#B388FF' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{item.qty.toLocaleString('uk-UA')}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>шт</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{(item.revenue / 1000).toFixed(0)}k ₴</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>виручка</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8125rem', fontWeight: 600, color: item.margin >= 50 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                    {item.margin}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE 6: 30-Day Revenue Trend (Area Chart)               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card-static" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="section-header">
          <h3 className="section-title">📈 Виручка за 30 днів</h3>
        </div>
        {isLoading ? (
          <div className="skeleton-line" style={{ height: '280px', width: '100%' }} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cmd?.revenueTrend30 || []} margin={{ top: 5, right: 15, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B388FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B388FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E676" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7E7E96' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#7E7E96' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip content={<TrendTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#B388FF" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE 7: Unit Economics                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          🧮 Unit Economics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-md)' }}>
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="glass-card-static"><div className="skeleton-line w-60" style={{ height: '2rem', marginBottom: '8px' }} /><div className="skeleton-line w-40" /></div>)
          ) : cmd?.unitEcon && [
            { label: 'AOV (Сер. чек)', value: `${cmd.unitEcon.aov.toLocaleString('uk-UA')} ₴`, icon: '🧾' },
            { label: 'ARPU', value: `${cmd.unitEcon.arpu.toLocaleString('uk-UA')} ₴`, icon: '👤' },
            { label: 'Повторні покупки', value: `${cmd.unitEcon.repeat_rate}%`, icon: '🔄' },
            { label: '% повернень', value: `${cmd.unitEcon.return_rate}%`, icon: '↩️' },
            { label: 'Замов./клієнт', value: cmd.unitEcon.orders_per_customer, icon: '📊' },
          ].map((item, i) => (
            <div key={i} className="glass-card-static" style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>{item.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>
        {!isLoading && cmd?.unitEcon && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <div className="glass-card-static" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>👥 Всього клієнтів за місяць</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{cmd.unitEcon.total_customers.toLocaleString('uk-UA')}</span>
            </div>
            <div className="glass-card-static" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>🆕 Нових клієнтів</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)' }}>{cmd.unitEcon.new_customers.toLocaleString('uk-UA')}</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Charts Row (existing — 7-day orders + shipments)           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid-2">
        <div className="glass-card-static">
          <div className="section-header">
            <h2 className="section-title">📦 Замовлення за 7 днів</h2>
          </div>
          {ordersLoading ? (
            <div className="skeleton-line" style={{ height: '200px', width: '100%' }} />
          ) : (
            <MiniChart data={orders?.trend || []} dataKey="orders" color="#B388FF" height={200} showAxis={true} />
          )}
        </div>

        <div className="glass-card-static">
          <div className="section-header">
            <h2 className="section-title">🚛 Відвантаження за 7 днів</h2>
          </div>
          {warehouseLoading ? (
            <div className="skeleton-line" style={{ height: '200px', width: '100%' }} />
          ) : (
            <MiniChart data={warehouse?.shipTrend || []} dataKey="shipped" color="#00E676" height={200} showAxis={true} />
          )}
        </div>
      </div>
    </div>
  );
}
