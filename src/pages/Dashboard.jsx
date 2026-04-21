import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import StatCard from '../components/dashboard/StatCard';
import PremiumPage from '../components/layout/PremiumPage';
import {
  clearPortfolioError,
  fetchPortfolioDashboard,
} from '../features/portfolioSlice';
import { formatPercent } from '../services/formatters';

export default function Dashboard({ isLoading = false }) {
  const dispatch = useDispatch();
  const { dashboard, dashboardLoading, error } = useSelector((state) => state.portfolio);

  useEffect(() => {
    if (!dashboard && !dashboardLoading) {
      dispatch(fetchPortfolioDashboard());
    }
  }, [dashboard, dashboardLoading, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRetry = () => {
    dispatch(clearPortfolioError());
    dispatch(fetchPortfolioDashboard());
  };

  if (isLoading || (dashboardLoading && !dashboard)) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (error && !dashboardLoading && !dashboard) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message={error}
        actionLabel="Reload dashboard"
        onRetry={handleRetry}
      />
    );
  }

  const summary = dashboard?.summary || {};
  const performance = dashboard?.performance || {};
  const risk = dashboard?.risk || {};
  const recommendations = dashboard?.recommendations || [];
  const notifications = dashboard?.notifications?.recent || [];

  const stats = [
    {
      label: 'Total Value',
      value: summary.total_value || 0,
      prefix: '$',
      decimals: 2,
      change: formatPercent(summary.profit_loss_percent),
      tone: Number(summary.profit_loss_percent || 0) >= 0 ? 'positive' : 'warning',
      status: { label: 'Live value', tone: 'info', live: true },
    },
    {
      label: 'Cash Balance',
      value: summary.cash_balance || 0,
      prefix: '$',
      decimals: 2,
      change: `${summary.active_alerts || 0} active alerts`,
      tone: 'info',
      status: { label: 'Available cash', tone: 'positive' },
    },
    {
      label: 'Unread Signals',
      value: summary.unread_notifications || 0,
      suffix: '',
      change: `${summary.triggered_alerts || 0} triggered`,
      tone: 'info',
      status: { label: 'Notifications', tone: 'warning', live: true },
    },
  ];

  const performanceBars = [
    Math.min(100, Math.max(8, Math.abs(Number(performance?.returns_summary?.day || 0)) * 10 + 18)),
    Math.min(100, Math.max(8, Math.abs(Number(performance?.returns_summary?.week || 0)) * 10 + 22)),
    Math.min(100, Math.max(8, Math.abs(Number(performance?.returns_summary?.month || 0)) * 10 + 26)),
    Math.min(100, Math.max(8, Number(risk?.diversification_score || 0))),
  ];

  const signalItems = [
    ...(recommendations || []).map((item) => ({
      text: `${item.title}: ${item.message}`,
      status: {
        label: item.priority || 'info',
        tone: item.priority === 'high' ? 'warning' : item.priority === 'positive' ? 'positive' : 'info',
      },
    })),
    ...(notifications || []).map((item) => ({
      text: item.message,
      status: { label: item.type || 'notice', tone: 'neutral' },
    })),
  ];

  return (
    <PremiumPage>
      <PageHero
        kicker="Command Center"
        title="Investment Dashboard"
        description="Monitor live portfolio health, alerts, and recommendations from one premium workspace."
        badge={{
          label: 'Diversification',
          value: risk.diversification_score || 0,
          suffix: '/100',
          caption: risk.volatility_level || 'risk level',
          status: {
            label: risk.volatility_level || 'Live',
            tone: risk.volatility_level === 'high' ? 'warning' : 'positive',
            live: true,
          },
        }}
      />

      <div className="stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="content-grid">
        <SectionPanel
          kicker="Performance"
          title="Return momentum"
          description={`1D ${formatPercent(performance?.returns_summary?.day)} • 1W ${formatPercent(performance?.returns_summary?.week)} • 1M ${formatPercent(performance?.returns_summary?.month)}`}
          status={{ label: performance?.benchmark_comparison?.benchmark_symbol || 'SPY', tone: 'info', live: true }}
          className="feature-panel--large"
        >
          <div className="mini-bars">
            {performanceBars.map((width, index) => (
              <span key={`${width}-${index}`} style={{ width: `${width}%` }} />
            ))}
          </div>
        </SectionPanel>

        <SectionPanel kicker="Signals" title="Action feed">
          <StatusList
            items={
              signalItems.length
                ? signalItems
                : [{ text: 'No new recommendations yet.', status: { label: 'Quiet', tone: 'neutral' } }]
            }
          />
        </SectionPanel>
      </div>
    </PremiumPage>
  );
}
