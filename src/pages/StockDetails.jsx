import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import DetailList from '../components/dashboard/DetailList';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatCard from '../components/dashboard/StatCard';
import PremiumPage from '../components/layout/PremiumPage';
import { clearMarketError, fetchMarketHistory, fetchMarketQuote } from '../features/marketSlice';
import { formatCurrency, formatNumber, formatPercent } from '../services/formatters';

export default function StockDetails() {
  const { symbol = '' } = useParams();
  const normalizedSymbol = symbol.toUpperCase();
  const dispatch = useDispatch();
  const { quotesBySymbol, historyBySymbol, quoteLoading, historyLoading, error } = useSelector(
    (state) => state.market
  );

  const quote = quotesBySymbol[normalizedSymbol];
  const history = historyBySymbol[normalizedSymbol] || [];

  useEffect(() => {
    dispatch(fetchMarketQuote(normalizedSymbol));
    dispatch(fetchMarketHistory(normalizedSymbol));
  }, [dispatch, normalizedSymbol]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const recentRows = useMemo(
    () =>
      [...history]
        .slice(0, 5)
        .map((item) => ({
          date: item.date,
          close: formatCurrency(item.close),
          volume: formatNumber(item.volume),
        })),
    [history]
  );

  const handleRetry = () => {
    dispatch(clearMarketError());
    dispatch(fetchMarketQuote(normalizedSymbol));
    dispatch(fetchMarketHistory(normalizedSymbol));
  };

  if ((quoteLoading && !quote) || (historyLoading && !history.length)) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (error && !quoteLoading && !historyLoading && !quote && !history.length) {
    return (
      <ErrorState
        title="Stock details unavailable"
        message={error}
        actionLabel="Reload stock details"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Details"
        title={`${normalizedSymbol} market snapshot`}
        description="Review the current quote and recent trading context for this symbol."
        badge={{
          label: 'Current price',
          value: quote?.price || 0,
          prefix: '$',
          decimals: 2,
          caption: `Updated ${quote?.lastUpdated || 'recently'}`,
          status: {
            label: Number(quote?.change || 0) >= 0 ? 'Up day' : 'Down day',
            tone: Number(quote?.change || 0) >= 0 ? 'positive' : 'warning',
            live: true,
          },
        }}
      />

      <div className="stats-grid">
        <StatCard
          label="Price"
          value={quote?.price || 0}
          prefix="$"
          decimals={2}
          change={formatPercent(quote?.changePercent)}
          tone={Number(quote?.changePercent || 0) >= 0 ? 'positive' : 'warning'}
          status={{ label: 'Quote', tone: 'info', live: true }}
        />
        <StatCard
          label="Daily change"
          value={quote?.change || 0}
          prefix="$"
          decimals={2}
          change={formatPercent(quote?.changePercent)}
          tone={Number(quote?.change || 0) >= 0 ? 'positive' : 'warning'}
          status={{ label: 'Today', tone: 'warning' }}
        />
        <StatCard
          label="Volume"
          value={quote?.volume || 0}
          decimals={0}
          change={quote?.lastUpdated || 'latest session'}
          tone="info"
          status={{ label: 'Activity', tone: 'neutral' }}
        />
      </div>

      <div className="content-grid">
        <SectionPanel
          kicker="Quick facts"
          title="Quote summary"
          description="Key quote details for the selected ticker."
          status={{ label: normalizedSymbol, tone: 'info', live: true }}
        >
          <DetailList
            items={[
              { label: 'Symbol', value: quote?.symbol || normalizedSymbol },
              { label: 'Price', value: formatCurrency(quote?.price) },
              { label: 'Change', value: `${formatCurrency(quote?.change)} (${formatPercent(quote?.changePercent)})` },
              { label: 'Volume', value: formatNumber(quote?.volume) },
            ]}
          />

          <PanelActionBar
            actions={[
              {
                key: 'history',
                label: 'Open historical chart',
                to: `/market/${normalizedSymbol}/history`,
              },
              {
                key: 'search',
                label: 'Search another symbol',
                to: '/market/search',
                variant: 'secondary',
              },
            ]}
          />
        </SectionPanel>

        <DataTable
          title="Recent closes"
          status={{ label: `${recentRows.length} sessions`, tone: 'info' }}
          rows={recentRows.length ? recentRows : [{ date: '—', close: formatCurrency(0), volume: '0' }]}
          columns={[
            { key: 'date', emphasis: true },
            { key: 'close' },
            { key: 'volume' },
          ]}
        />
      </div>
    </PremiumPage>
  );
}
