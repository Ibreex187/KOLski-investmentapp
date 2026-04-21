import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import { clearAdminError, fetchAdminAlerts } from '../features/adminSlice';
import { formatCurrency, formatDate } from '../services/formatters';

export default function AdminAlerts({ isLoading = false }) {
  const dispatch = useDispatch();
  const { alerts, alertsLoading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAdminAlerts());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const payload = alerts || {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  const moderationItems = useMemo(
    () => [
      {
        text: `${payload.active || 0} active alert rule${payload.active === 1 ? '' : 's'} are currently monitoring prices.`,
        status: { label: 'Active', tone: 'positive', live: true },
      },
      {
        text: `${payload.triggered || 0} alert${payload.triggered === 1 ? '' : 's'} have already triggered and may need review.`,
        status: { label: 'Triggered', tone: 'warning' },
      },
      {
        text: `${payload.disabled || 0} alert${payload.disabled === 1 ? '' : 's'} are disabled across the platform.`,
        status: { label: 'Disabled', tone: 'neutral' },
      },
    ],
    [payload.active, payload.triggered, payload.disabled]
  );

  const adminAlertSummaryCards = useMemo(
    () => [
      {
        label: 'Total rules',
        value: payload.total || 0,
        note: 'All alert rules across users',
      },
      {
        label: 'Active',
        value: payload.active || 0,
        note: 'Currently monitoring',
      },
      {
        label: 'Triggered',
        value: payload.triggered || 0,
        note: 'Need moderation review',
      },
      {
        label: 'Disabled',
        value: payload.disabled || 0,
        note: 'Not currently running',
      },
    ],
    [payload.total, payload.active, payload.triggered, payload.disabled]
  );

  const rows = items.map((item) => ({
    id: item._id,
    user: item.user_name || item.user_email || '—',
    symbol: item.symbol || '—',
    target: formatCurrency(item.target_price),
    direction: item.direction || '—',
    status: item.status || 'active',
    created: formatDate(item.createdAt),
  }));

  const handleRetry = () => {
    dispatch(clearAdminError());
    dispatch(fetchAdminAlerts());
  };

  if (isLoading || (alertsLoading && !items.length)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !alertsLoading && !items.length) {
    return (
      <ErrorState
        title="Alerts moderation unavailable"
        message={error}
        actionLabel="Reload admin alerts"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Admin"
        title="Alerts moderation"
        description="Review platform-wide alert coverage and monitor which user alerts are active, triggered, or disabled."
        compact
        badge={{
          label: 'Alerts',
          value: payload.total || 0,
          suffix: '',
          caption: `${payload.triggered || 0} triggered`,
          status: { label: 'Moderation', tone: 'warning', live: true },
        }}
      />

      <SummaryStrip items={adminAlertSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Monitoring"
          title="Alert status mix"
          description="Use this feed to review alert coverage at a glance."
          status={{ label: `${payload.active || 0} active`, tone: 'positive', live: true }}
          className="feature-panel--large"
        >
          <StatusList items={moderationItems} />
        </SectionPanel>

        <SectionPanel
          kicker="Next actions"
          title="Operations links"
          description="Pivot from alert review into user directory checks or transaction oversight."
          status={{ label: 'Ops', tone: 'info' }}
        >
          <PanelActionBar
            actions={[
              { key: 'users', label: 'Open users', to: '/admin/users' },
              {
                key: 'transactions',
                label: 'Open transactions',
                to: '/admin/transactions',
                variant: 'secondary',
              },
            ]}
          />
        </SectionPanel>
      </div>

      <DataTable
        title="Recent alert rules"
        status={{ label: `${items.length} loaded`, tone: items.length ? 'info' : 'neutral' }}
        rows={rows.length ? rows : [{ user: 'No alert rules yet', symbol: '—', target: '$0.00', direction: '—', status: 'none', created: '—' }]}
        columns={[
          { key: 'user', emphasis: true },
          { key: 'symbol' },
          { key: 'target' },
          {
            key: 'direction',
            render: (value) => {
              if (value === 'above') {
                return <span className="status-indicator status-indicator--positive">Above</span>;
              }

              if (value === 'below') {
                return <span className="status-indicator status-indicator--warning">Below</span>;
              }

              return <span className="status-indicator status-indicator--neutral">Unspecified</span>;
            },
          },
          {
            key: 'status',
            render: (value) => {
              const label =
                value === 'active' ? 'Active' : value === 'triggered' ? 'Triggered' : value === 'disabled' ? 'Disabled' : 'Unspecified';
              const toneClass =
                value === 'active'
                  ? 'status-indicator--info'
                  : value === 'triggered'
                    ? 'status-indicator--warning'
                    : 'status-indicator--neutral';

              return <span className={`status-indicator ${toneClass}`}>{label}</span>;
            },
          },
          { key: 'created' },
        ]}
      />
    </PremiumPage>
  );
}
