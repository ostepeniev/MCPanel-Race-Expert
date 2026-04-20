'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ value, label, icon, change, prefix = '', suffix = '', isLoading = false, className = '' }) {
  if (isLoading) {
    return (
      <div className={`kpi-card kpi-skeleton ${className}`}>
        <div className="skeleton-value" />
        <div className="skeleton-label" />
      </div>
    );
  }

  const changeNum = parseFloat(change);
  const changeClass = changeNum > 0 ? 'positive' : changeNum < 0 ? 'negative' : 'neutral';
  const ChangeIcon = changeNum > 0 ? TrendingUp : changeNum < 0 ? TrendingDown : Minus;

  const formatValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return val.toLocaleString('uk-UA');
      return val.toLocaleString('uk-UA');
    }
    return val;
  };

  return (
    <div className={`kpi-card ${className}`}>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-value">
        {prefix}{formatValue(value)}{suffix}
      </div>
      <div className="kpi-label">{label}</div>
      {change !== undefined && change !== null && (
        <div className={`kpi-change ${changeClass}`}>
          <ChangeIcon size={12} />
          {Math.abs(changeNum).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
