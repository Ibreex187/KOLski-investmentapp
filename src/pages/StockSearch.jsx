import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import { clearMarketError, searchMarketSymbols } from '../features/marketSlice';

export default function StockSearch() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryFromUrl);
  const { searchResults, searchLoading, searchMessage, error } = useSelector((state) => state.market);

  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    if (queryFromUrl.trim()) {
      dispatch(searchMarketSymbols(queryFromUrl));
    }
  }, [dispatch, queryFromUrl]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
    dispatch(searchMarketSymbols(trimmed));
  };

  const handleRetry = () => {
    dispatch(clearMarketError());
    dispatch(searchMarketSymbols(queryFromUrl || query));
  };

  const rows = searchResults.map((item) => ({
    symbol: item.symbol,
    name: item.name,
    type: item.type,
    region: item.region,
  }));

  const resultSummaryCards = useMemo(() => {
    const uniqueRegions = new Set(rows.map((item) => item.region).filter(Boolean));
    const uniqueTypes = new Set(rows.map((item) => item.type).filter(Boolean));

    return [
      {
        label: 'Matches',
        value: rows.length,
        note: queryFromUrl ? `for ${queryFromUrl}` : 'Search result count',
      },
      {
        label: 'Regions',
        value: uniqueRegions.size,
        note: 'Distinct market regions',
      },
      {
        label: 'Instrument types',
        value: uniqueTypes.size,
        note: 'Distinct security types',
      },
      {
        label: 'Search state',
        value: searchLoading ? 'Loading' : rows.length ? 'Ready' : 'Idle',
        note: 'Current search lifecycle',
      },
    ];
  }, [rows, queryFromUrl, searchLoading]);

  if (searchLoading && !searchResults.length && queryFromUrl) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !searchLoading && !searchResults.length && queryFromUrl) {
    return (
      <ErrorState
        title="Market search unavailable"
        message={error}
        actionLabel="Retry search"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Search"
        title="Stock search"
        description="Search live market symbols and jump into quote details or chart history."
        compact
        badge={{
          label: 'Matches',
          value: searchResults.length,
          suffix: '',
          caption: queryFromUrl ? `for “${queryFromUrl}”` : 'search ready',
          status: { label: 'Live search', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={resultSummaryCards} />

      <SectionPanel
        kicker="Lookup"
        title="Find a stock or ETF"
        description="Search by ticker or company name. Some symbols may return fewer results depending on the market data provider."
        status={{ label: 'Live data', tone: 'positive', live: true }}
        className="feature-panel--large"
      >
        <form className="market-search-form" onSubmit={handleSubmit}>
          <div className="market-search-input">
            <Search size={18} className="auth-input-icon" />
            <input
              className="form-control"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search IBM, Microsoft, Apple..."
            />
          </div>
          <button type="submit" className="panel-button" disabled={searchLoading}>
            {searchLoading ? 'Searching...' : 'Search market'}
          </button>
        </form>
      </SectionPanel>

      {rows.length ? (
        <DataTable
          title="Search results"
          status={{ label: `${rows.length} symbols`, tone: 'info' }}
          rows={rows}
          columns={[
            { key: 'symbol', emphasis: true },
            { key: 'name' },
            { key: 'type' },
            { key: 'region' },
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
                </div>
              ),
            },
          ]}
        />
      ) : (
        <SectionPanel
          kicker="Results"
          title="No symbols to show yet"
          description={searchMessage}
          status={{ label: queryFromUrl ? 'No results' : 'Waiting', tone: 'neutral' }}
        >
          <p className="session-empty-note">
            Try a broader term such as `IBM` or `Microsoft` if a shorter query returns no matches.
          </p>
        </SectionPanel>
      )}
    </PremiumPage>
  );
}
