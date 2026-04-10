'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * DataTable — Responsive data display.
 * 
 * Desktop (>768px): classic scrollable table
 * Mobile (≤768px): card list — each row becomes a card 
 *   with the first column as title and remaining columns as label:value pairs
 */
export default function DataTable({ columns, data, isLoading = false, title = '', subtitle = '' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [expanded, setExpanded] = useState(true);

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
        return sortDir === 'asc'
          ? String(aVal || '').localeCompare(String(bVal || ''))
          : String(bVal || '').localeCompare(String(aVal || ''));
      })
    : (data || []);

  const formatCell = (col, value) => {
    if (value === null || value === undefined) return '—';
    if (col.format === 'number') return Number(value).toLocaleString('uk-UA');
    if (col.format === 'currency') return `${Number(value).toLocaleString('uk-UA')} ₴`;
    if (col.format === 'percent') return `${Number(value).toFixed(1)}%`;
    return value;
  };

  if (isLoading) {
    return (
      <div className="dt-wrapper">
        {title && (
          <div className="dt-header">
            <div className="skeleton-line w-30" style={{ height: '1.25rem', marginBottom: '6px' }} />
            <div className="skeleton-line w-50" style={{ height: '0.75rem' }} />
          </div>
        )}
        <div className="dt-body">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-line w-80" style={{ height: '2rem', marginBottom: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  const primaryCol = columns[0];
  const dataCols = columns.slice(1);

  return (
    <div className="dt-wrapper">
      {title && (
        <div className="dt-header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
          <div className="dt-header-row">
            <div>
              <div className="dt-title">{title}</div>
              {subtitle && <div className="dt-subtitle">{subtitle}</div>}
            </div>
            <span className="dt-toggle">{expanded ? '▾' : '▸'} {sortedData.length}</span>
          </div>
        </div>
      )}

      {expanded && (
        <>
          {/* Desktop: scrollable table */}
          <div className="dt-scroll dt-desktop-only">
            <table className="dt-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`${sortKey === col.key ? 'sorted' : ''} ${col.align === 'right' ? 'text-right' : ''}`}
                      style={col.width ? { width: col.width } : undefined}
                    >
                      <span className="dt-th-inner">
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
                  <tr><td colSpan={columns.length} className="dt-empty">Немає даних</td></tr>
                ) : (
                  sortedData.map((row, idx) => (
                    <tr key={row.id || idx}>
                      {columns.map((col) => (
                        <td key={col.key} className={col.align === 'right' ? 'text-right number' : ''}>
                          {col.render ? col.render(row[col.key], row) : formatCell(col, row[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list */}
          <div className="dt-mobile-only">
            {sortedData.length === 0 ? (
              <div className="dt-empty-mobile">Немає даних</div>
            ) : (
              <div className="dt-card-list">
                {sortedData.map((row, idx) => (
                  <div key={row.id || idx} className="dt-card">
                    <div className="dt-card-name">
                      {row[primaryCol.key]}
                    </div>
                    <div className="dt-card-metrics">
                      {dataCols.map((col) => (
                        <div key={col.key} className="dt-card-metric">
                          <span className="dt-card-label">{col.label}</span>
                          <span className="dt-card-value">
                            {col.render ? col.render(row[col.key], row) : formatCell(col, row[col.key])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
