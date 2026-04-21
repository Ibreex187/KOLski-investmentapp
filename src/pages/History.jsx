import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowDownCircle, ArrowUpCircle, Download, Landmark } from 'lucide-react';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import {
  clearPortfolioError,
  fetchPerformanceHistory,
  fetchTransactions,
} from '../features/portfolioSlice';
import api, { API_ENDPOINTS } from '../services/api';
import { formatCurrency, formatDate } from '../services/formatters';

export default function History({ isLoading = false }) {
  const dispatch = useDispatch();
  const {
    performanceHistory,
    transactions,
    transactionsMeta,
    historyLoading,
    transactionsLoading,
    error,
  } = useSelector((state) => state.portfolio);

  useEffect(() => {
    dispatch(fetchPerformanceHistory());
    dispatch(fetchTransactions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRetry = () => {
    dispatch(clearPortfolioError());
    dispatch(fetchPerformanceHistory());
    dispatch(fetchTransactions());
  };

  const handleExport = async () => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.portfolio.transactionsExport}?format=csv`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Transaction export downloaded.');
    } catch (err) {
      toast.error(err?.friendlyMessage || err?.message || 'Export failed');
    }
  };

  const historySummaryCards = useMemo(() => {
    const buyCount = transactions.filter((item) => item.type === 'buy').length;
    const sellCount = transactions.filter((item) => item.type === 'sell').length;
    const fundingCount = transactions.filter((item) => item.type === 'deposit' || item.type === 'withdrawal').length;

    return [
      { label: 'Records', value: transactionsMeta.total || transactions.length, note: 'Transactions loaded' },
      { label: 'Buy orders', value: buyCount, note: 'Accumulation activity' },
      { label: 'Sell orders', value: sellCount, note: 'Realized activity' },
      { label: 'Funding moves', value: fundingCount, note: 'Cash in and cash out' },
    ];
  }, [transactions, transactionsMeta.total]);

  const transactionRows = transactions.map((item) => ({
    rowClassName: item.type === 'buy' ? 'holding-row--positive' : item.type === 'sell' ? 'holding-row--warning' : '',
    type: item.type,
    asset: item.symbol,
    date: formatDate(item.createdAt),
    amount: formatCurrency(item.total),
    status: item.status,
  }));

  const performanceRows = useMemo(() => {
    const latestByDay = new Map();

    performanceHistory.forEach((point) => {
      const snapshotDate = new Date(point?.date);

      if (Number.isNaN(snapshotDate.getTime())) {
        return;
      }

      const dayKey = snapshotDate.toISOString().slice(0, 10);
      const timestamp = snapshotDate.getTime();
      const existing = latestByDay.get(dayKey);

      if (!existing || timestamp > existing.timestamp) {
        latestByDay.set(dayKey, { point, timestamp });
      }
    });

    return Array.from(latestByDay.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ point }) => ({
        date: formatDate(point.date, { dateStyle: 'medium' }),
        totalValue: formatCurrency(point.total_value),
        cash: formatCurrency(point.cash_balance),
        profitLoss: formatCurrency(point.profit_loss),
      }));
  }, [performanceHistory]);

  if (isLoading || ((historyLoading || transactionsLoading) && !transactions.length && !performanceHistory.length)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !historyLoading && !transactionsLoading && !transactions.length && !performanceHistory.length) {
    return (
      <ErrorState
        title="History unavailable"
        message={error}
        actionLabel="Reload history"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Activity"
        title="Performance and transaction history"
        description="Review historical portfolio snapshots and transaction records over time."
        compact
        badge={{
          label: 'Transactions',
          value: transactionsMeta.total || transactions.length,
          suffix: '',
          caption: 'records loaded',
          status: { label: 'History', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={historySummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Performance"
          title="Historical snapshots"
          description="Track portfolio performance over time with historical snapshots."
          status={{ label: `${performanceRows.length} points`, tone: 'info' }}
          className="feature-panel--large"
        >
          <div className="table-action-links">
            <span className="status-indicator status-indicator--info">Daily view (latest snapshot)</span>
          </div>

          <DataTable
            title="Performance history"
            className="table-panel--dense"
            rows={performanceRows.length ? performanceRows : [{ date: '—', totalValue: formatCurrency(0), cash: formatCurrency(0), profitLoss: formatCurrency(0) }]}
            columns={[
              { key: 'date', label: 'Date', emphasis: true },
              { key: 'totalValue', label: 'Total value' },
              { key: 'cash', label: 'Cash' },
              { key: 'profitLoss', label: 'Profit/Loss', getClassName: (value) => String(value).includes('-') ? 'negative-text' : 'positive-text' },
            ]}
          />
        </SectionPanel>

        <SectionPanel
          kicker="Export"
          title="Transaction export"
          description="Download your transaction history as a CSV file."
          status={{ label: 'CSV ready', tone: 'positive' }}
        >
          <PanelActionBar
            actions={[
              {
                key: 'export-csv',
                label: 'Export transactions CSV',
                icon: <Download size={16} />,
                onClick: handleExport,
              },
            ]}
          />
        </SectionPanel>
      </div>

      <DataTable
        title="Transaction history"
        className="table-panel--ledger"
        status={{ label: `Page ${transactionsMeta.page || 1}`, tone: 'info' }}
        rows={transactionRows.length ? transactionRows : [{ type: '—', asset: 'No transactions yet', date: '—', amount: formatCurrency(0), status: 'empty' }]}
        columns={[
          {
            key: 'type',
            label: 'Type',
            emphasis: true,
            render: (value) => {
              if (value === 'buy') return <span className="status-indicator status-indicator--positive"><ArrowUpCircle size={14} /><span>Buy</span></span>;
              if (value === 'sell') return <span className="status-indicator status-indicator--warning"><ArrowDownCircle size={14} /><span>Sell</span></span>;
              if (value === 'deposit') return <span className="status-indicator status-indicator--info"><Landmark size={14} /><span>Deposit</span></span>;
              if (value === 'withdrawal') return <span className="status-indicator status-indicator--neutral"><Landmark size={14} /><span>Withdrawal</span></span>;
              return value;
            },
          },
          { key: 'asset', label: 'Asset' },
          { key: 'date', label: 'Date' },
          { key: 'amount', label: 'Amount', getClassName: (_, row) => row.type === 'sell' ? 'positive-text' : row.type === 'buy' ? '' : 'stat-note' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => <span className={`status-indicator ${value === 'completed' ? 'status-indicator--positive' : value === 'pending' ? 'status-indicator--warning' : 'status-indicator--neutral'}`}><span>{value}</span></span>,
          },
        ]}
      />
    </PremiumPage>
  );
}
