import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { Info } from 'lucide-react';
import Navbar from './Navbar';
import { adminNavItems, dashboardNavItems, privateNavbarConfig } from './navbarConfig';

export default function Layout() {
  const { user } = useSelector((state) => state.auth);

  const navbarConfig = useMemo(
    () => ({
      ...privateNavbarConfig,
      navItems: user?.role === 'admin'
        ? [...dashboardNavItems, ...adminNavItems]
        : dashboardNavItems,
    }),
    [user?.role]
  );

  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--one" aria-hidden="true" />
      <div className="app-shell__glow app-shell__glow--two" aria-hidden="true" />

      <Navbar {...navbarConfig} />

      <main className="app-content container-fluid">
        <div className="content-panel">
          {user?.isDemo && (
            <div className="demo-mode-banner" role="status">
              <Info size={16} />
              <span>
                <strong>Demo mode.</strong> You&apos;re viewing a shared sample account. Trades are
                real but the data resets daily and is visible to other visitors.
              </span>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
