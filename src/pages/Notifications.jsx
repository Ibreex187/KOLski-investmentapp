import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { BellRing, CheckCheck } from 'lucide-react';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import {
  clearNotificationAction,
  clearNotificationsError,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../features/notificationsSlice';
import { formatDate } from '../services/formatters';

export default function Notifications({ isLoading = false }) {
  const dispatch = useDispatch();
  const { items, loading, actionLoading, error, lastAction } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (lastAction?.message) {
      toast.success(lastAction.message);
      dispatch(clearNotificationAction());
    }
  }, [lastAction, dispatch]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  const insightItems = useMemo(() => {
    const unread = items.filter((item) => !item.read);
    const recentTypes = [...new Set(items.map((item) => item.type).filter(Boolean))].slice(0, 3);

    return [
      {
        text: `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'} awaiting review.`,
        status: { label: unreadCount ? 'Attention' : 'Clear', tone: unreadCount ? 'warning' : 'positive' },
      },
      {
        text: `${items.length} total message${items.length === 1 ? '' : 's'} currently in your notification center.`,
        status: { label: 'Feed', tone: 'info', live: true },
      },
      {
        text: recentTypes.length
          ? `Recent categories: ${recentTypes.join(', ')}.`
          : 'No notification categories have been generated yet.',
        status: { label: 'Coverage', tone: 'neutral' },
      },
      unread[0]
        ? {
            text: `Latest unread: ${unread[0].title || unread[0].message}`,
            status: { label: unread[0].type || 'notice', tone: 'info' },
          }
        : {
            text: 'Everything is already marked as read.',
            status: { label: 'Up to date', tone: 'positive' },
          },
    ];
  }, [items, unreadCount]);

  const notificationSummaryCards = useMemo(() => {
    const readCount = items.length - unreadCount;
    const uniqueTypes = new Set(items.map((item) => item.type).filter(Boolean)).size;

    return [
      {
        label: 'Total messages',
        value: items.length,
        note: 'Notifications in your feed',
      },
      {
        label: 'Unread',
        value: unreadCount,
        note: 'Require review',
      },
      {
        label: 'Read',
        value: readCount,
        note: 'Already processed',
      },
      {
        label: 'Categories',
        value: uniqueTypes,
        note: 'Distinct notification types',
      },
    ];
  }, [items, unreadCount]);

  const rows = items.map((item) => ({
    id: item._id,
    title: item.title || 'Notification',
    message: item.message,
    type: item.type || 'system',
    state: item.read ? 'Read' : 'Unread',
    created: formatDate(item.createdAt),
    isRead: Boolean(item.read),
  }));

  const handleRetry = () => {
    dispatch(clearNotificationsError());
    dispatch(fetchNotifications());
  };

  if (isLoading || (loading && !items.length)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !loading && !items.length) {
    return (
      <ErrorState
        title="Notifications unavailable"
        message={error}
        actionLabel="Reload notifications"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Notifications"
        title="Notifications center"
        description="Review account activity, trade updates, and system notices in real time."
        compact
        badge={{
          label: 'Unread',
          value: unreadCount,
          suffix: '',
          caption: `${items.length} total notifications`,
          status: { label: 'Live feed', tone: unreadCount ? 'warning' : 'positive', live: true },
        }}
      />

      <SummaryStrip items={notificationSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Actions"
          title="Inbox controls"
          description="Mark the full inbox as read once you have reviewed your latest portfolio and security updates."
          status={{ label: 'Quick actions', tone: 'info', live: true }}
          className="feature-panel--large"
        >
          <PanelActionBar
            actions={[
              {
                key: 'refresh',
                label: 'Refresh feed',
                onClick: () => dispatch(fetchNotifications()),
                disabled: loading,
              },
              {
                key: 'mark-all',
                label: actionLoading ? 'Updating...' : 'Mark all as read',
                icon: <CheckCheck size={16} />,
                onClick: () => dispatch(markAllNotificationsRead()),
                disabled: actionLoading || !unreadCount,
                variant: 'secondary',
              },
            ]}
          />
        </SectionPanel>

        <SectionPanel
          kicker="Summary"
          title="Activity snapshot"
          description="Keep an eye on trading confirmations, alerts, and account events in one place."
          status={{ label: `${unreadCount} unread`, tone: unreadCount ? 'warning' : 'positive' }}
          className="trade-panel trade-panel--rail"
        >
          <StatusList items={insightItems} />
        </SectionPanel>
      </div>

      <DataTable
        title="Recent notifications"
        status={{ label: `${items.length} item${items.length === 1 ? '' : 's'}`, tone: items.length ? 'info' : 'neutral' }}
        rows={rows.length ? rows : [{ title: 'No notifications yet', message: 'New activity will appear here.', type: 'system', state: 'Read', created: '—' }]}
        columns={[
          { key: 'title', emphasis: true },
          { key: 'message' },
          {
            key: 'type',
            render: (value) => <span className="status-indicator status-indicator--info">{value}</span>,
          },
          {
            key: 'state',
            render: (value) => (
              <span className={`status-indicator ${value === 'Unread' ? 'status-indicator--warning' : 'status-indicator--positive'}`}>
                {value}
              </span>
            ),
          },
          { key: 'created' },
          {
            key: 'actions',
            render: (_, row) =>
              row.id && row.state === 'Unread' ? (
                <button
                  type="button"
                  className="mini-action-btn"
                  onClick={() => dispatch(markNotificationRead(row.id))}
                  disabled={actionLoading}
                >
                  <BellRing size={14} />
                  <span>Mark read</span>
                </button>
              ) : (
                '—'
              ),
          },
        ]}
      />
    </PremiumPage>
  );
}
