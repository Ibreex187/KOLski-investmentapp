import {
  BarChart3,
  History,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export const featureCards = [
  {
    title: 'Smart dashboard',
    description: 'See your portfolio and priorities in one clear command view.',
    icon: LayoutDashboard,
  },
  {
    title: 'Portfolio tracking',
    description: 'Monitor holdings and performance without extra noise.',
    icon: Wallet,
  },
  {
    title: 'Trading workspace',
    description: 'Review opportunities and act from a cleaner workflow.',
    icon: TrendingUp,
  },
  {
    title: 'Watchlist monitoring',
    description: 'Keep important assets in view and stay ready to move.',
    icon: BarChart3,
  },
  {
    title: 'Activity history',
    description: 'Review past actions quickly for better clarity.',
    icon: History,
  },
  {
    title: 'Secure access',
    description: 'Stay protected with a fast, personalized sign-in flow.',
    icon: ShieldCheck,
  },
];

export const reasonsToJoin = [
  'A single workspace for dashboard, portfolio, watchlist, and history.',
  'A modern interface designed to reduce noise and increase confidence.',
  'Clearer investing decisions with better visibility into what matters most.',
];

export const gettingStarted = [
  'Create your account and open your personal investment workspace.',
  'Track your portfolio, watchlist, and recent activity in one place.',
  'Stay focused and make decisions with more confidence.',
];

export const trustHighlights = [
  {
    title: 'Clean workflow design',
    text: 'KOLski keeps your investing tools organized in one focused workspace instead of scattered screens.',
  },
  {
    title: 'Decision-ready visibility',
    text: 'Users can quickly review their dashboard, portfolio, watchlist, and recent history without friction.',
  },
  {
    title: 'Built to grow',
    text: 'The experience is structured to expand naturally with live data, smarter insights, and deeper analytics.',
  },
];

export const faqItems = [
  {
    question: 'What can I do with KOLski after signing up?',
    answer:
      'You can access a premium workspace for tracking your portfolio, managing your watchlist, reviewing history, and staying organized around investment decisions.',
  },
  {
    question: 'Is KOLski designed for beginners or active investors?',
    answer:
      'It is built to feel approachable for newer users while still giving more serious investors a cleaner command center for daily use.',
  },
  {
    question: 'Will the platform support more live data later?',
    answer:
      'Yes. The current structure is intentionally set up so real-time stats, analytics, and richer market integrations can be added cleanly.',
  },
];

export const testimonials = [
  {
    quote:
      'I want one place where I can see my portfolio, watchlist, and recent activity without jumping between tabs all day.',
    name: 'Ayo M.',
    role: 'Retail investor',
  },
  {
    quote:
      'The premium layout makes the product feel more focused and easier to trust than most cluttered finance dashboards.',
    name: 'Sandra K.',
    role: 'Swing trader',
  },
  {
    quote:
      'KOLski looks like the kind of workspace that helps me stay organized and act faster when opportunities appear.',
    name: 'David T.',
    role: 'Market watcher',
  },
];

export const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'A clean entry point for users who want to explore the platform and set up their core workflow.',
    features: ['Dashboard access', 'Watchlist setup', 'Portfolio overview'],
    highlighted: false,
    badge: '',
  },
  {
    name: 'Pro',
    price: '$12/mo',
    description: 'For users who want a more premium workspace with deeper visibility and a stronger daily routine.',
    features: ['Everything in Starter', 'Advanced activity tracking', 'Priority insights layout'],
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Elite',
    price: '$24/mo',
    description: 'A future-ready tier for investors who want the most polished experience as the platform expands.',
    features: ['Everything in Pro', 'Expanded analytics', 'Growth-ready premium tools'],
    highlighted: false,
    badge: '',
  },
];

export const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Dashboard', to: '/login' },
      { label: 'Portfolio', to: '/login' },
      { label: 'Watchlist', to: '/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Get Started', to: '/register' },
      { label: 'Sign In', to: '/login' },
      { label: 'Access Workspace', to: '/login' },
    ],
  },
];

export const previewTabs = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    tooltip: 'See your account snapshot and momentum instantly.',
    metricLabel: 'Total balance',
    counter: { value: 128430, prefix: '$' },
    trend: '+$4,280 this month',
    badges: [
      { text: 'Portfolio +8.4%', tooltip: 'Monthly portfolio growth' },
      { text: 'AI signal active', tone: 'blue', tooltip: 'Momentum signal detected' },
    ],
    bars: [42, 66, 54, 82, 70, 92],
    cards: [
      { title: 'Watchlist', text: '6 assets tracked' },
      { title: 'History', text: '14 recent actions' },
    ],
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    tooltip: 'Track allocation, diversification, and holdings in one view.',
    metricLabel: 'Active holdings',
    counter: { value: 18, suffix: ' holdings' },
    trend: '92% diversification score',
    badges: [
      { text: 'Risk balanced', tooltip: 'Portfolio risk remains within range' },
      { text: 'ETF core strong', tone: 'blue', tooltip: 'Core long-term holdings are stable' },
    ],
    bars: [68, 48, 76, 62, 58, 84],
    cards: [
      { title: 'Allocation', text: 'Tech + ETFs leading' },
      { title: 'Performance', text: 'Outperforming this week' },
    ],
  },
  {
    key: 'watchlist',
    label: 'Watchlist',
    tooltip: 'Stay ready for the next move with focused market signals.',
    metricLabel: 'Priority signals',
    counter: { value: 6, suffix: ' alerts' },
    trend: '3 breakout setups today',
    badges: [
      { text: 'NVDA alert', tooltip: 'Breakout near resistance' },
      { text: 'BTC volume rising', tone: 'blue', tooltip: 'Volume confirms momentum' },
    ],
    bars: [28, 52, 61, 74, 69, 88],
    cards: [
      { title: 'Top alert', text: 'Tesla breakout watch' },
      { title: 'Best setup', text: 'Ethereum support zone' },
    ],
  },
];
