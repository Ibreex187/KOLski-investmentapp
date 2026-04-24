import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowDownCircle, ArrowUpCircle, Landmark, TrendingUp } from 'lucide-react';
import PageSkeleton from '../components/common/PageSkeleton';
import PageHero from '../components/dashboard/PageHero';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusList from '../components/dashboard/StatusList';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import {
  buyStock,
  clearPortfolioAction,
  clearPortfolioError,
  depositFunds,
  fetchManualDeposits,
  fetchManualWithdrawals,
  fetchPortfolioOverview,
  sellStock,
  withdrawFunds,
} from '../features/portfolioSlice';
import { tradeContent } from '../content/dashboardContent';
import { formatCurrency, formatDateTime } from '../services/formatters';
import { getManualRequestStatusLabel, getManualRequestStatusTone } from '../services/requestStatus';

const initialBuyForm = {
  symbol: '',
  name: '',
  shares: '',
  price: '',
  sector: '',
};

const initialSellForm = {
  symbol: '',
  shares: '',
  price: '',
};

const initialFundingForm = {
  amount: '',
  transferReference: '',
  note: '',
};

export default function Trade({ isLoading = false }) {
  const dispatch = useDispatch();
  const { overview, overviewLoading, actionLoading, lastAction, error, manualDeposits, manualDepositsLoading, manualWithdrawals, manualWithdrawalsLoading } = useSelector(
    (state) => state.portfolio
  );

  const [buyForm, setBuyForm] = useState(initialBuyForm);
  const [sellForm, setSellForm] = useState(initialSellForm);
  const [depositForm, setDepositForm] = useState(initialFundingForm);
  const [withdrawForm, setWithdrawForm] = useState(initialFundingForm);

  const [buySubmitting, setBuySubmitting] = useState(false);
  const [sellSubmitting, setSellSubmitting] = useState(false);
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  useEffect(() => {
    if (!overview && !overviewLoading) {
      dispatch(fetchPortfolioOverview());
    }
  }, [dispatch, overview, overviewLoading]);

  useEffect(() => {
    if (!manualDeposits.length && !manualDepositsLoading) {
      dispatch(fetchManualDeposits({ page: 1, limit: 5 }));
    }
  }, [dispatch, manualDeposits.length, manualDepositsLoading]);

  useEffect(() => {
    if (!manualWithdrawals.length && !manualWithdrawalsLoading) {
      dispatch(fetchManualWithdrawals({ page: 1, limit: 5 }));
    }
  }, [dispatch, manualWithdrawals.length, manualWithdrawalsLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPortfolioError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (lastAction?.success) {
      const msg = typeof lastAction?.message === 'string'
        ? lastAction.message
        : 'Portfolio action completed successfully.';
      toast.success(msg);
      dispatch(clearPortfolioAction());
    }
  }, [lastAction, dispatch]);

  const portfolio = overview?.portfolio || {};
  const holdings = Array.isArray(overview?.holdings) ? overview.holdings : [];
  const selectedHolding = holdings.find((item) => item.symbol === sellForm.symbol);

  const holdingItems = useMemo(() => {
    if (!holdings.length) {
      return [
        {
          text: 'No holdings yet. Deposit funds and place your first buy order to get started.',
          status: { label: 'Empty', tone: 'neutral' },
        },
      ];
    }

    return holdings.slice(0, 4).map((item) => ({
      text: `${item.symbol} • ${item.shares} shares at ${formatCurrency(
        item.average_price,
        portfolio.currency || 'USD'
      )}`,
      status: { label: item.sector || 'Holding', tone: 'info' },
    }));
  }, [holdings, portfolio.currency]);

  const manualDepositItems = useMemo(() => {
    if (!manualDeposits.length) {
      return [
        {
          text: 'No manual deposit requests yet.',
          status: { label: 'Empty', tone: 'neutral' },
        },
      ];
    }

    return manualDeposits.slice(0, 5).map((item) => {
      return {
        text: `${formatCurrency(item.amount, item.currency || 'USD')} • ${item.transfer_reference || 'No ref'} • ${formatDateTime(item.submitted_at, {
          emptyLabel: 'unknown time',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}`,
        status: {
          label: getManualRequestStatusLabel(item.status),
          tone: getManualRequestStatusTone(item.status),
          live: item.status === 'pending',
        },
      };
    });
  }, [manualDeposits]);

  const manualWithdrawalItems = useMemo(() => {
    if (!manualWithdrawals.length) {
      return [
        {
          text: 'No manual withdrawal requests yet.',
          status: { label: 'Empty', tone: 'neutral' },
        },
      ];
    }

    return manualWithdrawals.slice(0, 5).map((item) => {
      return {
        text: `${formatCurrency(item.amount, item.currency || 'USD')} • ${item.destination_reference || 'No ref'} • ${formatDateTime(item.submitted_at, {
          emptyLabel: 'unknown time',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}`,
        status: {
          label: getManualRequestStatusLabel(item.status),
          tone: getManualRequestStatusTone(item.status),
          live: item.status === 'pending',
        },
      };
    });
  }, [manualWithdrawals]);

  const tradeOverviewCards = useMemo(
    () => [
      {
        label: 'Cash ready',
        value: formatCurrency(portfolio.cash_balance, portfolio.currency || 'USD'),
        note: 'Available for trading or withdrawal requests',
        tone: 'info',
      },
      {
        label: 'Holdings',
        value: holdings.length,
        note: holdings.length ? 'Active positions on your book' : 'No active positions yet',
        tone: 'positive',
      },
      {
        label: 'Pending deposits',
        value: manualDeposits.filter((item) => item.status === 'pending').length,
        note: 'Recent funding requests awaiting review',
        tone: 'warning',
      },
      {
        label: 'Pending withdrawals',
        value: manualWithdrawals.filter((item) => item.status === 'pending').length,
        note: 'Recent cash-out requests awaiting review',
        tone: 'neutral',
      },
    ],
    [holdings.length, manualDeposits, manualWithdrawals, portfolio.cash_balance, portfolio.currency]
  );

  const handleBuySubmit = async (event) => {
    event.preventDefault();

    const shares = Number(buyForm.shares);
    const price = Number(buyForm.price);

    if (!buyForm.symbol.trim() || shares <= 0 || price <= 0) {
      toast.error('Enter a valid symbol, share count, and price.');
      return;
    }

    setBuySubmitting(true);
    try {
      await dispatch(
        buyStock({
          symbol: buyForm.symbol,
          name: buyForm.name || buyForm.symbol.toUpperCase(),
          shares,
          price,
          sector: buyForm.sector,
        })
      ).unwrap();

      setBuyForm(initialBuyForm);
    } catch {
      // handled via shared portfolio error state
    } finally {
      setBuySubmitting(false);
    }
  };

  const handleSellSubmit = async (event) => {
    event.preventDefault();

    const shares = Number(sellForm.shares);
    const price = Number(sellForm.price);

    if (!sellForm.symbol.trim() || shares <= 0 || price <= 0) {
      toast.error('Enter a valid holding, share count, and price.');
      return;
    }

    if (selectedHolding && shares > Number(selectedHolding.shares || 0)) {
      toast.error('You cannot sell more shares than you currently hold.');
      return;
    }

    setSellSubmitting(true);
    try {
      await dispatch(
        sellStock({
          symbol: sellForm.symbol,
          shares,
          price,
        })
      ).unwrap();

      setSellForm(initialSellForm);
    } catch {
      // handled via shared portfolio error state
    } finally {
      setSellSubmitting(false);
    }
  };

  const handleDepositSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(depositForm.amount);
    const transferReference = String(depositForm.transferReference || '').trim();

    if (amount <= 0) {
      toast.error('Enter a valid deposit amount.');
      return;
    }

    if (transferReference.length < 4) {
      toast.error('Enter a valid transfer reference (at least 4 characters).');
      return;
    }

    setDepositSubmitting(true);
    try {
      await dispatch(
        depositFunds({
          amount,
          transferReference,
          note: depositForm.note,
        })
      ).unwrap();
      setDepositForm(initialFundingForm);
    } catch {
      // handled via shared portfolio error state
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(withdrawForm.amount);
    const destinationReference = String(withdrawForm.transferReference || '').trim();

    if (amount <= 0) {
      toast.error('Enter a valid withdrawal amount.');
      return;
    }

    if (amount > Number(portfolio.cash_balance || 0)) {
      toast.error('Withdrawal amount exceeds your available cash balance.');
      return;
    }

    if (destinationReference.length < 4) {
      toast.error('Enter a valid destination reference (at least 4 characters).');
      return;
    }

    setWithdrawSubmitting(true);
    try {
      await dispatch(
        withdrawFunds({
          amount,
          destinationReference,
          note: withdrawForm.note,
        })
      ).unwrap();
      setWithdrawForm(initialFundingForm);
    } catch {
      // handled via shared portfolio error state
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  if (isLoading || (overviewLoading && !overview)) {
    return <PageSkeleton variant="simple" />;
  }

  return (
    <PremiumPage>
      <PageHero
        kicker={tradeContent.hero.kicker}
        title="Trade and funding center"
        description="Place buy or sell orders and move cash in or out from one live workspace."
        compact
        badge={{
          label: 'Available cash',
          value: portfolio.cash_balance || 0,
          prefix: '$',
          decimals: 2,
          caption: `${holdings.length} holdings on file`,
          status: { label: 'Live balance', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={tradeOverviewCards} variant="trade" />

      <div className="content-grid">
        <SectionPanel
          title="Execution tickets"
          description="Use these forms to place trade and funding requests, then refresh your portfolio view instantly."
          status={{ label: 'Live updates', tone: 'positive', live: true }}
          className="feature-panel--large trade-panel trade-panel--primary"
        >
          <div className="trade-action-grid">
            <form className="trade-ticket trade-ticket--buy" onSubmit={handleBuySubmit}>
              <div className="trade-ticket__top">
                <div>
                  <h3>Buy stock</h3>
                  <p>Create a new buy order for a symbol you want to add.</p>
                </div>
                <span className="status-indicator status-indicator--positive">
                  <TrendingUp size={14} />
                  <span>Buy request</span>
                </span>
              </div>

              <div className="trade-field-grid">
                <label>
                  <span>Symbol</span>
                  <input
                    className="form-control"
                    value={buyForm.symbol}
                    onChange={(event) =>
                      setBuyForm((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))
                    }
                    placeholder="AAPL"
                  />
                </label>
                <label>
                  <span>Company name</span>
                  <input
                    className="form-control"
                    value={buyForm.name}
                    onChange={(event) =>
                      setBuyForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Apple Inc"
                  />
                </label>
                <label>
                  <span>Shares</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={buyForm.shares}
                    onChange={(event) =>
                      setBuyForm((current) => ({ ...current, shares: event.target.value }))
                    }
                    placeholder="10"
                  />
                </label>
                <label>
                  <span>Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={buyForm.price}
                    onChange={(event) =>
                      setBuyForm((current) => ({ ...current, price: event.target.value }))
                    }
                    placeholder="185"
                  />
                </label>
                <label className="trade-field-grid__full">
                  <span>Sector (optional)</span>
                  <input
                    className="form-control"
                    value={buyForm.sector}
                    onChange={(event) =>
                      setBuyForm((current) => ({ ...current, sector: event.target.value }))
                    }
                    placeholder="Technology"
                  />
                </label>
              </div>

              <button type="submit" className="panel-button" disabled={buySubmitting}>
                {buySubmitting ? 'Submitting...' : 'Place buy order'}
              </button>
            </form>

            <form className="trade-ticket trade-ticket--sell" onSubmit={handleSellSubmit}>
              <div className="trade-ticket__top">
                <div>
                  <h3>Sell stock</h3>
                  <p>Reduce an existing holding with a live sell action.</p>
                </div>
                <span className="status-indicator status-indicator--warning">
                  <ArrowDownCircle size={14} />
                  <span>Sell request</span>
                </span>
              </div>

              <div className="trade-field-grid">
                <label className="trade-field-grid__full">
                  <span>Holding</span>
                  <select
                    className="form-control"
                    value={sellForm.symbol}
                    onChange={(event) => {
                      const symbol = event.target.value;
                      const match = holdings.find((item) => item.symbol === symbol);
                      setSellForm((current) => ({
                        ...current,
                        symbol,
                        price: match?.average_price ? String(match.average_price) : current.price,
                      }));
                    }}
                  >
                    <option value="">Select a holding</option>
                    {holdings.map((item) => (
                      <option key={item.symbol} value={item.symbol}>
                        {item.symbol} ({item.shares} shares)
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Shares</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={sellForm.shares}
                    onChange={(event) =>
                      setSellForm((current) => ({ ...current, shares: event.target.value }))
                    }
                    placeholder="5"
                  />
                </label>
                <label>
                  <span>Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={sellForm.price}
                    onChange={(event) =>
                      setSellForm((current) => ({ ...current, price: event.target.value }))
                    }
                    placeholder="200"
                  />
                </label>
              </div>

              <p className="trade-submit-note">
                {selectedHolding
                  ? `Available to sell: ${selectedHolding.shares} shares of ${selectedHolding.symbol}`
                  : 'Choose one of your current holdings to prepare a sell order.'}
              </p>

              <button type="submit" className="panel-button panel-button--secondary" disabled={sellSubmitting}>
                {sellSubmitting ? 'Submitting...' : 'Place sell order'}
              </button>
            </form>

            <form className="trade-ticket trade-ticket--deposit" onSubmit={handleDepositSubmit}>
              <div className="trade-ticket__top">
                <div>
                  <h3>Deposit funds</h3>
                  <p>Submit a manual bank transfer request for admin review before funds are credited.</p>
                </div>
                <span className="status-indicator status-indicator--info">
                  <Landmark size={14} />
                  <span>Manual review</span>
                </span>
              </div>

              <div className="trade-field-grid">
                <label className="trade-field-grid__full">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={depositForm.amount}
                    onChange={(event) =>
                      setDepositForm((current) => ({ ...current, amount: event.target.value }))
                    }
                    placeholder="5000"
                  />
                </label>
                <label className="trade-field-grid__full">
                  <span>Transfer reference</span>
                  <input
                    className="form-control"
                    value={depositForm.transferReference}
                    onChange={(event) =>
                      setDepositForm((current) => ({ ...current, transferReference: event.target.value }))
                    }
                    placeholder="BANK-TRF-20260420"
                  />
                </label>
                <label className="trade-field-grid__full">
                  <span>Note (optional)</span>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={depositForm.note}
                    onChange={(event) =>
                      setDepositForm((current) => ({ ...current, note: event.target.value }))
                    }
                    placeholder="Optional context for operations team"
                  />
                </label>
              </div>

              <p className="trade-submit-note">Deposits are queued as pending until approved by an admin.</p>

              <button type="submit" className="panel-button" disabled={depositSubmitting}>
                {depositSubmitting ? 'Submitting...' : 'Submit manual deposit'}
              </button>
            </form>

            <form className="trade-ticket trade-ticket--withdraw" onSubmit={handleWithdrawSubmit}>
              <div className="trade-ticket__top">
                <div>
                  <h3>Withdraw funds</h3>
                  <p>Submit a manual bank transfer request for admin review before funds are debited.</p>
                </div>
                <span className="status-indicator status-indicator--neutral">
                  <ArrowUpCircle size={14} />
                  <span>Manual review</span>
                </span>
              </div>

              <div className="trade-field-grid">
                <label className="trade-field-grid__full">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={withdrawForm.amount}
                    onChange={(event) =>
                      setWithdrawForm((current) => ({ ...current, amount: event.target.value }))
                    }
                    placeholder="1000"
                  />
                </label>
                <label className="trade-field-grid__full">
                  <span>Destination reference</span>
                  <input
                    className="form-control"
                    value={withdrawForm.transferReference}
                    onChange={(event) =>
                      setWithdrawForm((current) => ({ ...current, transferReference: event.target.value }))
                    }
                    placeholder="BANK-ACCT-20260420"
                  />
                </label>
                <label className="trade-field-grid__full">
                  <span>Note (optional)</span>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={withdrawForm.note}
                    onChange={(event) =>
                      setWithdrawForm((current) => ({ ...current, note: event.target.value }))
                    }
                    placeholder="Optional context for operations team"
                  />
                </label>
              </div>

              <p className="trade-submit-note">
                Available cash: {formatCurrency(portfolio.cash_balance, portfolio.currency || 'USD')}
              </p>

              <button type="submit" className="panel-button panel-button--secondary" disabled={withdrawSubmitting}>
                {withdrawSubmitting ? 'Submitting...' : 'Submit manual withdrawal'}
              </button>
            </form>
          </div>
        </SectionPanel>

        <SectionPanel
          title={tradeContent.insight.title}
          description="Use this side panel to stay aware of holdings and execution context while posting live actions."
          status={tradeContent.insight.status}
          className="trade-panel trade-panel--rail"
        >
          <StatusList items={tradeContent.checklist} />
          <div className="trade-holdings-block">
            <h3>Current holdings</h3>
            <StatusList items={holdingItems} />
          </div>
          <div className="trade-holdings-block">
            <h3>Recent manual deposits</h3>
            <StatusList items={manualDepositItems} />
            {manualDepositsLoading ? <p className="trade-submit-note">Loading recent requests...</p> : null}
          </div>
          <div className="trade-holdings-block">
            <h3>Recent manual withdrawals</h3>
            <StatusList items={manualWithdrawalItems} />
            {manualWithdrawalsLoading ? <p className="trade-submit-note">Loading recent requests...</p> : null}
          </div>
        </SectionPanel>
      </div>
    </PremiumPage>
  );
}
