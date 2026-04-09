'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ columns, data, isLoading = false, title = '', subtitle = '' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedData = sortKey
    ? [...(data || [])].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      })
    : (data || []);

  if (isLoading) {
    return (
      <div className="data-table-wrapper">
        {title && (
          <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="skeleton-line w-30" style={{ height: '1.25rem', marginBottom: '6px' }} />
            <div className="skeleton-line w-50" style={{ height: '0.75rem' }} />
          </div>
        )}
        <div style={{ padding: 'var(--space-lg)' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      {title && (
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</div>}
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`${sortKey === col.key ? 'sorted' : ''} ${col.align === 'right' ? 'text-right' : ''}`}
                style={col.width ? { width: col.width } : undefined}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {col.label}
                  {sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                Немає даних
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${col.align === 'right' ? 'text-right number' : ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : (
                      col.format === 'number' ? Number(row[col.key]).toLocaleString('uk-UA') :
                      col.format === 'currency' ? `${Number(row[col.key]).toLocaleString('uk-UA')} ₴` :
                      col.format === 'percent' ? `${Number(row[col.key]).toFixed(1)}%` :
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
