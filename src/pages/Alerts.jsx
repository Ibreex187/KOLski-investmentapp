import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { BellRing, PlusCircle, Trash2 } from 'lucide-react';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DataTable from '../components/dashboard/DataTable';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import {
  clearAlertAction,
  clearPortfolioError,
  createPriceAlert,
  deletePriceAlert,
  fetchPortfolioOverview,
  fetchPriceAlerts,
} from '../features/portfolioSlice';
import { formatCurrency, formatDate } from '../services/formatters';

const initialForm = {
  symbol: '',
  targetPrice: '',
  direction: 'above',
};

export default function Alerts({ isLoading = false }) {
  const dispatch = useDispatch();
  const {
    alerts,
    alertsLoading,
    alertActionLoading,
    lastAlertAction,
    overview,
    overviewLoading,
    error,
  } = useSelector((state) => state.portfolio);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchPriceAlerts());

    if (!overview && !overviewLoading) {
      dispatch(fetchPortfolioOverview());
    }
  }, [dispatch, overview, overviewLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (!lastAlertAction) return;

    toast.success(lastAlertAction.type === 'created' ? 'Price alert created.' : 'Price alert removed.');
    dispatch(clearAlertAction());
  }, [lastAlertAction, dispatch]);

  const holdings = Array.isArray(overview?.holdings) ? overview.holdings : [];
  const suggestedSymbols = [...new Set(holdings.map((item) => item.symbol).filter(Boolean))].slice(0, 5);

  const alertInsights = useMemo(() => {
    const aboveCount = alerts.filter((item) => item.direction === 'above').length;
    const belowCount = alerts.filter((item) => item.direction === 'below').length;

    return [
      {
        text: `${alerts.length} active alert${alerts.length === 1 ? '' : 's'} currently configured for your account.`,
        status: { label: alerts.length ? 'Monitoring' : 'No alerts', tone: alerts.length ? 'positive' : 'neutral' },
      },
      {
        text: `${aboveCount} above-threshold and ${belowCount} below-threshold rules are live.`,
        status: { label: 'Rule mix', tone: 'info' },
      },
      suggestedSymbols.length
        ? {
            text: `Quick symbols from your holdings: ${suggestedSymbols.join(', ')}.`,
            status: { label: 'Suggestions', tone: 'warning' },
          }
        : {
            text: 'No holdings yet—create alerts for any symbol you want to monitor.',
            status: { label: 'Open watch', tone: 'warning' },
          },
    ];
  }, [alerts, suggestedSymbols]);

  const alertSummaryCards = useMemo(() => {
    const aboveCount = alerts.filter((item) => item.direction === 'above').length;
    const belowCount = alerts.filter((item) => item.direction === 'below').length;
    const triggeredCount = alerts.filter((item) => item.triggered || item.status === 'triggered').length;

    return [
      { label: 'Active alerts', value: alerts.length, note: 'Rules currently tracking prices' },
      { label: 'Above target', value: aboveCount, note: 'Upside alert rules' },
      { label: 'Below target', value: belowCount, note: 'Downside alert rules' },
      { label: 'Triggered', value: triggeredCount, note: 'Rules that already fired' },
    ];
  }, [alerts]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const targetPrice = Number(form.targetPrice);
    if (!form.symbol.trim() || targetPrice <= 0) {
      toast.error('Enter a valid symbol and target price.');
      return;
    }

    try {
      await dispatch(
        createPriceAlert({
          symbol: form.symbol,
          targetPrice,
          direction: form.direction,
        })
      ).unwrap();

      setForm(initialForm);
    } catch {
      // handled via shared error state
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      await dispatch(deletePriceAlert(id)).unwrap();
    } catch {
      // handled via shared error state
    }
  };

  const alertRows = alerts.map((item) => ({
    id: item._id,
    symbol: item.symbol,
    target: formatCurrency(item.target_price),
    direction: item.direction,
    status: item.status || (item.triggered ? 'triggered' : 'active'),
    created: formatDate(item.createdAt),
  }));

  const handleRetry = () => {
    dispatch(clearPortfolioError());
    dispatch(fetchPriceAlerts());
    dispatch(fetchPortfolioOverview());
  };

  if (isLoading || (alertsLoading && !alerts.length && overviewLoading && !overview)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !alertsLoading && !overviewLoading && !alerts.length && !overview) {
    return (
      <ErrorState
        title="Alerts unavailable"
        message={error}
        actionLabel="Reload alerts"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Alerts"
        title="Price alert center"
        description="Create, monitor, and remove threshold alerts with real-time updates."
        compact
        badge={{
          label: 'Active alerts',
          value: alerts.length,
          suffix: '',
          caption: 'live tracking',
          status: { label: 'Live rules', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={alertSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Create"
          title="New price alert"
          description="Submit a symbol, a target price, and a direction to create a live price threshold rule."
          status={{ label: 'Ready to create', tone: 'positive', live: true }}
          className="feature-panel--large trade-panel trade-panel--primary"
        >
          <form className="trade-ticket trade-ticket--buy" onSubmit={handleSubmit}>
            <div className="trade-ticket__top">
              <div>
                <h3>Create alert rule</h3>
                <p>Choose whether you want to be notified when a symbol moves above or below your target.</p>
              </div>
              <span className="status-indicator status-indicator--positive">
                <BellRing size={14} />
                <span>Live tracking</span>
              </span>
            </div>

            <div className="trade-field-grid">
              <label>
                <span>Symbol</span>
                <input
                  className="form-control"
                  value={form.symbol}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))
                  }
                  placeholder="AAPL"
                />
              </label>

              <label>
                <span>Target price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={form.targetPrice}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, targetPrice: event.target.value }))
                  }
                  placeholder="250"
                />
              </label>

              <label className="trade-field-grid__full">
                <span>Direction</span>
                <select
                  className="form-control"
                  value={form.direction}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, direction: event.target.value }))
                  }
                >
                  <option value="above">Alert when price moves above target</option>
                  <option value="below">Alert when price moves below target</option>
                </select>
              </label>
            </div>

            {suggestedSymbols.length ? (
              <div className="panel-actions">
                {suggestedSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    className="mini-action-btn"
                    onClick={() => setForm((current) => ({ ...current, symbol }))}
                  >
                    Use {symbol}
                  </button>
                ))}
              </div>
            ) : null}

            <button type="submit" className="panel-button" disabled={alertActionLoading}>
              <PlusCircle size={16} />
              <span>{alertActionLoading ? 'Saving alert...' : 'Create alert'}</span>
            </button>
          </form>
        </SectionPanel>

        <SectionPanel
          kicker="Manage"
          title="Alert coverage"
          description="Review how many alert rules are active and reuse symbols already present in your portfolio."
          status={{ label: 'Live list', tone: 'info', live: true }}
          className="trade-panel trade-panel--rail"
        >
          <StatusList items={alertInsights} />
        </SectionPanel>
      </div>

      <DataTable
        title="Active price alerts"
        className="table-panel--ledger"
        status={{ label: `${alerts.length} rule${alerts.length === 1 ? '' : 's'}`, tone: alerts.length ? 'positive' : 'neutral' }}
        rows={alertRows.length ? alertRows : [{ symbol: '—', target: '$0.00', direction: 'none', status: 'empty', created: '—' }]}
        columns={[
          { key: 'symbol', label: 'Symbol', emphasis: true },
          { key: 'target', label: 'Target' },
          {
            key: 'direction',
            label: 'Direction',
            render: (value) => {
              if (value === 'none') return '—';

              return (
                <span className={`status-indicator ${value === 'above' ? 'status-indicator--positive' : 'status-indicator--warning'}`}>
                  {value === 'above' ? 'Above' : 'Below'}
                </span>
              );
            },
          },
          {
            key: 'status',
            label: 'Status',
            render: (value) => (
              <span className={`status-indicator ${value === 'active' ? 'status-indicator--info' : value === 'triggered' ? 'status-indicator--warning' : 'status-indicator--neutral'}`}>
                {value}
              </span>
            ),
          },
          { key: 'created', label: 'Created' },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, row) =>
              row.id ? (
                <button
                  type="button"
                  className="mini-action-btn mini-action-btn--danger"
                  onClick={() => handleDelete(row.id)}
                  disabled={alertActionLoading}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              ) : (
                '—'
              ),
          },
        ]}
      />
    </PremiumPage>
  );
}
