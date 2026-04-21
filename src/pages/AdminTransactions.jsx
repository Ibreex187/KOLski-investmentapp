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
import { clearAdminError, fetchAdminTransactions } from '../features/adminSlice';
import { formatCurrency, formatDate } from '../services/formatters';

export default function AdminTransactions({ isLoading = false }) {
  const dispatch = useDispatch();
  const { transactions, transactionsLoading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAdminTransactions());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const payload = transactions || {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  const oversightItems = useMemo(
    () => [
      {
        text: `${payload.total || 0} transaction record${payload.total === 1 ? '' : 's'} are currently available for review.`,
        status: { label: 'Volume', tone: 'info', live: true },
      },
      {
        text: `${payload.completed || 0} completed, ${payload.pending || 0} pending, and ${payload.failed || 0} failed transactions are currently tracked.`,
        status: { label: 'State mix', tone: payload.failed ? 'warning' : 'positive' },
      },
      {
        text: 'Use this screen for platform-level oversight of buy, sell, deposit, and withdrawal activity.',
        status: { label: 'Oversight', tone: 'warning' },
      },
    ],
    [payload.total, payload.completed, payload.pending, payload.failed]
  );

  const transactionSummaryCards = useMemo(
    () => [
      {
        label: 'Total records',
        value: payload.total || 0,
        note: 'Transactions loaded',
      },
      {
        label: 'Completed',
        value: payload.completed || 0,
        note: 'Successfully processed',
      },
      {
        label: 'Pending',
        value: payload.pending || 0,
        note: 'Awaiting completion',
      },
      {
        label: 'Failed',
        value: payload.failed || 0,
        note: 'Need investigation',
      },
    ],
    [payload.total, payload.completed, payload.pending, payload.failed]
  );

  const rows = items.map((item) => ({
    id: item._id,
    user: item.user_name || item.user_email || '—',
    type: item.type || '—',
    symbol: item.symbol || '—',
    amount: formatCurrency(item.total),
    status: item.status || 'completed',
    created: formatDate(item.createdAt),
  }));

  const handleRetry = () => {
    dispatch(clearAdminError());
    dispatch(fetchAdminTransactions());
  };

  if (isLoading || (transactionsLoading && !items.length)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !transactionsLoading && !items.length) {
    return (
      <ErrorState
        title="Transaction oversight unavailable"
        message={error}
        actionLabel="Reload transactions"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Admin"
        title="Transaction oversight"
        description="Review platform-wide trade and funding activity from the live admin transaction feed."
        compact
        badge={{
          label: 'Transactions',
          value: payload.total || 0,
          suffix: '',
          caption: `${payload.failed || 0} failed`,
          status: { label: 'Oversight', tone: payload.failed ? 'warning' : 'positive', live: true },
        }}
      />

      <SummaryStrip items={transactionSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Operations"
          title="Transaction health"
          description="Stay on top of executed trades and funding events across the platform."
          status={{ label: `${payload.completed || 0} completed`, tone: 'positive', live: true }}
          className="feature-panel--large"
        >
          <StatusList items={oversightItems} />
        </SectionPanel>

        <SectionPanel
          kicker="Related"
          title="Admin shortcuts"
          description="Move into user review or alert moderation from the oversight workspace."
          status={{ label: 'Admin tools', tone: 'info' }}
        >
          <PanelActionBar
            actions={[
              { key: 'users', label: 'Open users', to: '/admin/users' },
              {
                key: 'alerts',
                label: 'Open alerts',
                to: '/admin/alerts',
                variant: 'secondary',
              },
            ]}
          />
        </SectionPanel>
      </div>

      <DataTable
        title="Recent platform transactions"
        status={{ label: `${items.length} loaded`, tone: items.length ? 'info' : 'neutral' }}
        rows={rows.length ? rows : [{ user: 'No transactions yet', type: '—', symbol: '—', amount: '$0.00', status: 'none', created: '—' }]}
        columns={[
          { key: 'user', emphasis: true },
          { key: 'type' },
          { key: 'symbol' },
          { key: 'amount' },
          {
            key: 'status',
            render: (value) => {
              const label =
                value === 'completed' ? 'Completed' : value === 'pending' ? 'Pending' : value === 'failed' ? 'Failed' : 'Unspecified';
              const toneClass =
                value === 'completed'
                  ? 'status-indicator--positive'
                  : value === 'pending'
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
