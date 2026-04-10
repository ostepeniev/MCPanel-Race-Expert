'use client';

import useSWR from 'swr';
import DataTable from '../components/DataTable';
import DrillLink from '../components/DrillLink';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fetcher = (url) => fetch(url).then(res => res.json());

const COLORS = ['#B388FF', '#7C4DFF', '#651FFF', '#6200EA', '#AA00FF', '#D500F9', '#E040FB', '#EA80FC', '#CE93D8', '#BA68C8'];

const CustomTooltip = ({ active, payload, label }) => {
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

export default function SalesPage() {
  const { data, isLoading } = useSWR('/api/dashboard/sales?period=current_month', fetcher, { refreshInterval: 60000 });

  // Show fewer columns on all screens — keep it scannable  
  const salesColumns = [
    { key: 'name', label: 'Назва', width: '30%' },
    { key: 'total_qty', label: 'Кількість', align: 'right', format: 'number' },
    { key: 'revenue', label: 'Виручка (₴)', align: 'right', format: 'currency' },
    { key: 'avg_price', label: 'Сер. ціна (₴)', align: 'right', format: 'currency' },
  ];

  const brandColumns = salesColumns.map(c => c.key === 'name' ? { ...c, key: 'brand', label: 'Бренд' } : c);
  const supplierColumns = salesColumns.map(c => c.key === 'name' ? { ...c, key: 'supplier', label: 'Постачальник' } : c);
  const categoryColumns = salesColumns.map(c => c.key === 'name' ? { ...c, key: 'category', label: 'Категорія' } : c);
  const bundleColumns = [
    { key: 'bundle_name', label: 'Набір', width: '35%' },
    { key: 'total_qty', label: 'К-ть', align: 'right', format: 'number' },
    { key: 'revenue', label: 'Виручка (₴)', align: 'right', format: 'currency' },
    { key: 'margin', label: 'Маржа', align: 'right', format: 'percent' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💰 Продажі</h1>
        <p className="page-subtitle">Блок 2 — дані з 1C (поточний місяць)</p>
      </div>

      {/* KPIs */}
      {!isLoading && data && (
        <div className="kpi-grid mobile-kpi-3" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-value">{data.totalRevenue?.toLocaleString('uk-UA')} ₴</div>
            <div className="kpi-label">Загальна виручка</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">📊</div>
            <div className="kpi-value">{data.byBrands?.length || 0}</div>
            <div className="kpi-label">Активних брендів</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-value">{data.byCategories?.length || 0}</div>
            <div className="kpi-label">Категорій</div>
          </div>
        </div>
      )}

      {/* Tables */}
      <div className="page-section">
        <DataTable columns={brandColumns} data={data?.byBrands} isLoading={isLoading} title="🏷️ Продажі по брендах" subtitle="Сортується по виручці" />
      </div>
      <div className="page-section">
        <DataTable columns={supplierColumns} data={data?.bySuppliers} isLoading={isLoading} title="🚚 Продажі по постачальниках" />
      </div>
      <div className="page-section">
        <DataTable columns={bundleColumns} data={data?.byBundles} isLoading={isLoading} title="📦 Продажі по наборах" />
      </div>
      <div className="page-section">
        <DataTable columns={categoryColumns} data={data?.byCategories} isLoading={isLoading} title="📂 Продажі по категоріях" />
      </div>

      {/* TOP-10 Charts */}
      <div className="grid-2">
        <div className="glass-card-static">
          <h3 className="cmd-card-title">🏆 ТОП-10 по виручці</h3>
          {isLoading ? (
            <div>{[1,2,3,4,5].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '1.5rem', marginBottom: '8px' }} />)}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.topByRevenue?.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#7E7E96' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9, fill: '#7E7E96' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.length > 18 ? v.substring(0, 18) + '…' : v} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={14}>
                  {data?.topByRevenue?.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card-static">
          <h3 className="cmd-card-title">💎 ТОП-10 по прибутку</h3>
          {isLoading ? (
            <div>{[1,2,3,4,5].map(i => <div key={i} className="skeleton-line w-80" style={{ height: '1.5rem', marginBottom: '8px' }} />)}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.topByProfit?.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#7E7E96' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9, fill: '#7E7E96' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.length > 18 ? v.substring(0, 18) + '…' : v} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={14}>
                  {data?.topByProfit?.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cross-links */}
      <div className="grid-2 page-section">
        <DrillLink href="/finance" label="Фінансовий аналіз виручки" icon="💵" variant="block" />
        <DrillLink href="/orders" label="Деталі замовлень" icon="📦" variant="block" />
      </div>
    </div>
  );
}
