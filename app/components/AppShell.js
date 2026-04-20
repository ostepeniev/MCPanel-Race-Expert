'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import MobileBottomTabs from './MobileBottomTabs';
import SplashScreen from './SplashScreen';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [period, setPeriod] = useState('current_month');
  const [showSplash, setShowSplash] = useState(true);

  const isLoginPage = pathname === '/login';
  const isLoading = status === 'loading';

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('splash_shown')) {
      setShowSplash(false);
    }
  }, []);

  // Login page — render without shell (no sidebar, no nav)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading auth state — show nothing (prevents flash)
  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-dark, #0A0A0C)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="login-spinner-dot" />
      </div>
    );
  }

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
