import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowUpCircle, RefreshCcw } from 'lucide-react';
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
  fetchManualWithdrawalById,
  fetchManualWithdrawals,
} from '../features/portfolioSlice';
import { formatCurrency, formatDateTime } from '../services/formatters';
import { getManualRequestStatusLabel, getManualRequestStatusTone } from '../services/requestStatus';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Approved' },
  { value: 'failed', label: 'Rejected' },
];

export default function ManualWithdrawals({ isLoading = false }) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    manualWithdrawals,
    manualWithdrawalsMeta,
    manualWithdrawalsLoading,
    manualWithdrawalDetail,
    manualWithdrawalDetailLoading,
    error,
  } = useSelector((state) => state.portfolio);

  const allowedStatuses = new Set(statusOptions.map((option) => option.value));
  const status = allowedStatuses.has(searchParams.get('status')) ? searchParams.get('status') : 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const selectedWithdrawalId = searchParams.get('withdrawalId') || '';
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

    dispatch(fetchManualWithdrawals(query));
  }, [dispatch, currentPage, status, startDate, endDate]);

  useEffect(() => {
    if (!selectedWithdrawalId && manualWithdrawals.length) {
      updateQueryString({ withdrawalId: manualWithdrawals[0].withdrawal_id }, { replace: true });
    }
  }, [manualWithdrawals, selectedWithdrawalId]);

  useEffect(() => {
    if (selectedWithdrawalId) {
      dispatch(fetchManualWithdrawalById(selectedWithdrawalId));
    }
  }, [dispatch, selectedWithdrawalId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const totalPages = Math.max(1, manualWithdrawalsMeta.pages || 1);

  const withdrawalSummaryCards = useMemo(
    () => [
      {
        label: 'Visible requests',
        value: manualWithdrawals.length,
        note: 'Requests on this page',
      },
      {
        label: 'Pending review',
        value: manualWithdrawals.filter((item) => item.status === 'pending').length,
        note: 'Awaiting approval',
      },
      {
        label: 'Approved',
        value: manualWithdrawals.filter((item) => item.status === 'completed').length,
        note: 'Released requests',
      },
      {
        label: 'Rejected',
        value: manualWithdrawals.filter((item) => item.status === 'failed').length,
        note: 'Needs follow-up',
      },
    ],
    [manualWithdrawals]
  );

  const selectedWithdrawalItems = useMemo(() => {
    if (!manualWithdrawalDetail) {
      return [];
    }

    return [
      {
        label: 'Amount',
        value: formatCurrency(manualWithdrawalDetail.amount, manualWithdrawalDetail.currency || 'USD'),
      },
      {
        label: 'Status',
        value: (
          <StatusBadge
            label={getManualRequestStatusLabel(manualWithdrawalDetail.status)}
            tone={getManualRequestStatusTone(manualWithdrawalDetail.status)}
            live={manualWithdrawalDetail.status === 'pending'}
          />
        ),
      },
      {
        label: 'Destination reference',
        value: manualWithdrawalDetail.destination_reference || 'Not provided',
      },
      {
        label: 'Submitted at',
        value: formatDateTime(manualWithdrawalDetail.submitted_at, { emptyLabel: 'Not available' }),
      },
      {
        label: 'Reviewed at',
        value: formatDateTime(manualWithdrawalDetail.reviewed_at, { emptyLabel: 'Not available' }),
      },
      {
        label: 'Rejection reason',
        value: manualWithdrawalDetail.rejection_reason || 'Not rejected',
      },
      {
        label: 'Note',
        value: manualWithdrawalDetail.note || 'No note attached',
      },
    ];
  }, [manualWithdrawalDetail]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;

    updateQueryString({ page: nextPage, withdrawalId: '' });
  };

  const handleRetry = () => {
    dispatch(clearPortfolioError());
    dispatch(
      fetchManualWithdrawals({
        page: currentPage,
        limit: 10,
        ...(status !== 'all' ? { status } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      })
    );

    if (selectedWithdrawalId) {
      dispatch(fetchManualWithdrawalById(selectedWithdrawalId));
    }
  };

  const handleRefresh = () => {
    handleRetry();
    toast.success('Manual withdrawals refreshed.');
  };

  const handleStatusChange = (value) => {
    updateQueryString({ status: value, page: 1, withdrawalId: '' });
  };

  const handleStartDateChange = (value) => {
    updateQueryString({ startDate: value, page: 1, withdrawalId: '' });
  };

  const handleEndDateChange = (value) => {
    updateQueryString({ endDate: value, page: 1, withdrawalId: '' });
  };

  const handleClearFilters = () => {
    updateQueryString({
      status: '',
      startDate: '',
      endDate: '',
      page: '',
      withdrawalId: '',
    });
    toast.success('Filters cleared.');
  };

  if (isLoading || (manualWithdrawalsLoading && !manualWithdrawals.length)) {
    return <PageSkeleton variant="table" />;
  }

  if (error && !manualWithdrawalsLoading && !manualWithdrawals.length) {
    return (
      <ErrorState
        title="Manual withdrawals unavailable"
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
        title="Manual withdrawals"
        description="Track your submitted withdrawal requests, filter them by status or date, and inspect full request details in one place."
        compact
        badge={{
          label: 'Total requests',
          value: manualWithdrawalsMeta.total || 0,
          caption: `Page ${currentPage} of ${totalPages}`,
          status: { label: 'Live queue', tone: 'info', live: true },
        }}
      />

      <SummaryStrip items={withdrawalSummaryCards} />

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
          description="Review the full details for the selected withdrawal request."
          className="funding-panel funding-panel--detail"
          status={{
            label: manualWithdrawalDetail?.status ? getManualRequestStatusLabel(manualWithdrawalDetail.status) : 'No selection',
            tone: getManualRequestStatusTone(manualWithdrawalDetail?.status),
            live: manualWithdrawalDetail?.status === 'pending',
          }}
        >
          {manualWithdrawalDetailLoading ? (
            <p className="trade-submit-note">Loading request details...</p>
          ) : manualWithdrawalDetail ? (
            <DetailList items={selectedWithdrawalItems} highlighted />
          ) : (
            <p className="trade-submit-note">Select a request to view details.</p>
          )}
        </SectionPanel>
      </div>

      <SectionPanel
        kicker="Requests"
        title="Manual withdrawal requests"
        description="Browse your withdrawal request history and open any request for details."
        className="funding-panel funding-panel--table"
        status={{
          label: `${manualWithdrawals.length} shown`,
          tone: 'info',
        }}
      >
        <div className="manual-deposits-table">
          <div className="manual-deposits-table__head">
            <span>Amount</span>
            <span>Status</span>
            <span>Destination ref</span>
            <span>Submitted</span>
            <span>Action</span>
          </div>

          {manualWithdrawals.length ? (
            manualWithdrawals.map((item) => (
              <div
                key={item.withdrawal_id}
                className={`manual-deposits-table__row ${selectedWithdrawalId === item.withdrawal_id ? 'is-selected' : ''}`}
              >
                <strong className="manual-request-amount">{formatCurrency(item.amount, item.currency || 'USD')}</strong>
                <StatusBadge
                  label={getManualRequestStatusLabel(item.status)}
                  tone={getManualRequestStatusTone(item.status)}
                  live={item.status === 'pending'}
                />
                <span className="manual-request-reference">{item.destination_reference || 'Not available'}</span>
                <span className="manual-request-date">{formatDateTime(item.submitted_at)}</span>
                <button
                  type="button"
                  className="mini-action-btn"
                  onClick={() => updateQueryString({ withdrawalId: item.withdrawal_id })}
                >
                  <ArrowUpCircle size={14} />
                  <span>View details</span>
                </button>
              </div>
            ))
          ) : (
            <p className="trade-submit-note">No manual withdrawals match the selected filters.</p>
          )}
        </div>

        <div className="manual-deposits-pagination">
          <button
            type="button"
            className="panel-button panel-button--secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || manualWithdrawalsLoading}
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
            disabled={currentPage >= totalPages || manualWithdrawalsLoading}
          >
            Next
          </button>
        </div>
      </SectionPanel>
    </PremiumPage>
  );
}
