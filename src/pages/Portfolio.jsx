import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import DetailList from '../components/dashboard/DetailList';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import {
  clearPortfolioError,
  fetchPortfolioOverview,
} from '../features/portfolioSlice';
import { formatCurrency, formatDateTime } from '../services/formatters';

export default function Portfolio({ isLoading = false }) {
  const dispatch = useDispatch();
  const { overview, overviewLoading, error } = useSelector((state) => state.portfolio);

  useEffect(() => {
    if (!overview && !overviewLoading) {
      dispatch(fetchPortfolioOverview());
    }
  }, [dispatch, overview, overviewLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRetry = () => {
    dispatch(clearPortfolioError());
    dispatch(fetchPortfolioOverview());
  };

  const portfolio = overview?.portfolio || {};
  const holdings = Array.isArray(overview?.holdings) ? overview.holdings : [];

  const portfolioSummaryCards = useMemo(
    () => [
      {
        label: 'Total deposited',
        value: formatCurrency(portfolio.total_deposited, portfolio.currency || 'USD'),
        note: 'Cash added to the account',
      },
      {
        label: 'Total withdrawn',
        value: formatCurrency(portfolio.total_withdrawn, portfolio.currency || 'USD'),
        note: 'Cash removed from the account',
      },
      {
        label: 'Open holdings',
        value: holdings.length,
        note: holdings.length ? 'Assets currently in the portfolio' : 'No current positions',
      },
      {
        label: 'Profit/Loss',
        value: formatCurrency(portfolio.profit_loss, portfolio.currency || 'USD'),
        note: 'Current unrealized and realized result',
      },
    ],
    [holdings.length, portfolio.currency, portfolio.profit_loss, portfolio.total_deposited, portfolio.total_withdrawn]
  );

  const rows = holdings.map((holding) => ({
    rowClassName: Number(holding.shares || 0) > 0 ? 'holding-row--positive' : '',
    asset: holding.symbol,
    name: holding.name || holding.symbol,
    shares: holding.shares,
    average: formatCurrency(holding.average_price, portfolio.currency || 'USD'),
    sector: holding.sector || 'Uncategorized',
  }));

  const balanceItems = [
    {
      label: 'Total deposited',
      value: formatCurrency(portfolio.total_deposited, portfolio.currency || 'USD'),
    },
    {
      label: 'Total withdrawn',
      value: formatCurrency(portfolio.total_withdrawn, portfolio.currency || 'USD'),
    },
    {
      label: 'Cash balance',
      value: formatCurrency(portfolio.cash_balance, portfolio.currency || 'USD'),
    },
    {
      label: 'Holdings count',
      value: holdings.length,
    },
  ];

  const postureItems = [
    {
      label: 'Portfolio name',
      value: portfolio.name || 'My Portfolio',
    },
    {
      label: 'Last updated',
      value: formatDateTime(portfolio.last_updated),
    },
    {
      label: 'Profit/Loss',
      value: formatCurrency(portfolio.profit_loss, portfolio.currency || 'USD'),
    },
  ];

  if (isLoading || (overviewLoading && !overview)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !overviewLoading && !overview) {
    return (
      <ErrorState
        title="Portfolio overview unavailable"
        message={error}
        actionLabel="Reload portfolio"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Allocation"
        title="Portfolio overview"
        description="Track your holdings, available cash, and current account totals in one clear view."
        compact
        badge={{
          label: 'Cash balance',
          value: portfolio.cash_balance || 0,
          prefix: '$',
          decimals: 2,
          caption: `${portfolio.currency || 'USD'} ready`,
          status: { label: 'Overview', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={portfolioSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Snapshot"
          title="Account balances"
          description="Review your latest balances and holdings at a glance."
          className="funding-panel funding-panel--detail"
          status={{ label: portfolio.is_active ? 'Active' : 'Paused', tone: portfolio.is_active ? 'positive' : 'warning' }}
        >
          <DetailList items={balanceItems} highlighted />
        </SectionPanel>

        <SectionPanel
          kicker="Status"
          title="Portfolio posture"
          description="Use the overview data to confirm whether your cash and active holdings line up with your plan."
          className="trade-panel trade-panel--rail"
          status={{ label: holdings.length ? 'Invested' : 'Cash only', tone: holdings.length ? 'positive' : 'neutral' }}
        >
          <DetailList items={postureItems} highlighted />
        </SectionPanel>
      </div>

      <DataTable
        title="Current holdings"
        className="table-panel--holdings"
        status={{ label: `${holdings.length} assets`, tone: 'info' }}
        rows={rows.length ? rows : [{ asset: '—', name: 'No holdings yet', shares: 0, average: formatCurrency(0), sector: '—' }]}
        columns={[
          { key: 'asset', label: 'Asset', emphasis: true },
          { key: 'name', label: 'Name' },
          { key: 'shares', label: 'Shares' },
          { key: 'average', label: 'Average cost' },
          { key: 'sector', label: 'Sector' },
        ]}
      />
    </PremiumPage>
  );
}
