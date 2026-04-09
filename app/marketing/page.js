'use client';

import { Megaphone, BarChart3, Target, TrendingUp } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📣 Маркетинг</h1>
        <p className="page-subtitle">Інтеграції з рекламними кабінетами</p>
      </div>

      <div className="coming-soon glass-card-static">
        <div className="coming-soon-icon">🚧</div>
        <h2 className="coming-soon-title">Маркетинг — Coming Soon</h2>
        <p className="coming-soon-desc">
          Інтеграція з Google Ads, Meta Ads та іншими рекламними кабінетами.
          Аналітика ефективності кампаній, ROI та конверсій.
        </p>
        <div className="coming-soon-badge">Планується в наступній фазі</div>

        <div style={{ marginTop: 'var(--space-xl)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', width: '100%', maxWidth: '600px' }}>
          {[
            { icon: <BarChart3 size={20} />, label: 'Google Ads', desc: 'CTR, CPC, конверсії' },
            { icon: <Target size={20} />, label: 'Meta Ads', desc: 'Facebook & Instagram' },
            { icon: <TrendingUp size={20} />, label: 'Analytics', desc: 'ROI, CAC, LTV' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: 'var(--space-lg)', textAlign: 'center', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
              opacity: 0.5,
            }}>
              <div style={{ marginBottom: '8px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
