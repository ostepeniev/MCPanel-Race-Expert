'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const TABS = [
  { label: 'Головна', href: '/', icon: '🏠' },
  { label: 'Замовлення', href: '/orders', icon: '📦' },
  { label: 'Продажі', href: '/sales', icon: '💰' },
  { label: 'Склад', href: '/warehouse', icon: '🏭' },
  { label: 'Фінанси', href: '/finance', icon: '📊' },
];

export default function MobileBottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-tabs">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}
          >
            <span className="mobile-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
