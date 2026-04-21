export const dashboardHero = {
  kicker: 'Command Center',
  title: 'Investment Dashboard',
  description:
    'Monitor your portfolio health, performance momentum, and market opportunities in one premium workspace.',
  badge: {
    label: 'AI confidence',
    value: 92,
    suffix: '%',
    caption: 'Strong bullish outlook',
    status: {
      label: 'Live',
      tone: 'positive',
      live: true,
    },
  },
};

export const dashboardStats = [
  {
    label: 'Total Balance',
    value: 128430,
    prefix: '$',
    change: '+8.4%',
    tone: 'positive',
    status: { label: 'Updated now', tone: 'info', live: true },
  },
  {
    label: 'Monthly Return',
    value: 4280,
    prefix: '$',
    change: '+12.1%',
    tone: 'positive',
    status: { label: 'This month', tone: 'positive' },
  },
  {
    label: 'Open Positions',
    value: 18,
    suffix: '',
    change: '+3 today',
    tone: 'info',
    status: { label: 'Market open', tone: 'warning', live: true },
  },
];

export const dashboardMomentum = {
  kicker: 'Performance',
  title: 'Market momentum',
  description:
    'Your top assets are outperforming the market this week, with technology and ETF positions driving most of the upside.',
  status: {
    label: 'Uptrend',
    tone: 'positive',
    live: true,
  },
  bars: [82, 65, 91, 74],
};

export const dashboardSignals = {
  kicker: 'Insights',
  title: 'Smart signals',
  items: [
    {
      text: 'NVDA momentum remains strong above support.',
      status: { label: 'Bullish', tone: 'positive' },
    },
    {
      text: 'Portfolio diversification score improved this week.',
      status: { label: 'Healthy', tone: 'info' },
    },
    {
      text: 'Risk exposure remains within your preferred range.',
      status: { label: 'Stable', tone: 'neutral' },
    },
  ],
};

export const portfolioContent = {
  hero: {
    kicker: 'Allocation',
    title: 'Portfolio Overview',
    description: 'Track your holdings, asset mix, and diversification with a cleaner premium layout.',
  },
  table: {
    title: 'Top holdings',
    status: { label: 'Balanced', tone: 'info' },
    rows: [
      { asset: 'NVDA', weight: '24%', gain: '+6.8%' },
      { asset: 'VOO', weight: '20%', gain: '+2.4%' },
      { asset: 'AAPL', weight: '15%', gain: '+1.9%' },
      { asset: 'BTC', weight: '12%', gain: '+5.3%' },
    ],
  },
};

export const watchlistContent = {
  hero: {
    kicker: 'Watchlist',
    title: 'Market Radar',
    description: 'Monitor the assets and signals that matter most to your next move.',
  },
  panel: {
    title: 'Priority alerts',
    items: [
      { text: 'Tesla breakout watch', status: { label: 'High focus', tone: 'warning', live: true } },
      { text: 'Ethereum support zone', status: { label: 'Support', tone: 'info' } },
      { text: 'S&P 500 weekly trend', status: { label: 'Stable', tone: 'neutral' } },
    ],
  },
};

export const historyContent = {
  hero: {
    kicker: 'Activity',
    title: 'Transaction History',
    description: 'Review trades and account actions in a clean premium ledger view.',
  },
  table: {
    title: 'Recent activity',
    rows: [
      { type: 'Buy', asset: 'AAPL', date: 'Apr 02', amount: '$2,400' },
      { type: 'Sell', asset: 'BTC', date: 'Apr 01', amount: '$1,150' },
      { type: 'Buy', asset: 'VOO', date: 'Mar 30', amount: '$3,000' },
    ],
  },
};

export const tradeContent = {
  hero: {
    kicker: 'Execution',
    title: 'Trade Station',
    description: 'Execute orders with precision and monitor live strategy context from one place.',
  },
  insight: {
    title: 'Quick trade insight',
    status: { label: 'Live', tone: 'warning', live: true },
    description:
      'Review your trade readiness, active market bias, and execution context in a cleaner decision-focused panel.',
  },
  checklist: [
    { text: 'Momentum remains favorable for selected high-conviction setups.', status: { label: 'Active', tone: 'positive' } },
    { text: 'Risk stays within your preferred position-sizing range.', status: { label: 'Checked', tone: 'info' } },
    { text: 'Wait for stronger confirmation before entering low-volume moves.', status: { label: 'Caution', tone: 'warning' } },
  ],
};

export const accountContent = {
  hero: {
    kicker: 'Profile',
    title: 'Account Center',
    description: 'Review your account identity, verification health, and access settings in one secure workspace.',
  },
  checklist: [
    { text: 'Keep your email verified to unlock the full sign-in flow.', status: { label: 'Recommended', tone: 'info' } },
    { text: 'Review active sessions regularly and revoke devices you do not recognize.', status: { label: 'Security', tone: 'warning' } },
    { text: 'Your account details stay synchronized across your active sessions.', status: { label: 'Live sync', tone: 'positive', live: true } },
  ],
};

export const sessionsContent = {
  hero: {
    kicker: 'Security',
    title: 'Active Sessions',
    description: 'Inspect current device sessions, revoke stale access, and keep your account footprint under control.',
  },
  checklist: [
    { text: 'The most recently used session usually reflects your current device activity.', status: { label: 'Tip', tone: 'neutral' } },
    { text: 'Use logout-all if you suspect a shared or compromised device.', status: { label: 'Important', tone: 'warning' } },
    { text: 'Session activity updates live so you can quickly spot unfamiliar access.', status: { label: 'Live monitoring', tone: 'positive', live: true } },
  ],
};
