import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import StatCard from '../components/dashboard/StatCard';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import {
  clearPortfolioError,
  fetchPortfolioAnalytics,
} from '../features/portfolioSlice';
import { formatCurrency, formatPercent } from '../services/formatters';

const toneFromValue = (value) => (Number(value || 0) >= 0 ? 'positive' : 'warning');

export default function PortfolioAnalytics() {
  const dispatch = useDispatch();
  const { analytics, analyticsLoading, error } = useSelector((state) => state.portfolio);

  useEffect(() => {
    if (!analytics && !analyticsLoading) {
      dispatch(fetchPortfolioAnalytics());
    }
  }, [analytics, analyticsLoading, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPortfolioError());
    }
  }, [error, dispatch]);

  const benchmark = analytics?.benchmark_comparison ?? {};
  const benchmarkRows = [
    {
      period: '1 day',
      portfolio: formatPercent(benchmark?.day?.portfolio_return_percent),
      benchmark: formatPercent(benchmark?.day?.benchmark_return_percent),
      alpha: formatPercent(benchmark?.day?.alpha_percent),
    },
    {
      period: '1 week',
      portfolio: formatPercent(benchmark?.week?.portfolio_return_percent),
      benchmark: formatPercent(benchmark?.week?.benchmark_return_percent),
      alpha: formatPercent(benchmark?.week?.alpha_percent),
    },
    {
      period: '1 month',
      portfolio: formatPercent(benchmark?.month?.portfolio_return_percent),
      benchmark: formatPercent(benchmark?.month?.benchmark_return_percent),
      alpha: formatPercent(benchmark?.month?.alpha_percent),
    },
  ];

  const topMoverRows = [
    ...(analytics?.top_gainers || []).map((item) => ({
      symbol: item.symbol,
      move: formatPercent(item.unrealized_pnl_percent),
      marketValue: formatCurrency(item.market_value),
      stance: 'Gainer',
    })),
    ...(analytics?.top_losers || []).map((item) => ({
      symbol: item.symbol,
      move: formatPercent(item.unrealized_pnl_percent),
      marketValue: formatCurrency(item.market_value),
      stance: 'Loser',
    })),
  ];

  const riskItems = [
    ...(analytics?.risk_insights?.risk_flags || []).map((flag) => ({
      text: flag,
      status: {
        label: analytics?.risk_insights?.volatility_level || 'Risk',
        tone: analytics?.risk_insights?.volatility_level === 'high' ? 'warning' : 'info',
      },
    })),
    ...(analytics?.risk_insights?.concentration_warnings || []).map((flag) => ({
      text: flag,
      status: { label: 'Concentration', tone: 'warning' },
    })),
  ];

  const analyticsSummaryCards = useMemo(
    () => [
      {
        label: 'Total value',
        value: formatCurrency(analytics?.total_value),
        note: 'Current market value',
      },
      {
        label: 'Unrealized P/L',
        value: formatCurrency(analytics?.unrealized_pnl),
        note: formatPercent(analytics?.unrealized_pnl_percent),
      },
      {
        label: 'Benchmark',
        value: benchmark?.benchmark_symbol || 'SPY',
        note: 'Reference comparison',
      },
      {
        label: 'Risk flags',
        value: riskItems.length,
        note: riskItems.length ? 'Items worth watching' : 'No active warnings',
      },
    ],
    [analytics?.total_value, analytics?.unrealized_pnl, analytics?.unrealized_pnl_percent, benchmark?.benchmark_symbol, riskItems.length]
  );

  if (analyticsLoading && !analytics) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Analytics"
        title="Portfolio analytics"
        description="Track allocation, benchmark performance, and risk posture with live analytics updates."
        badge={{
          label: 'Diversification score',
          value: analytics?.risk_insights?.diversification_score || 0,
          suffix: '/100',
          caption: analytics?.risk_insights?.volatility_level || 'risk profile',
          status: {
            label: analytics?.risk_insights?.volatility_level || 'Live',
            tone: analytics?.risk_insights?.volatility_level === 'high' ? 'warning' : 'positive',
            live: true,
          },
        }}
      />

      <SummaryStrip items={analyticsSummaryCards} />

      <div className="stats-grid">
        <StatCard
          label="Total value"
          value={analytics?.total_value || 0}
          prefix="$"
          decimals={2}
          change={formatPercent(analytics?.profit_loss_percent)}
          tone={toneFromValue(analytics?.profit_loss_percent)}
          status={{ label: 'Live portfolio', tone: 'info', live: true }}
        />
        <StatCard
          label="Unrealized P/L"
          value={analytics?.unrealized_pnl || 0}
          prefix="$"
          decimals={2}
          change={formatPercent(analytics?.unrealized_pnl_percent)}
          tone={toneFromValue(analytics?.unrealized_pnl_percent)}
          status={{ label: 'Open positions', tone: 'positive' }}
        />
        <StatCard
          label="Monthly alpha"
          value={benchmark?.month?.alpha_percent || 0}
          suffix="%"
          decimals={2}
          change={`vs ${benchmark?.benchmark_symbol || 'SPY'}`}
          tone={toneFromValue(benchmark?.month?.alpha_percent)}
          status={{ label: 'Benchmark', tone: 'warning' }}
        />
      </div>

      <div className="content-grid">
        <DataTable
          title="Returns vs benchmark"
          className="table-panel--dense"
          status={{ label: benchmark?.benchmark_symbol || 'SPY', tone: 'info', live: true }}
          rows={benchmarkRows}
          columns={[
            { key: 'period', label: 'Period', emphasis: true },
            { key: 'portfolio', label: 'Portfolio' },
            { key: 'benchmark', label: 'Benchmark' },
            {
              key: 'alpha',
              label: 'Alpha',
              getClassName: (value) =>
                String(value).startsWith('-') ? 'negative-text' : 'positive-text',
            },
          ]}
        />

        <SectionPanel
          kicker="Risk"
          title="Portfolio risk insights"
          description="These flags are generated from your live allocation and return profile."
          className="trade-panel trade-panel--rail"
          status={{
            label: analytics?.risk_insights?.volatility_level || 'Balanced',
            tone: analytics?.risk_insights?.volatility_level === 'high' ? 'warning' : 'info',
          }}
        >
          <StatusList
            items={
              riskItems.length
                ? riskItems
                : [
                    {
                      text: 'No immediate risk warnings were returned for this portfolio snapshot.',
                      status: { label: 'Stable', tone: 'positive' },
                    },
                  ]
            }
          />
        </SectionPanel>
      </div>

      <DataTable
        title="Top movers"
        className="table-panel--holdings"
        status={{ label: 'Allocation movers', tone: 'positive' }}
        rows={topMoverRows.length ? topMoverRows : [{ symbol: '—', move: '+0.00%', marketValue: formatCurrency(0), stance: 'No movers yet' }]}
        columns={[
          { key: 'symbol', label: 'Symbol', emphasis: true },
          {
            key: 'move',
            label: 'Move',
            getClassName: (value) =>
              String(value).startsWith('-') ? 'negative-text' : 'positive-text',
          },
          { key: 'marketValue', label: 'Market value' },
          { key: 'stance', label: 'Stance' },
        ]}
      />
    </PremiumPage>
  );
}
