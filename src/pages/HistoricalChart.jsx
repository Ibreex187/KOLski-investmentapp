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
import PremiumPage from '../components/layout/PremiumPage';
import { clearMarketError, fetchMarketHistory, fetchMarketQuote } from '../features/marketSlice';
import { formatCurrency, formatNumber } from '../services/formatters';

const buildChartPoints = (points, width = 620, height = 220, padding = 14) => {
  if (!points.length) return '';

  const values = points.map((point) => Number(point.close || 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((Number(point.close || 0) - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
};

export default function HistoricalChart() {
  const { symbol = '' } = useParams();
  const normalizedSymbol = symbol.toUpperCase();
  const dispatch = useDispatch();
  const { quotesBySymbol, historyBySymbol, historyLoading, error } = useSelector((state) => state.market);

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

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-20),
    [history]
  );

  const chartPoints = useMemo(() => buildChartPoints(sortedHistory), [sortedHistory]);

  const latest = sortedHistory[sortedHistory.length - 1];
  const oldest = sortedHistory[0];
  const netMove = Number(latest?.close || 0) - Number(oldest?.close || 0);

  const handleRetry = () => {
    dispatch(clearMarketError());
    dispatch(fetchMarketQuote(normalizedSymbol));
    dispatch(fetchMarketHistory(normalizedSymbol));
  };

  if (historyLoading && !history.length) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !historyLoading && !history.length) {
    return (
      <ErrorState
        title="Historical chart unavailable"
        message={error}
        actionLabel="Reload chart data"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Chart"
        title={`${normalizedSymbol} historical chart`}
        description="Visualize recent daily close history for this symbol."
        badge={{
          label: 'Last close',
          value: latest?.close || quote?.price || 0,
          prefix: '$',
          decimals: 2,
          caption: sortedHistory.length ? `${sortedHistory.length} sessions plotted` : 'no history yet',
          status: {
            label: netMove >= 0 ? 'Positive trend' : 'Pullback',
            tone: netMove >= 0 ? 'positive' : 'warning',
            live: true,
          },
        }}
      />

      <div className="content-grid">
        <SectionPanel
          kicker="Trend"
          title="Daily close history"
          description="The chart below shows the latest recorded price points."
          status={{ label: `${sortedHistory.length} points`, tone: 'info', live: true }}
          className="feature-panel--large"
        >
          <div className="market-chart-card">
            {sortedHistory.length ? (
              <svg viewBox="0 0 620 220" className="market-line-chart" role="img" aria-label={`${normalizedSymbol} price history`}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                <polyline
                  points={chartPoints}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <p className="session-empty-note">No historical points are available for this symbol yet.</p>
            )}
          </div>

          <DetailList
            items={[
              { label: 'Starting close', value: formatCurrency(oldest?.close) },
              { label: 'Latest close', value: formatCurrency(latest?.close || quote?.price) },
              { label: 'Net move', value: formatCurrency(netMove) },
            ]}
          />
        </SectionPanel>

        <SectionPanel
          kicker="Navigate"
          title="Next steps"
          description="Open the quote view or search for another symbol while reviewing the trend."
          status={{ label: normalizedSymbol, tone: 'info' }}
        >
          <PanelActionBar
            actions={[
              {
                key: 'details',
                label: 'Open stock details',
                to: `/market/${normalizedSymbol}`,
              },
              {
                key: 'search',
                label: 'Search another stock',
                to: '/market/search',
                variant: 'secondary',
              },
            ]}
          />
        </SectionPanel>
      </div>

      <DataTable
        title="Recent history rows"
        status={{ label: `${sortedHistory.length} rows`, tone: 'info' }}
        rows={sortedHistory.length ? [...sortedHistory].reverse().slice(0, 8).map((point) => ({
          date: point.date,
          close: formatCurrency(point.close),
          volume: formatNumber(point.volume),
        })) : [{ date: '—', close: formatCurrency(0), volume: '0' }]}
        columns={[
          { key: 'date', emphasis: true },
          { key: 'close' },
          { key: 'volume' },
        ]}
      />
    </PremiumPage>
  );
}
