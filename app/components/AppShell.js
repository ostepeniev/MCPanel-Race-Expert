'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import MobileBottomTabs from './MobileBottomTabs';
import SplashScreen from './SplashScreen';

export default function AppShell({ children }) {
  const [period, setPeriod] = useState('current_month');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('splash_shown')) {
      setShowSplash(false);
    }
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="app-layout" style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <Sidebar />
        <div className="main-area">
          <TopNav period={period} onPeriodChange={setPeriod} />
          <main className="page-content">
            {children}
          </main>
        </div>
        <MobileBottomTabs />
      </div>
    </>
  );
}
