import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import DataTable from '../components/dashboard/DataTable';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import { sessionsContent } from '../content/dashboardContent';
import {
  clearError,
  fetchActiveSessions,
  logoutAllSessions,
  revokeSessionById,
} from '../features/authSlice';
import { formatDateTime } from '../services/formatters';

export default function Sessions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessions, sessionsLoading, sessionActionLoading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(fetchActiveSessions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const rows = useMemo(
    () =>
      (sessions || []).map((session, index) => ({
        id: session.id,
        device: session.device_name || 'Unknown device',
        ip: session.ip_address || 'Unavailable',
        lastActive: formatDateTime(session.last_used_at),
        expires: formatDateTime(session.expires_at),
        label: index === 0 ? 'Most recent' : 'Active',
      })),
    [sessions]
  );

  const sessionSummaryCards = useMemo(
    () => [
      {
        label: 'Open sessions',
        value: rows.length,
        note: 'Active device sessions',
      },
      {
        label: 'Most recent',
        value: rows[0]?.device || 'None',
        note: rows[0]?.lastActive || 'No recent activity',
      },
      {
        label: 'Revocable',
        value: rows.length,
        note: 'Sessions you can revoke now',
      },
      {
        label: 'Security posture',
        value: rows.length ? 'Tracked' : 'Idle',
        note: 'Session monitoring status',
      },
    ],
    [rows]
  );

  const handleRevoke = async (sessionId) => {
    try {
      const payload = await dispatch(revokeSessionById(sessionId)).unwrap();
      toast.success(payload?.message || 'Session revoked successfully.');
    } catch {
      // handled via shared auth error state
    }
  };

  const handleLogoutAll = async () => {
    try {
      const payload = await dispatch(logoutAllSessions()).unwrap();
      toast.success(payload?.message || 'All sessions logged out successfully.');
      navigate('/login', { replace: true });
    } catch {
      // handled via shared auth error state
    }
  };

  const columns = [
    { key: 'device', emphasis: true },
    { key: 'ip' },
    { key: 'lastActive' },
    { key: 'expires' },
    {
      key: 'actions',
      render: (_, row) => (
        <button
          type="button"
          className="mini-action-btn"
          onClick={() => handleRevoke(row.id)}
          disabled={sessionActionLoading}
        >
          Revoke
        </button>
      ),
    },
  ];

  if (sessionsLoading && !sessions.length) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <PremiumPage>
      <PageHero
        {...sessionsContent.hero}
        badge={{
          label: 'Open sessions',
          value: rows.length,
          suffix: '',
          caption: 'Protected devices on record',
          status: {
            label: rows.length ? 'Live list' : 'No sessions',
            tone: rows.length ? 'info' : 'neutral',
            live: rows.length > 0,
          },
        }}
      />

      <SummaryStrip items={sessionSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Devices"
          title="Session inventory"
          description="Review active device sessions and revoke any session individually."
          status={{
            label: rows.length ? `${rows.length} active` : 'No sessions',
            tone: rows.length ? 'info' : 'neutral',
            live: rows.length > 0,
          }}
          className="feature-panel--large"
        >
          {rows.length ? (
            <DataTable
              title="Current session list"
              status={{
                label: 'Live sync',
                tone: 'positive',
                live: true,
              }}
              rows={rows}
              columns={columns}
            />
          ) : (
            <p className="session-empty-note">No active sessions yet for this account.</p>
          )}

          <div className="session-toolbar">
            <PanelActionBar
              actions={[
                {
                  key: 'logout-all',
                  label: 'Logout all sessions',
                  variant: 'danger',
                  onClick: handleLogoutAll,
                  disabled: sessionActionLoading,
                },
                {
                  key: 'back-account',
                  label: 'Back to account',
                  variant: 'secondary',
                  to: '/account',
                },
              ]}
            />
          </div>
        </SectionPanel>

        <SectionPanel
          title="Session safety tips"
          description="Use these checks to keep device access under control across your account."
          status={{ label: 'Recommended', tone: 'warning' }}
          className="trade-panel trade-panel--rail"
        >
          <StatusList items={sessionsContent.checklist} />
        </SectionPanel>
      </div>
    </PremiumPage>
  );
}
