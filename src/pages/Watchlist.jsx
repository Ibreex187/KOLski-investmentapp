import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
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
  addWatchlistItem,
  clearMarketError,
  clearWatchlistAction,
  fetchMarketQuote,
  fetchWatchlist,
  removeWatchlistItem,
} from '../features/marketSlice';
import { formatCurrency, formatNumber, formatPercent } from '../services/formatters';

export default function Watchlist({ isLoading = false }) {
  const dispatch = useDispatch();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');

  const {
    watchlist,
    watchlistLoading,
    watchlistActionLoading,
    quotesBySymbol,
    quoteLoading,
    error,
    lastWatchlistAction,
  } = useSelector((state) => state.market);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  useEffect(() => {
    if (!watchlist.length) return;

    watchlist.forEach((item) => {
      if (!item?.symbol) return;
      if (!quotesBySymbol[item.symbol]) {
        dispatch(fetchMarketQuote(item.symbol));
      }
    });
  }, [dispatch, quotesBySymbol, watchlist]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (lastWatchlistAction?.message) {
      toast.success(lastWatchlistAction.message);
      dispatch(clearWatchlistAction());
    }
  }, [dispatch, lastWatchlistAction]);

  const rows = useMemo(
    () =>
      (watchlist || []).map((item) => {
        const quote = quotesBySymbol[item.symbol] || null;
        const price = quote?.price;
        const change = quote?.change;
        const changePercent = quote?.changePercent;

        return {
          id: item._id || item.symbol,
          symbol: item.symbol,
          name: item.name || '',
          price: price === undefined ? '' : formatCurrency(price),
          move:
            change === undefined || changePercent === undefined
              ? ''
              : `${formatCurrency(change)} (${formatPercent(changePercent)})`,
          volume: quote?.volume === undefined ? '' : formatNumber(quote.volume),
        };
      }),
    [quotesBySymbol, watchlist]
  );

  const watchlistSummaryCards = useMemo(() => {
    const withQuoteCount = rows.filter((row) => row.price).length;
    const moversCount = rows.filter((row) => row.move).length;

    return [
      {
        label: 'Tracked symbols',
        value: watchlist.length,
        note: 'Entries in your watchlist',
      },
      {
        label: 'Live quotes',
        value: withQuoteCount,
        note: 'Symbols with price data',
      },
      {
        label: 'Movers',
        value: moversCount,
        note: 'Symbols with change metrics',
      },
      {
        label: 'Quote state',
        value: quoteLoading ? 'Loading' : 'Ready',
        note: quoteLoading ? 'Refreshing market data' : 'Quotes synced',
      },
    ];
  }, [watchlist.length, rows, quoteLoading]);

  const handleRetry = () => {
    dispatch(clearMarketError());
    dispatch(fetchWatchlist());
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    const normalizedSymbol = symbol.trim().toUpperCase();
    const normalizedName = name.trim();

    if (!normalizedSymbol) {
      toast.error('Symbol is required.');
      return;
    }

    if (!normalizedName) {
      toast.error('Name is required.');
      return;
    }

    try {
      await dispatch(addWatchlistItem({ symbol: normalizedSymbol, name: normalizedName })).unwrap();
      dispatch(fetchMarketQuote(normalizedSymbol));
      setSymbol('');
      setName('');
    } catch {
      // Error toast is handled by slice error state watcher.
    }
  };

  const handleRemove = async (symbolToRemove) => {
    try {
      await dispatch(removeWatchlistItem(symbolToRemove)).unwrap();
    } catch {
      // Error toast is handled by slice error state watcher.
    }
  };

  const insightItems = watchlist.length
    ? watchlist.slice(0, 4).map((item) => ({
        text: `${item.symbol} is being tracked in your dedicated watchlist feed.`,
        status: { label: item.name || 'Watchlist', tone: 'info' },
      }))
    : [
        {
          text: 'Add a symbol and company name to start tracking your personal watchlist.',
          status: { label: 'No items', tone: 'neutral' },
        },
      ];

  if (isLoading || (watchlistLoading && !watchlist.length)) {
    return <PageSkeleton variant="simple" />;
  }

  if (error && !watchlistLoading && !watchlist.length) {
    return (
      <ErrorState
        title="Watchlist unavailable"
        message={error}
        actionLabel="Reload watchlist"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Watchlist"
        title="Personal watchlist"
        description="Track your selected symbols with live market quote updates."
        compact
        badge={{
          label: 'Tracked symbols',
          value: watchlist.length,
          suffix: '',
          caption: 'saved list',
          status: { label: 'Live list', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={watchlistSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Manage"
          title="Add symbol"
          description="Add symbols to your watchlist for quick access."
          status={{ label: 'Editing enabled', tone: 'positive', live: true }}
          className="feature-panel--large"
        >
          <form className="market-search-form" onSubmit={handleAdd}>
            <div className="market-search-input">
              <input
                className="form-control"
                value={symbol}
                onChange={(event) => setSymbol(event.target.value)}
                placeholder="AAPL"
                maxLength={12}
              />
            </div>
            <div className="market-search-input">
              <input
                className="form-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Apple Inc"
                maxLength={80}
              />
            </div>
            <button type="submit" className="panel-button" disabled={watchlistActionLoading}>
              <Plus size={16} />
              <span>{watchlistActionLoading ? 'Adding...' : 'Add to watchlist'}</span>
            </button>
          </form>
        </SectionPanel>

        <SectionPanel
          kicker="Research"
          title="Market navigation"
          description="Move from your watchlist into stock details and historical charts."
          status={{ label: quoteLoading ? 'Loading quotes' : 'Quotes ready', tone: quoteLoading ? 'warning' : 'info' }}
          className="trade-panel trade-panel--rail"
        >
          <StatusList items={insightItems} />
          <PanelActionBar
            actions={[
              { key: 'search', label: 'Open stock search', to: '/market/search' },
              ...(rows[0]
                ? [
                    {
                      key: 'first',
                      label: 'View first symbol',
                      to: `/market/${rows[0].symbol}`,
                      variant: 'secondary',
                    },
                  ]
                : []),
            ]}
          />
        </SectionPanel>
      </div>

      {rows.length ? (
        <DataTable
          title="Watchlist quotes"
          status={{ label: `${rows.length} item${rows.length === 1 ? '' : 's'}`, tone: 'info' }}
          rows={rows}
          columns={[
            { key: 'symbol', emphasis: true },
            { key: 'name' },
            { key: 'price' },
            {
              key: 'move',
              getClassName: (value) =>
                String(value).includes('(-') ? 'negative-text' : String(value).includes('(+') ? 'positive-text' : '',
            },
            { key: 'volume' },
            {
              key: 'actions',
              render: (_, row) => (
                <div className="table-action-links">
                  <Link to={`/market/${row.symbol}`} className="auth-inline-link">
                    Details
                  </Link>
                  <Link to={`/market/${row.symbol}/history`} className="auth-inline-link">
                    Chart
                  </Link>
                  <button
                    type="button"
                    className="mini-action-btn"
                    onClick={() => handleRemove(row.symbol)}
                    disabled={watchlistActionLoading}
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <SectionPanel
          kicker="Empty"
          title="No watchlist symbols yet"
          description="Add your first symbol to start tracking personalized quotes."
          status={{ label: 'Waiting', tone: 'neutral' }}
        >
          <p className="session-empty-note">
            You can add symbols from this page using ticker + company name, then jump into detail and chart views.
          </p>
        </SectionPanel>
      )}
    </PremiumPage>
  );
}
