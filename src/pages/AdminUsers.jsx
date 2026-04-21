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
import { clearAdminError, fetchAdminUsers } from '../features/adminSlice';
import { formatCurrency, formatDate } from '../services/formatters';

export default function AdminUsers({ isLoading = false }) {
  const dispatch = useDispatch();
  const { users, usersLoading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAdminUsers());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const payload = users || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const verificationRate = payload.total ? Math.round((Number(payload.verified || 0) / Number(payload.total || 1)) * 100) : 0;

  const summaryItems = useMemo(
    () => [
      {
        text: `${payload.total || 0} total user accounts are currently tracked in the platform.`,
        status: { label: 'Users', tone: 'info', live: true },
      },
      {
        text: `${payload.admins || 0} account${payload.admins === 1 ? '' : 's'} have administrator privileges.`,
        status: { label: 'Admins', tone: 'warning' },
      },
      {
        text: `${payload.verified || 0} verified account${payload.verified === 1 ? '' : 's'} with a ${verificationRate}% verification rate.`,
        status: { label: 'Verified', tone: 'positive' },
      },
    ],
    [payload.total, payload.admins, payload.verified, verificationRate]
  );

  const userSummaryCards = useMemo(
    () => [
      {
        label: 'Total users',
        value: payload.total || 0,
        note: 'Accounts in directory',
      },
      {
        label: 'Admins',
        value: payload.admins || 0,
        note: 'Privileged operators',
      },
      {
        label: 'Verified',
        value: payload.verified || 0,
        note: 'Completed verification',
      },
      {
        label: 'Verification rate',
        value: `${verificationRate}%`,
        note: 'Overall completion level',
      },
    ],
    [payload.total, payload.admins, payload.verified, verificationRate]
  );

  const rows = items.map((item) => ({
    id: item._id,
    name: item.name || item.username || '—',
    email: item.email || '—',
    role: item.role || 'user',
    verified: item.isVerified ? 'Verified' : 'Pending',
    balance: formatCurrency(item.cash_balance, item.currency || 'USD'),
    lastLogin: formatDate(item.lastLogin),
  }));

  const handleRetry = () => {
    dispatch(clearAdminError());
    dispatch(fetchAdminUsers());
  };

  if (isLoading || (usersLoading && !items.length)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !usersLoading && !items.length) {
    return (
      <ErrorState
        title="User management unavailable"
        message={error}
        actionLabel="Reload users"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Admin"
        title="User management"
        description="Review recently created users, verification coverage, and admin role distribution from the live admin user feed."
        compact
        badge={{
          label: 'Users',
          value: payload.total || 0,
          suffix: '',
          caption: `${payload.admins || 0} admin accounts`,
          status: { label: 'Live directory', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={userSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Directory"
          title="Account oversight"
          description="Use this view to quickly audit who has joined the platform and how many accounts are verified."
          status={{ label: `${verificationRate}% verified`, tone: verificationRate >= 70 ? 'positive' : 'warning' }}
          className="feature-panel--large"
        >
          <StatusList items={summaryItems} />
        </SectionPanel>

        <SectionPanel
          kicker="Next actions"
          title="Admin navigation"
          description="Move from user review into alerts moderation and transaction oversight."
          status={{ label: 'Operations', tone: 'info' }}
        >
          <PanelActionBar
            actions={[
              { key: 'alerts', label: 'Open alerts review', to: '/admin/alerts' },
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
        title="Recent users"
        status={{ label: `${items.length} loaded`, tone: items.length ? 'info' : 'neutral' }}
        rows={rows.length ? rows : [{ name: 'No users yet', email: '—', role: '—', verified: 'Unspecified', balance: '$0.00', lastLogin: '—' }]}
        columns={[
          { key: 'name', emphasis: true },
          { key: 'email' },
          {
            key: 'role',
            render: (value) => <span className={`status-indicator ${value === 'admin' ? 'status-indicator--warning' : 'status-indicator--info'}`}>{value}</span>,
          },
          {
            key: 'verified',
            render: (value) => <span className={`status-indicator ${value === 'Verified' ? 'status-indicator--positive' : 'status-indicator--warning'}`}>{value}</span>,
          },
          { key: 'balance' },
          { key: 'lastLogin' },
        ]}
      />
    </PremiumPage>
  );
}
