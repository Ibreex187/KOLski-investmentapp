import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Landmark, RefreshCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ErrorState from '../components/common/ErrorState';
import PageSkeleton from '../components/common/PageSkeleton';
import DetailList from '../components/dashboard/DetailList';
import PageHero from '../components/dashboard/PageHero';
import PanelActionBar from '../components/dashboard/PanelActionBar';
import SectionPanel from '../components/dashboard/SectionPanel';
import StatusBadge from '../components/dashboard/StatusBadge';
import FilterPillGroup from '../components/dashboard/FilterPillGroup';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import PremiumPage from '../components/layout/PremiumPage';
import {
  clearPortfolioError,
  fetchManualDepositById,
  fetchManualDeposits,
} from '../features/portfolioSlice';
import { formatCurrency, formatDateTime } from '../services/formatters';
import { getManualRequestStatusLabel, getManualRequestStatusTone } from '../services/requestStatus';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Approved' },
  { value: 'failed', label: 'Rejected' },
];

export default function ManualDeposits({ isLoading = false }) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    manualDeposits,
    manualDepositsMeta,
    manualDepositsLoading,
    manualDepositDetail,
    manualDepositDetailLoading,
    error,
  } = useSelector((state) => state.portfolio);

  const allowedStatuses = new Set(statusOptions.map((option) => option.value));
  const status = allowedStatuses.has(searchParams.get('status')) ? searchParams.get('status') : 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const selectedDepositId = searchParams.get('depositId') || '';
  const currentPage = Math.max(1, Number(searchParams.get('page') || 1) || 1);

  const updateQueryString = (updates, options = {}) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined
        || value === null
        || value === ''
        || (key === 'status' && value === 'all')
        || (key === 'page' && Number(value) === 1)
      ) {
        nextParams.delete(key);
        return;
      }

      nextParams.set(key, String(value));
    });

    setSearchParams(nextParams, options);
  };

  useEffect(() => {
    const query = {
      page: currentPage,
      limit: 10,
    };

    if (status !== 'all') {
      query.status = status;
    }

    if (startDate) {
      query.startDate = startDate;
    }

    if (endDate) {
      query.endDate = endDate;
    }

    dispatch(fetchManualDeposits(query));
  }, [dispatch, currentPage, status, startDate, endDate]);

  useEffect(() => {
    if (!selectedDepositId && manualDeposits.length) {
      updateQueryString({ depositId: manualDeposits[0].deposit_id }, { replace: true });
    }
  }, [manualDeposits, selectedDepositId]);

  useEffect(() => {
    if (selectedDepositId) {
      dispatch(fetchManualDepositById(selectedDepositId));
    }
  }, [dispatch, selectedDepositId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const totalPages = Math.max(1, manualDepositsMeta.pages || 1);

  const depositSummaryCards = useMemo(
    () => [
      {
        label: 'Visible requests',
        value: manualDeposits.length,
        note: 'Requests on this page',
      },
      {
        label: 'Pending review',
        value: manualDeposits.filter((item) => item.status === 'pending').length,
        note: 'Awaiting approval',
      },
      {
        label: 'Approved',
        value: manualDeposits.filter((item) => item.status === 'completed').length,
        note: 'Cleared requests',
      },
      {
        label: 'Rejected',
        value: manualDeposits.filter((item) => item.status === 'failed').length,
        note: 'Needs follow-up',
      },
    ],
    [manualDeposits]
  );

  const selectedDepositItems = useMemo(() => {
    if (!manualDepositDetail) {
      return [];
    }

    return [
      {
        label: 'Amount',
        value: formatCurrency(manualDepositDetail.amount, manualDepositDetail.currency || 'USD'),
      },
      {
        label: 'Status',
        value: (
          <StatusBadge
            label={getManualRequestStatusLabel(manualDepositDetail.status)}
            tone={getManualRequestStatusTone(manualDepositDetail.status)}
            live={manualDepositDetail.status === 'pending'}
          />
        ),
      },
      {
        label: 'Transfer reference',
        value: manualDepositDetail.transfer_reference || 'Not provided',
      },
      {
        label: 'Submitted at',
        value: formatDateTime(manualDepositDetail.submitted_at, { emptyLabel: 'Not available' }),
      },
      {
        label: 'Reviewed at',
        value: formatDateTime(manualDepositDetail.reviewed_at, { emptyLabel: 'Not available' }),
      },
      {
        label: 'Rejection reason',
        value: manualDepositDetail.rejection_reason || 'Not rejected',
      },
      {
        label: 'Note',
        value: manualDepositDetail.note || 'No note attached',
      },
    ];
  }, [manualDepositDetail]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;

    updateQueryString({ page: nextPage, depositId: '' });
  };

  const handleRetry = () => {
    dispatch(clearPortfolioError());
    dispatch(
      fetchManualDeposits({
        page: currentPage,
        limit: 10,
        ...(status !== 'all' ? { status } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      })
    );

    if (selectedDepositId) {
      dispatch(fetchManualDepositById(selectedDepositId));
    }
  };

  const handleRefresh = () => {
    handleRetry();
    toast.success('Manual deposits refreshed.');
  };

  const handleStatusChange = (value) => {
    updateQueryString({ status: value, page: 1, depositId: '' });
  };

  const handleStartDateChange = (value) => {
    updateQueryString({ startDate: value, page: 1, depositId: '' });
  };

  const handleEndDateChange = (value) => {
    updateQueryString({ endDate: value, page: 1, depositId: '' });
  };

  const handleClearFilters = () => {
    updateQueryString({
      status: '',
      startDate: '',
      endDate: '',
      page: '',
      depositId: '',
    });
    toast.success('Filters cleared.');
  };

  if (isLoading || (manualDepositsLoading && !manualDeposits.length)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !manualDepositsLoading && !manualDeposits.length) {
    return (
      <ErrorState
        title="Manual deposits unavailable"
        message={error}
        actionLabel="Retry"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <PremiumPage>
      <PageHero
        kicker="Funding"
        title="Manual deposits"
        description="Track your submitted deposit requests, filter them by status or date, and inspect full request details in one place."
        compact
        badge={{
          label: 'Total requests',
          value: manualDepositsMeta.total || 0,
          caption: `Page ${currentPage} of ${totalPages}`,
          status: { label: 'Live queue', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={depositSummaryCards} />

      <div className="content-grid">
        <SectionPanel
          kicker="Filters"
          title="Refine results"
          description="Use status and date range filters to narrow results while keeping pagination consistent."
          className="funding-panel funding-panel--filters"
          status={{ label: 'Synced', tone: 'info' }}
        >
          <FilterPillGroup options={statusOptions} value={status} onChange={handleStatusChange} />

          <div className="manual-deposit-filters">
            <label>
              <span>Status</span>
              <select
                className="form-control"
                value={status}
                onChange={(event) => handleStatusChange(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Start date</span>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
              />
            </label>
            <label>
              <span>End date</span>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(event) => handleEndDateChange(event.target.value)}
              />
            </label>
          </div>

          <PanelActionBar
            actions={[
              {
                key: 'refresh',
                label: 'Refresh list',
                icon: <RefreshCcw size={16} />,
                onClick: handleRefresh,
              },
              {
                key: 'clear',
                label: 'Clear filters',
                variant: 'secondary',
                onClick: handleClearFilters,
              },
            ]}
          />
        </SectionPanel>

        <SectionPanel
          kicker="Detail"
          title="Selected request"
          description="Review the full details for the selected deposit request."
          className="funding-panel funding-panel--detail"
          status={{
            label: manualDepositDetail?.status ? getManualRequestStatusLabel(manualDepositDetail.status) : 'No selection',
            tone: getManualRequestStatusTone(manualDepositDetail?.status),
            live: manualDepositDetail?.status === 'pending',
          }}
        >
          {manualDepositDetailLoading ? (
            <p className="trade-submit-note">Loading request details...</p>
          ) : manualDepositDetail ? (
            <DetailList items={selectedDepositItems} highlighted />
          ) : (
            <p className="trade-submit-note">Select a request to view details.</p>
          )}
        </SectionPanel>
      </div>

      <SectionPanel
        kicker="Requests"
        title="Manual deposit requests"
        description="Browse your deposit request history and open any request for details."
        className="funding-panel funding-panel--table"
        status={{
          label: `${manualDeposits.length} shown`,
          tone: 'info',
        }}
      >
        <div className="manual-deposits-table">
          <div className="manual-deposits-table__head">
            <span>Amount</span>
            <span>Status</span>
            <span>Transfer ref</span>
            <span>Submitted</span>
            <span>Action</span>
          </div>

          {manualDeposits.length ? (
            manualDeposits.map((item) => (
              <div
                key={item.deposit_id}
                className={`manual-deposits-table__row ${selectedDepositId === item.deposit_id ? 'is-selected' : ''}`}
              >
                <strong className="manual-request-amount">{formatCurrency(item.amount, item.currency || 'USD')}</strong>
                <StatusBadge
                  label={getManualRequestStatusLabel(item.status)}
                  tone={getManualRequestStatusTone(item.status)}
                  live={item.status === 'pending'}
                />
                <span className="manual-request-reference">{item.transfer_reference || 'Not available'}</span>
                <span className="manual-request-date">{formatDateTime(item.submitted_at)}</span>
                <button
                  type="button"
                  className="mini-action-btn"
                  onClick={() => updateQueryString({ depositId: item.deposit_id })}
                >
                  <Landmark size={14} />
                  <span>View details</span>
                </button>
              </div>
            ))
          ) : (
            <p className="trade-submit-note">No manual deposits match the selected filters.</p>
          )}
        </div>

        <div className="manual-deposits-pagination">
          <button
            type="button"
            className="panel-button panel-button--secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || manualDepositsLoading}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="panel-button panel-button--secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || manualDepositsLoading}
          >
            Next
          </button>
        </div>
      </SectionPanel>
    </PremiumPage>
  );
}
