import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { NavDrawer } from './NavDrawer';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <TopBar onMenuClick={() => setMobileOpen(o => !o)} />
      <NavDrawer mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 flex flex-col min-h-screen pt-16 md:pl-[240px]">
        <Outlet />
      </main>
    </div>
  );
}
