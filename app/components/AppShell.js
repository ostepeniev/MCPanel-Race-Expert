'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function AppShell({ children }) {
  const [period, setPeriod] = useState('current_month');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <TopNav period={period} onPeriodChange={setPeriod} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
