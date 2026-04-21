import {
  ArrowUpCircle,
  BarChart3,
  Bell,
  BellRing,
  History,
  Landmark,
  LayoutDashboard,
  LineChart,
  Lock,
  MonitorSmartphone,
  Search,
  Shield,
  Star,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';

export const dashboardNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portfolio', label: 'Portfolio', icon: Wallet, end: true },
  { to: '/portfolio/analytics', label: 'Analytics', icon: TrendingUp, end: true },
  { to: '/trade', label: 'Trade', icon: LineChart, end: true },
  { to: '/watchlist', label: 'Watchlist', icon: Star, end: true },
  { to: '/deposits', label: 'Deposits', icon: Landmark, end: true },
  { to: '/withdrawals', label: 'Withdrawals', icon: ArrowUpCircle, end: true },
  { to: '/market', label: 'Market', icon: BarChart3, end: true },
  { to: '/market/search', label: 'Search', icon: Search, end: true },
  { to: '/history', label: 'History', icon: History },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/account', label: 'Account', icon: User },
  { to: '/sessions', label: 'Sessions', icon: MonitorSmartphone },
];

export const adminNavItems = [
  { to: '/admin', label: 'Admin', icon: Shield },
  { to: '/admin/users', label: 'Users', icon: User },
  { to: '/admin/alerts', label: 'Moderation', icon: BellRing },
  { to: '/admin/transactions', label: 'Oversight', icon: History },
  { to: '/admin/security', label: 'Security', icon: Lock },
  { to: '/admin/docs', label: 'API Docs', icon: Search },
];

export const landingNavItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

export const privateNavbarConfig = {
  brandText: 'KOLski',
  subtitle: 'Futuristic wealth intelligence',
  navItems: dashboardNavItems,
  showTicker: false,
  tickerItems: [],
  marketLabel: '',
  showSignal: false,
  signalText: '',
  stats: [],
  showLogout: true,
  mode: 'private',
};

export const publicNavbarConfig = {
  brandText: 'KOLski',
  subtitle: 'Premium investment workspace',
  showTicker: false,
  tickerItems: [],
  marketLabel: '',
  showSignal: false,
  signalText: '',
  stats: [],
  showLogout: false,
  mode: 'public',
};
