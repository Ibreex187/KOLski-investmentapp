import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';
import DetailList from '../components/dashboard/DetailList';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import { accountContent } from '../content/dashboardContent';
import {
  clearError,
  fetchCurrentUser,
  sendVerificationEmailRequest,
} from '../features/authSlice';
import { formatCurrency, formatDate } from '../services/formatters';

export default function Account() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const verificationChecklist = useMemo(() => {
    if (!user) {
      return accountContent.checklist;
    }

    return [
      {
        text: user.isVerified
          ? 'Your email is verified and ready for normal sign-in.'
          : 'Your email still needs verification to complete the full login flow.',
        status: {
          label: user.isVerified ? 'Verified' : 'Pending',
          tone: user.isVerified ? 'positive' : 'warning',
          live: !user.isVerified,
        },
      },
      ...accountContent.checklist.slice(1),
    ];
  }, [user]);

  const handleSendVerification = async () => {
    try {
      const payload = await dispatch(
        sendVerificationEmailRequest({ email: user.email })
      ).unwrap();
      toast.success(payload?.message || 'Verification email sent.');
    } catch {
      // handled via shared auth error state
    }
  };

  const profileItems = [
    { label: 'Name', value: user.name || '—' },
    { label: 'Username', value: user.username || '—' },
    { label: 'Email', value: user.email || '—' },
    { label: 'Cash balance', value: formatCurrency(user.cash_balance, user.currency) },
    { label: 'Last login', value: formatDate(user.lastLogin, { emptyLabel: 'Not available' }) },
  ];

  const accountSummaryCards = useMemo(
    () => [
      {
        label: 'Verification',
        value: user.isVerified ? 'Verified' : 'Pending',
        note: user.isVerified ? 'Email confirmed' : 'Verification needed',
      },
      {
        label: 'Role',
        value: user.role || 'User',
        note: 'Current access profile',
      },
      {
        label: 'Cash balance',
        value: formatCurrency(user.cash_balance, user.currency),
        note: `${user.currency || 'USD'} available`,
      },
      {
        label: 'Last login',
        value: formatDate(user.lastLogin, { emptyLabel: 'Not available' }),
        note: 'Most recent session activity',
      },
    ],
    [user.isVerified, user.role, user.cash_balance, user.currency, user.lastLogin]
  );

  if (loading && !user) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (!user) {
    return null;
  }

  return (
    <PremiumPage>
      <PageHero
        {...accountContent.hero}
        badge={{
          label: 'Verification health',
          value: user.isVerified ? 100 : 68,
          suffix: '%',
          caption: user.isVerified ? 'Email verified' : 'Verification pending',
          status: {
            label: user.isVerified ? 'Healthy' : 'Action needed',
            tone: user.isVerified ? 'positive' : 'warning',
            live: !user.isVerified,
          },
        }}
      />

      <SummaryStrip items={accountSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Identity"
          title="Profile snapshot"
          description="This section shows your signed-in profile and account details."
          status={{
            label: user.role || 'User',
            tone: 'info',
          }}
        >
          <DetailList items={profileItems} />
        </SectionPanel>

        <SectionPanel
          kicker="Security"
          title="Verification and access"
          description="Manage email verification status and jump into your active session controls."
          status={{
            label: user.isVerified ? 'Verified' : 'Pending',
            tone: user.isVerified ? 'positive' : 'warning',
            live: !user.isVerified,
          }}
        >
          <StatusList items={verificationChecklist} />

          <PanelActionBar
            actions={[
              ...(!user.isVerified
                ? [
                    {
                      key: 'send-verification',
                      label: 'Send verification email',
                      onClick: handleSendVerification,
                    },
                  ]
                : []),
              {
                key: 'open-verify',
                label: 'Open verify page',
                to: '/verify-email',
                variant: 'secondary',
              },
              {
                key: 'view-sessions',
                label: 'View active sessions',
                to: '/sessions',
                variant: 'secondary',
              },
            ]}
          />
        </SectionPanel>
      </div>
    </PremiumPage>
  );
}
