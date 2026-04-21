import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, CheckCheck, LogOut, Menu, Sparkles, TrendingUp, X } from 'lucide-react';
import { logoutUser } from '../../features/authSlice';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../features/notificationsSlice';

const formatNotificationTime = (value) => {
  if (!value) return 'recent';

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return 'recent';
  }
};

export default function Navbar({
  brandText = 'KOLski',
  subtitle = '',
  navItems = [],
  showTicker = false,
  showLogout = false,
  tickerItems = [],
  marketLabel = '',
  showSignal = false,
  signalText = '',
  stats = [],
  mode = 'private',
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationMenuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: notificationItems = [],
    loading: notificationsLoading = false,
    actionLoading: notificationActionLoading = false,
  } = useSelector((state) => state.notifications || {});

  const safeNavItems = Array.isArray(navItems)
    ? navItems.filter((item) => item?.to && item?.label)
    : [];
  const safeTickerItems = Array.isArray(tickerItems)
    ? tickerItems.filter(Boolean)
    : [];
  const safeStats = Array.isArray(stats)
    ? stats.filter((item) => item?.label && item?.value)
    : [];

  const brandTarget = safeNavItems[0]?.to || '/';
  const shouldShowTicker = showTicker && safeTickerItems.length > 0;
  const shouldShowSignal = showSignal && Boolean(signalText);
  const shouldShowLowerRow =
    safeNavItems.length > 0 || safeStats.length > 0 || showLogout;
  const shouldShowNotifications = mode === 'private';
  const recentNotifications = useMemo(() => notificationItems.slice(0, 5), [notificationItems]);
  const unreadCount = useMemo(
    () => notificationItems.filter((item) => !item.read).length,
    [notificationItems]
  );

  useEffect(() => {
    if (shouldShowNotifications) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, shouldShowNotifications]);

  // Close notification dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isNotificationsOpen]);

  const closeMenus = () => {
    setIsOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();

    if (typeof onLogout === 'function') {
      onLogout();
      return;
    }

    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;
    await dispatch(markAllNotificationsRead());
  };

  const handleMarkRead = async (id, isRead) => {
    if (!id || isRead) return;
    await dispatch(markNotificationRead(id));
  };

  return (
    <header className={`app-navbar ${mode === 'public' ? 'app-navbar--public' : ''}`}>
      <div className={`nav-surface ${mode === 'public' ? 'nav-surface--public' : ''}`}>
        <div className="nav-top-row">
          <NavLink to={brandTarget} className="nav-brand" onClick={closeMenus}>
            <span className="brand-badge">
              <TrendingUp size={20} />
            </span>

            <span className="brand-copy">
              <strong>{brandText}</strong>
              {subtitle ? <small>{subtitle}</small> : null}
            </span>
          </NavLink>

          <div className="nav-meta">
            {marketLabel ? (
              <div className="market-pill premium-pill">
                <Sparkles size={14} />
                <span>{marketLabel}</span>
              </div>
            ) : null}

            {shouldShowSignal ? (
              <div className="signal-pill">
                <span className="signal-dot" />
                <span>{signalText}</span>
              </div>
            ) : null}

            {shouldShowNotifications ? (
              <div className="notification-menu" ref={notificationMenuRef}>
                <button
                  type="button"
                  className="notification-bell"
                  aria-label="Open notifications"
                  aria-expanded={isNotificationsOpen}
                  onClick={() => setIsNotificationsOpen((open) => !open)}
                >
                  <Bell size={18} />
                  {unreadCount ? <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
                </button>

                {isNotificationsOpen ? (
                  <div className="notification-dropdown">
                    <div className="notification-dropdown__head">
                      <div>
                        <strong>Notifications</strong>
                        <small>{unreadCount} unread</small>
                      </div>
                      <button
                        type="button"
                        className="notification-inline-btn"
                        onClick={handleMarkAllRead}
                        disabled={notificationActionLoading || !unreadCount}
                      >
                        <CheckCheck size={14} />
                        <span>Mark all</span>
                      </button>
                    </div>

                    <div className="notification-dropdown__list">
                      {notificationsLoading ? (
                        <p className="notification-empty">Loading notifications...</p>
                      ) : recentNotifications.length ? (
                        recentNotifications.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            className={`notification-item ${item.read ? '' : 'notification-item--unread'}`.trim()}
                            onClick={() => handleMarkRead(item._id, item.read)}
                          >
                            <div className="notification-item__meta">
                              <strong>{item.title || 'Notification'}</strong>
                              <span>{item.read ? 'Read' : 'Unread'}</span>
                            </div>
                            <p>{item.message}</p>
                            <small>{formatNotificationTime(item.createdAt)}</small>
                          </button>
                        ))
                      ) : (
                        <p className="notification-empty">No notifications yet.</p>
                      )}
                    </div>

                    <Link to="/notifications" className="notification-link" onClick={closeMenus}>
                      Open notifications center
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              className="nav-toggle"
              onClick={() => setIsOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {shouldShowTicker && (
          <div className="nav-ticker" aria-label="Market highlights">
            <div className="nav-ticker__track">
              {[...safeTickerItems, ...safeTickerItems].map((item, index) => (
                <span key={`${item}-${index}`} className="nav-ticker__item">
                  <span className="ticker-dot" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {shouldShowLowerRow && (
          <div className={`nav-lower-row ${isOpen ? 'is-open' : ''}`}>
            <nav className="nav-links" aria-label="Primary navigation">
              {safeNavItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `nav-link-modern ${isActive ? 'active' : ''}`
                  }
                >
                  {Icon ? <Icon size={16} /> : null}
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="nav-actions">
              {safeStats.map((item) => (
                <div key={item.label} className="nav-stat-card premium-card">
                  <span className="stat-label">{item.label}</span>
                  <strong>{item.value}</strong>
                  {item.trend ? <small className="stat-trend">{item.trend}</small> : null}
                </div>
              ))}

              {showLogout && (
                <button type="button" className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
