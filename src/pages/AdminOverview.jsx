import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DetailList from '../components/dashboard/DetailList';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import StatCard from '../components/dashboard/StatCard';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import { clearAdminError, fetchAdminOverview } from '../features/adminSlice';

export default function AdminOverview({ isLoading = false }) {
  const dispatch = useDispatch();
  const { overview, overviewLoading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin' && !overview && !overviewLoading) {
      dispatch(fetchAdminOverview());
    }
  }, [dispatch, user?.role, overview, overviewLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRetry = () => {
    dispatch(clearAdminError());
    dispatch(fetchAdminOverview());
  };

  const payload = overview || {};
  const users = payload.users || {};
  const portfolios = payload.portfolios || {};
  const transactions = payload.transactions || {};
  const alerts = payload.alerts || {};
  const notifications = payload.notifications || {};
  const health = payload.portfolio_health || {};
  const securityItems = [
    { label: 'Role', value: user?.role || 'admin' },
    { label: 'Unread notices', value: notifications.unread || 0 },
    { label: 'Triggered alerts', value: alerts.triggered || 0 },
  ];

  const stats = [
    {
      label: 'Users',
      value: users.total || 0,
      suffix: '',
      change: `${users.admins || 0} admin accounts`,
      tone: 'info',
      status: { label: 'Platform users', tone: 'info', live: true },
    },
    {
      label: 'Portfolios',
      value: portfolios.total || 0,
      suffix: '',
      change: `${transactions.total || 0} total transactions`,
      tone: 'positive',
      status: { label: 'Investment accounts', tone: 'positive' },
    },
    {
      label: 'Open alerts',
      value: alerts.active || 0,
      suffix: '',
      change: `${alerts.triggered || 0} triggered`,
      tone: 'warning',
      status: { label: 'Alert engine', tone: 'warning', live: true },
    },
    {
      label: 'Unread notices',
      value: notifications.unread || 0,
      suffix: '',
      change: health.status || 'stable',
      tone: 'info',
      status: { label: 'Admin inbox', tone: 'info' },
    },
  ];

  const systemItems = useMemo(
    () => [
      {
        text: `${users.total || 0} total users are currently tracked, including ${users.admins || 0} admins.`,
        status: { label: 'Users', tone: 'info' },
      },
      {
        text: `${transactions.total || 0} transaction records and ${portfolios.total || 0} portfolios are available in the system.`,
        status: { label: 'Volume', tone: 'positive' },
      },
      {
        text: `${alerts.active || 0} active alerts with ${alerts.triggered || 0} already triggered.`,
        status: { label: 'Monitoring', tone: 'warning' },
      },
      {
        text: health.note || 'Admin overview metrics loaded successfully.',
        status: { label: health.status || 'stable', tone: health.status === 'stable' ? 'positive' : 'warning', live: true },
      },
    ],
    [users.total, users.admins, transactions.total, portfolios.total, alerts.active, alerts.triggered, health.note, health.status]
  );

  const overviewSummaryCards = useMemo(
    () => [
      {
        label: 'Users',
        value: users.total || 0,
        note: `${users.admins || 0} admin accounts`,
      },
      {
        label: 'Portfolios',
        value: portfolios.total || 0,
        note: 'Active investment accounts',
      },
      {
        label: 'Open alerts',
        value: alerts.active || 0,
        note: `${alerts.triggered || 0} triggered`,
      },
      {
        label: 'Unread notices',
        value: notifications.unread || 0,
        note: health.status || 'stable',
      },
    ],
    [users.total, users.admins, portfolios.total, alerts.active, alerts.triggered, notifications.unread, health.status]
  );

  if (isLoading || (overviewLoading && !overview)) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (error && !overviewLoading && !overview) {
    return (
      <ErrorState
        title="Admin overview unavailable"
        message={error}
        actionLabel="Reload admin overview"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Admin"
        title="Admin overview dashboard"
        description="Monitor top-level platform usage, portfolio activity, alerts, and notification load from one admin dashboard."
        badge={{
          label: 'System health',
          value: health.status === 'stable' ? 100 : 72,
          suffix: '%',
          caption: health.status || 'status',
          status: { label: health.status || 'stable', tone: health.status === 'stable' ? 'positive' : 'warning', live: true },
        }}
      />

      <SummaryStrip items={overviewSummaryCards} />

      <div className="stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="content-grid">
        <SectionPanel
          kicker="Coverage"
          title="Platform snapshot"
          description="Use this snapshot for a quick read on product and portfolio activity."
          status={{ label: 'Live metrics', tone: 'info', live: true }}
          className="feature-panel--large"
        >
          <StatusList items={systemItems} />
        </SectionPanel>

        <SectionPanel
          kicker="Security"
          title="Security operations"
          description="Jump into hardening headers, admin controls, and platform protection checks."
          status={{ label: 'Admin only', tone: 'warning' }}
        >
          <DetailList items={securityItems} />

          <PanelActionBar
            actions={[
              { key: 'users', label: 'Review users', to: '/admin/users' },
              {
                key: 'alerts',
                label: 'Moderate alerts',
                to: '/admin/alerts',
                variant: 'secondary',
              },
              {
                key: 'transactions',
                label: 'Transaction oversight',
                to: '/admin/transactions',
                variant: 'secondary',
              },
              {
                key: 'security',
                label: 'Open security status',
                to: '/admin/security',
                variant: 'secondary',
              },
            ]}
          />
        </SectionPanel>
      </div>
    </PremiumPage>
  );
}
