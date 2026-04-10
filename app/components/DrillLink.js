'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * DrillLink — A styled navigation button for drilling into detail pages.
 * Used inside cards/sections to link to related pages.
 * 
 * Variants:
 * - "block" (default): Full-width button at the bottom of a section
 * - "inline": Compact link within a card header
 */
export default function DrillLink({ href, label = 'Детальніше', variant = 'block', icon }) {
  return (
    <Link href={href} className={`drill-link drill-link-${variant}`}>
      {icon && <span className="drill-link-icon">{icon}</span>}
      <span className="drill-link-label">{label}</span>
      <ChevronRight size={16} className="drill-link-arrow" />
    </Link>
  );
}

/**
 * QuickNav — A card that links to another page section.
 * Shows an icon, title, value preview, and navigates on tap.
 */
export function QuickNavCard({ href, icon, title, value, subtitle, color = 'var(--accent-purple)' }) {
  return (
    <Link href={href} className="quick-nav-card">
      <div className="quick-nav-icon" style={{ background: `${color}15`, color }}>{icon}</div>
      <div className="quick-nav-body">
        <div className="quick-nav-title">{title}</div>
        {value && <div className="quick-nav-value">{value}</div>}
        {subtitle && <div className="quick-nav-subtitle">{subtitle}</div>}
      </div>
      <ChevronRight size={18} className="quick-nav-arrow" />
    </Link>
  );
}
