import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import DetailList from '../components/dashboard/DetailList';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import { clearAdminError, fetchSecurityStatus } from '../features/adminSlice';

const formatLabel = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function SecurityStatus({ isLoading = false }) {
  const dispatch = useDispatch();
  const { securityStatus, securityLoading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin' && !securityStatus && !securityLoading) {
      dispatch(fetchSecurityStatus());
    }
  }, [dispatch, user?.role, securityStatus, securityLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRetry = () => {
    dispatch(clearAdminError());
    dispatch(fetchSecurityStatus());
  };

  const payload = securityStatus || {};
  const headerRows = Object.entries(payload.headers || {}).map(([key, value]) => ({
    control: formatLabel(key),
    value,
  }));
  const hardeningItems = useMemo(
    () =>
      Object.entries(payload.hardening || {}).map(([key, value]) => ({
        text: `${formatLabel(key)}: ${String(value)}`,
        status: {
          label: value === true ? 'enabled' : value === false ? 'disabled' : 'configured',
          tone: value === false ? 'warning' : 'positive',
          live: true,
        },
      })),
    [payload.hardening]
  );
  const headerPolicyItems = [
    { label: 'Admin role', value: user?.role || 'admin' },
    { label: 'Rate limits', value: payload.hardening?.auth_rate_limits ? 'Enabled' : 'Unknown' },
    { label: 'Role guard', value: payload.hardening?.admin_role_guard ? 'Enabled' : 'Unknown' },
  ];

  const securitySummaryCards = useMemo(
    () => [
      {
        label: 'Header checks',
        value: headerRows.length,
        note: 'Security headers reported',
      },
      {
        label: 'Hardening controls',
        value: hardeningItems.length,
        note: 'Configuration flags reviewed',
      },
      {
        label: 'Rate limits',
        value: payload.hardening?.auth_rate_limits ? 'On' : 'Unknown',
        note: 'Authentication rate limiting',
      },
      {
        label: 'Admin role guard',
        value: payload.hardening?.admin_role_guard ? 'On' : 'Unknown',
        note: 'Privilege control status',
      },
    ],
    [headerRows.length, hardeningItems.length, payload.hardening?.auth_rate_limits, payload.hardening?.admin_role_guard]
  );

  if (isLoading || (securityLoading && !securityStatus)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !securityLoading && !securityStatus) {
    return (
      <ErrorState
        title="Security status unavailable"
        message={error}
        actionLabel="Reload security status"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Admin"
        title="Security status"
        description="Review security headers and hardening signals from the admin security dashboard."
        compact
        badge={{
          label: 'Controls',
          value: headerRows.length + hardeningItems.length,
          suffix: '',
          caption: 'security checks loaded',
          status: { label: 'Hardened', tone: 'positive', live: true },
        }}
      />

      <SummaryStrip items={securitySummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Hardening"
          title="Security controls"
          description="Key protection settings reported for the platform."
          status={{ label: 'Admin only', tone: 'warning', live: true }}
        >
          <StatusList
            items={
              hardeningItems.length
                ? hardeningItems
                : [{ text: 'No hardening details returned.', status: { label: 'Empty', tone: 'neutral' } }]
            }
          />
        </SectionPanel>

        <SectionPanel
          kicker="Headers"
          title="Response header policy"
          description="These values reflect protections for clickjacking, MIME sniffing, and referrer handling."
          status={{ label: `${headerRows.length} headers`, tone: 'info' }}
        >
          <DetailList items={headerPolicyItems} />
        </SectionPanel>
      </div>

      <DataTable
        title="Security header checklist"
        status={{ label: 'Headers', tone: 'info' }}
        rows={headerRows.length ? headerRows : [{ control: 'No header data', value: '—' }]}
        columns={[
          { key: 'control', emphasis: true },
          { key: 'value' },
        ]}
      />
    </PremiumPage>
  );
}
