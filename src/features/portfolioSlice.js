import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS, getApiErrorMessage } from '../services/api';

const buildReferenceId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const refreshPortfolioData = async (dispatch) => {
  await Promise.allSettled([
    dispatch(fetchPortfolioDashboard()),
    dispatch(fetchPortfolioOverview()),
    dispatch(fetchPortfolioAnalytics()),
    dispatch(fetchPerformanceHistory()),
    dispatch(fetchTransactions()),
  ]);
};

const refreshAlertsData = async (dispatch) => {
  await Promise.allSettled([
    dispatch(fetchPriceAlerts()),
    dispatch(fetchPortfolioDashboard()),
  ]);
};

export const fetchPortfolioDashboard = createAsyncThunk(
  'portfolio/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.portfolio.dashboard);
      return data?.data ?? null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load dashboard data');
    }
  }
);

export const fetchPortfolioOverview = createAsyncThunk(
  'portfolio/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.portfolio.overview);
      return data?.data ?? { portfolio: null, holdings: [] };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load portfolio overview');
    }
  }
);

export const fetchPortfolioAnalytics = createAsyncThunk(
  'portfolio/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.portfolio.analytics);
      return data?.data ?? null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load portfolio analytics');
    }
  }
);

export const fetchPerformanceHistory = createAsyncThunk(
  'portfolio/fetchPerformanceHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.portfolio.performanceHistory);
      return data?.data ?? [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load performance history');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'portfolio/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.portfolio.transactions, {
        params,
      });

      return {
        transactions: Array.isArray(data?.transactions) ? data.transactions : [],
        total: Number(data?.total || 0),
        page: Number(data?.page || 1),
        pages: Number(data?.pages || 0),
        filters: data?.filters || {},
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load transactions');
    }
  }
);

export const fetchPriceAlerts = createAsyncThunk(
  'portfolio/fetchPriceAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.portfolio.alerts);
      return Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load price alerts');
    }
  }
);

export const fetchManualDeposits = createAsyncThunk(
  'portfolio/fetchManualDeposits',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.deposits.list, {
        params,
      });

      const payload = data?.data ?? data ?? {};
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: Number(payload.total || 0),
        page: Number(payload.page || 1),
        pages: Number(payload.pages || 0),
        filters: {
          status: params.status || 'all',
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          limit: Number(params.limit || 10),
        },
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load manual deposits');
    }
  }
);

export const fetchManualDepositById = createAsyncThunk(
  'portfolio/fetchManualDepositById',
  async (depositId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.deposits.byId(depositId));
      return data?.data ?? data ?? null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load manual deposit details');
    }
  }
);

export const fetchManualWithdrawals = createAsyncThunk(
  'portfolio/fetchManualWithdrawals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.withdrawals.list, {
        params,
      });

      const payload = data?.data ?? data ?? {};
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: Number(payload.total || 0),
        page: Number(payload.page || 1),
        pages: Number(payload.pages || 0),
        filters: {
          status: params.status || 'all',
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          limit: Number(params.limit || 10),
        },
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load manual withdrawals');
    }
  }
);

export const fetchManualWithdrawalById = createAsyncThunk(
  'portfolio/fetchManualWithdrawalById',
  async (withdrawalId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.withdrawals.byId(withdrawalId));
      return data?.data ?? data ?? null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load manual withdrawal details');
    }
  }
);

export const buyStock = createAsyncThunk(
  'portfolio/buyStock',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const requestPayload = {
        ...payload,
        symbol: String(payload.symbol || '').trim().toUpperCase(),
        shares: Number(payload.shares),
        price: Number(payload.price),
        reference_id: payload.reference_id || buildReferenceId('buy'),
      };

      const { data } = await api.post(API_ENDPOINTS.portfolio.buy, requestPayload);
      await refreshPortfolioData(dispatch);
      return data?.data ?? data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to buy stock');
    }
  }
);

export const sellStock = createAsyncThunk(
  'portfolio/sellStock',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const requestPayload = {
        ...payload,
        symbol: String(payload.symbol || '').trim().toUpperCase(),
        shares: Number(payload.shares),
        price: Number(payload.price),
        reference_id: payload.reference_id || buildReferenceId('sell'),
      };

      const { data } = await api.post(API_ENDPOINTS.portfolio.sell, requestPayload);
      await refreshPortfolioData(dispatch);
      return data?.data ?? data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to sell stock');
    }
  }
);

export const depositFunds = createAsyncThunk(
  'portfolio/depositFunds',
  async ({ amount, transferReference, note }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.deposits.manual, {
        amount: Number(amount),
        currency: 'USD',
        transfer_reference: String(transferReference || '').trim(),
        idempotency_key: buildReferenceId('manual-deposit'),
        note: note ? String(note).trim() : undefined,
      });

      await refreshPortfolioData(dispatch);
      await dispatch(fetchManualDeposits({ page: 1, limit: 5 }));
      return data?.data ?? data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to deposit funds');
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  'portfolio/withdrawFunds',
  async ({ amount, destinationReference, note }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.withdrawals.manual, {
        amount: Number(amount),
        currency: 'USD',
        destination_reference: String(destinationReference || '').trim(),
        idempotency_key: buildReferenceId('manual-withdrawal'),
        note: note ? String(note).trim() : undefined,
      });

      await refreshPortfolioData(dispatch);
      await dispatch(fetchManualWithdrawals({ page: 1, limit: 5 }));
      return data?.data ?? data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to withdraw funds');
    }
  }
);

export const createPriceAlert = createAsyncThunk(
  'portfolio/createPriceAlert',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const requestPayload = {
        symbol: String(payload.symbol || '').trim().toUpperCase(),
        target_price: Number(payload.targetPrice ?? payload.target_price),
        direction: payload.direction,
      };

      const { data } = await api.post(API_ENDPOINTS.portfolio.alerts, requestPayload);
      await refreshAlertsData(dispatch);
      return {
        type: 'created',
        alert: data?.data ?? data,
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to create price alert');
    }
  }
);

export const deletePriceAlert = createAsyncThunk(
  'portfolio/deletePriceAlert',
  async (alertId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`${API_ENDPOINTS.portfolio.alerts}/${alertId}`);
      await refreshAlertsData(dispatch);
      return {
        type: 'deleted',
        id: alertId,
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to delete price alert');
    }
  }
);

const initialState = {
  dashboard: null,
  overview: null,
  analytics: null,
  performanceHistory: [],
  transactions: [],
  alerts: [],
  manualDeposits: [],
  manualDepositsMeta: {
    total: 0,
    page: 1,
    pages: 0,
    filters: {
      status: 'all',
      startDate: '',
      endDate: '',
      limit: 10,
    },
  },
  manualDepositDetail: null,
  manualWithdrawals: [],
  manualWithdrawalsMeta: {
    total: 0,
    page: 1,
    pages: 0,
    filters: {
      status: 'all',
      startDate: '',
      endDate: '',
      limit: 10,
    },
  },
  manualWithdrawalDetail: null,
  transactionsMeta: {
    total: 0,
    page: 1,
    pages: 0,
    filters: {},
  },
  dashboardLoading: false,
  overviewLoading: false,
  analyticsLoading: false,
  historyLoading: false,
  transactionsLoading: false,
  alertsLoading: false,
  manualDepositsLoading: false,
  manualDepositDetailLoading: false,
  manualWithdrawalsLoading: false,
  manualWithdrawalDetailLoading: false,
  actionLoading: false,
  alertActionLoading: false,
  lastAction: null,
  lastAlertAction: null,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearPortfolioError: (state) => {
      state.error = null;
    },
    clearPortfolioAction: (state) => {
      state.lastAction = null;
    },
    clearAlertAction: (state) => {
      state.lastAlertAction = null;
    },
    resetPortfolioState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolioDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchPortfolioDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPortfolioOverview.pending, (state) => {
        state.overviewLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchPortfolioOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPortfolioAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchPortfolioAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPerformanceHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.performanceHistory = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPerformanceHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload.transactions;
        state.transactionsMeta = {
          total: action.payload.total,
          page: action.payload.page,
          pages: action.payload.pages,
          filters: action.payload.filters,
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPriceAlerts.pending, (state) => {
        state.alertsLoading = true;
        state.error = null;
      })
      .addCase(fetchPriceAlerts.fulfilled, (state, action) => {
        state.alertsLoading = false;
        state.alerts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPriceAlerts.rejected, (state, action) => {
        state.alertsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchManualDeposits.pending, (state) => {
        state.manualDepositsLoading = true;
        state.error = null;
      })
      .addCase(fetchManualDeposits.fulfilled, (state, action) => {
        state.manualDepositsLoading = false;
        state.manualDeposits = action.payload.items;
        state.manualDepositsMeta = {
          total: action.payload.total,
          page: action.payload.page,
          pages: action.payload.pages,
          filters: action.payload.filters,
        };
      })
      .addCase(fetchManualDeposits.rejected, (state, action) => {
        state.manualDepositsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchManualDepositById.pending, (state) => {
        state.manualDepositDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchManualDepositById.fulfilled, (state, action) => {
        state.manualDepositDetailLoading = false;
        state.manualDepositDetail = action.payload;
      })
      .addCase(fetchManualDepositById.rejected, (state, action) => {
        state.manualDepositDetailLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchManualWithdrawals.pending, (state) => {
        state.manualWithdrawalsLoading = true;
        state.error = null;
      })
      .addCase(fetchManualWithdrawals.fulfilled, (state, action) => {
        state.manualWithdrawalsLoading = false;
        state.manualWithdrawals = action.payload.items;
        state.manualWithdrawalsMeta = {
          total: action.payload.total,
          page: action.payload.page,
          pages: action.payload.pages,
          filters: action.payload.filters,
        };
      })
      .addCase(fetchManualWithdrawals.rejected, (state, action) => {
        state.manualWithdrawalsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchManualWithdrawalById.pending, (state) => {
        state.manualWithdrawalDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchManualWithdrawalById.fulfilled, (state, action) => {
        state.manualWithdrawalDetailLoading = false;
        state.manualWithdrawalDetail = action.payload;
      })
      .addCase(fetchManualWithdrawalById.rejected, (state, action) => {
        state.manualWithdrawalDetailLoading = false;
        state.error = action.payload;
      })
      .addMatcher(
        isAnyOf(buyStock.pending, sellStock.pending, depositFunds.pending, withdrawFunds.pending),
        (state) => {
          state.actionLoading = true;
          state.error = null;
          state.lastAction = null;
        }
      )
      .addMatcher(
        isAnyOf(buyStock.fulfilled, sellStock.fulfilled, depositFunds.fulfilled, withdrawFunds.fulfilled),
        (state, action) => {
          state.actionLoading = false;
          state.lastAction = action.payload;
        }
      )
      .addMatcher(
        isAnyOf(buyStock.rejected, sellStock.rejected, depositFunds.rejected, withdrawFunds.rejected),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        isAnyOf(createPriceAlert.pending, deletePriceAlert.pending),
        (state) => {
          state.alertActionLoading = true;
          state.error = null;
          state.lastAlertAction = null;
        }
      )
      .addMatcher(
        isAnyOf(createPriceAlert.fulfilled, deletePriceAlert.fulfilled),
        (state, action) => {
          state.alertActionLoading = false;
          state.lastAlertAction = action.payload;
        }
      )
      .addMatcher(
        isAnyOf(createPriceAlert.rejected, deletePriceAlert.rejected),
        (state, action) => {
          state.alertActionLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const {
  clearPortfolioError,
  clearPortfolioAction,
  clearAlertAction,
  resetPortfolioState,
} = portfolioSlice.actions;
export default portfolioSlice.reducer;
