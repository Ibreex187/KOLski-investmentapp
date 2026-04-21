import { useMemo } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import DetailList from '../components/dashboard/DetailList';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import PremiumPage from '../components/layout/PremiumPage';

const LOCAL_API_BASE_URL = 'http://localhost:4080/api/v1';
const DEPLOYED_API_BASE_URL = 'https://ko-lski-investment-backend.vercel.app/api/v1';
const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (isLocalHost ? LOCAL_API_BASE_URL : DEPLOYED_API_BASE_URL);

export default function ApiDocs() {
  const endpointItems = useMemo(
    () => [
      { text: 'Auth: register, login, refresh-token, sessions, password recovery.', status: { label: 'Auth', tone: 'info' } },
      { text: 'Portfolio: overview, analytics, trade actions, transactions, alerts.', status: { label: 'Portfolio', tone: 'positive' } },
      { text: 'Market: quote, search, history, portfolio-prices.', status: { label: 'Market', tone: 'warning' } },
      { text: 'Admin: overview, security-status, users, alerts, transactions.', status: { label: 'Admin', tone: 'warning' } },
    ],
    []
  );
  const docItems = [
    { label: 'Suggested command', value: 'npm run docs:openapi' },
    { label: 'Service scope', value: API_BASE_URL },
  ];

  return (
    <PremiumPage>
      <PageHero
        kicker="Internal"
        title="Platform reference guide"
        description="Quick internal reference for the connected platform features used throughout the KOLski workspace."
        compact
        badge={{
          label: 'Base URL',
          value: API_BASE_URL.replace('/api/v1', ''),
          suffix: '',
          caption: 'service root',
          status: { label: 'Internal use', tone: 'info', live: true },
        }}
      />

      <div className="content-grid">
        <SectionPanel
          kicker="Coverage"
          title="Connected feature groups"
          description="This is an internal admin summary of the major feature groups already wired in the client."
          status={{ label: 'Workspace map', tone: 'info', live: true }}
          className="feature-panel--large"
        >
          <StatusList items={endpointItems} />
        </SectionPanel>

        <SectionPanel
          kicker="Docs"
          title="OpenAPI access"
          description="Use the docs command when you need a deeper technical reference during admin review."
          status={{ label: 'Optional', tone: 'warning' }}
        >
          <DetailList items={docItems} />

          <a
            href="https://swagger.io/specification/"
            target="_blank"
            rel="noreferrer"
            className="panel-button"
          >
            <BookOpen size={16} />
            <span>Open OpenAPI reference</span>
            <ExternalLink size={14} />
          </a>
        </SectionPanel>
      </div>
    </PremiumPage>
  );
}
