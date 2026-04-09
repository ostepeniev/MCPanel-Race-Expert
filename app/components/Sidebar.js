'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Building2, Package, DollarSign, Factory,
  BarChart3, Megaphone, Landmark, Bot, ChevronLeft, Menu
} from 'lucide-react';
import { useState } from 'react';

const NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { label: 'Command Center', href: '/', icon: LayoutDashboard },
      { label: 'Компанія', href: '/company', icon: Building2, disabled: true },
    ]
  },
  {
    title: 'ОПЕРАЦІЇ',
    items: [
      { label: 'Замовлення', href: '/orders', icon: Package },
      { label: 'Продажі', href: '/sales', icon: DollarSign },
      { label: 'Склад', href: '/warehouse', icon: Factory },
      { label: 'Аналітика', href: '/analytics', icon: BarChart3, disabled: true },
      { label: 'Маркетинг', href: '/marketing', icon: Megaphone },
    ]
  },
  {
    title: 'ФІНАНСИ',
    items: [
      { label: 'Фінанси', href: '/finance', icon: Landmark },
    ]
  },
  {
    title: 'AI',
    items: [
      { label: 'AI Інсайти', href: '/ai', icon: Bot, disabled: true },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        id="sidebar-toggle"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-name">Race Expert</span>
              <span className="sidebar-logo-tag">MCPanel</span>
            </div>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="sidebar-section">
              {!collapsed && <div className="sidebar-section-title">{section.title}</div>}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDisabled = item.disabled;

                return (
                  <Link
                    key={item.href}
                    href={isDisabled ? '#' : item.href}
                    className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${isDisabled ? 'sidebar-item-disabled' : ''}`}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    id={`nav-${item.href.replace('/', '') || 'home'}`}
                  >
                    <Icon size={18} className="sidebar-item-icon" />
                    {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
                    {isDisabled && !collapsed && <span className="sidebar-item-badge">soon</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-version">
              <span>MCPanel · v1.0</span>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}

