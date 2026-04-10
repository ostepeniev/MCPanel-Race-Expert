'use client';

import { useState, useEffect } from 'react';

/**
 * SplashScreen — Animated intro with Race Expert branding.
 * Shows for ~5 seconds on first load, then fades out.
 * Theme: Running, movement, energy, community.
 */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter -> show -> exit -> done

  useEffect(() => {
    // Check if already shown this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('splash_shown')) {
      onComplete?.();
      return;
    }

    const timers = [
      setTimeout(() => setPhase('show'), 300),
      setTimeout(() => setPhase('exit'), 5500),
      setTimeout(() => {
        setPhase('done');
        sessionStorage.setItem('splash_shown', '1');
        onComplete?.();
      }, 6200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`splash-overlay splash-${phase}`}>
      {/* Animated background particles/lines */}
      <div className="splash-bg">
        <div className="splash-line splash-line-1" />
        <div className="splash-line splash-line-2" />
        <div className="splash-line splash-line-3" />
        <div className="splash-line splash-line-4" />
        <div className="splash-line splash-line-5" />
        <div className="splash-glow" />
      </div>

      {/* Main content */}
      <div className="splash-content">
        {/* Logo mark — animated chevrons */}
        <div className="splash-logo-mark">
          <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-chevrons">
            {/* Bottom chevron (dark) */}
            <path
              d="M15 75 L45 45 L75 75"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="splash-chevron-bottom"
            />
            {/* Top chevron (blue) */}
            <path
              d="M45 50 L75 20 L105 50"
              stroke="#2D7DD2"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="splash-chevron-top"
            />
          </svg>
        </div>

        {/* Brand name */}
        <div className="splash-brand">
          <span className="splash-brand-race">RACE</span>
          <span className="splash-brand-expert">EXPERT</span>
        </div>

        {/* Tagline */}
        <div className="splash-tagline">Mission Control Panel</div>

        {/* Pulse bar */}
        <div className="splash-loader">
          <div className="splash-loader-fill" />
        </div>

        {/* Motto */}
        <div className="splash-motto">Рух — це мова, яка об'єднує</div>
      </div>
    </div>
  );
}
