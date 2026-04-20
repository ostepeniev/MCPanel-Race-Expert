'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState } from 'react';

const TABS = [
  { label: 'COMMAND', href: '/' },
  { label: 'ЗАМОВЛЕННЯ', href: '/orders' },
  { label: 'ПРОДАЖІ', href: '/sales' },
  { label: 'СКЛАД', href: '/warehouse' },
  { label: 'ФІНАНСИ', href: '/finance' },
];

const PERIODS = [
  { label: 'Сьогодні', value: 'today' },
  { label: 'Вчора', value: 'yesterday' },
  { label: 'Поточний місяць', value: 'current_month' },
  { label: 'Минулий місяць', value: 'prev_month' },
];

export default function TopNav({ period, onPeriodChange }) {
  const pathname = usePathname();
  const [searchTooltip, setSearchTooltip] = useState(false);

  return (
    <header className="topnav">
      <div className="topnav-inner">
        {/* Mobile Logo — visible only on ≤768px */}
        <Link href="/" className="topnav-mobile-logo" id="mobile-logo">
          <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="topnav-logo-icon">
            <path d="M15 75 L45 45 L75 75" stroke="rgba(255,255,255,0.3)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M45 50 L75 20 L105 50" stroke="#2D7DD2" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="topnav-logo-text">RE</span>
        </Link>

        {/* Desktop Tabs */}
        <nav className="topnav-tabs">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`topnav-tab ${isActive ? 'topnav-tab-active' : ''}`}
                id={`tab-${tab.href.replace('/', '') || 'command'}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="topnav-right">
          <select
            className="topnav-period"
            value={period || 'current_month'}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            id="period-select"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <div className="topnav-search-wrapper">
            <button
              className="topnav-search"
              onClick={() => setSearchTooltip(true)}
              onMouseLeave={() => setSearchTooltip(false)}
              id="search-btn"
              disabled
            >
              <Search size={14} />
              <span>Пошук...</span>
              <kbd className="topnav-search-kbd">⌘K</kbd>
            </button>
            {searchTooltip && (
              <div className="topnav-tooltip">Планується в наступній версії</div>
            )}
          </div>

          <div className="topnav-live" id="live-indicator">
            <span className="topnav-live-dot" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
