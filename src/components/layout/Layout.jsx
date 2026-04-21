import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
