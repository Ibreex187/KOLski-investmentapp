import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS, getApiErrorMessage } from '../services/api';

export const fetchAdminOverview = createAsyncThunk(
  'admin/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.admin.overview);
      return data?.data ?? null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load admin overview');
    }
  }
);

export const fetchSecurityStatus = createAsyncThunk(
  'admin/fetchSecurityStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.admin.securityStatus);
      return data?.data ?? null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load security status');
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.admin.users);
      return data?.data ?? { items: [], total: 0, admins: 0, verified: 0 };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load admin users');
    }
  }
);

export const fetchAdminAlerts = createAsyncThunk(
  'admin/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.admin.alerts);
      return data?.data ?? { items: [], total: 0, active: 0, triggered: 0, disabled: 0 };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load admin alerts');
    }
  }
);

export const fetchAdminTransactions = createAsyncThunk(
  'admin/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.admin.transactions);
      return data?.data ?? { items: [], total: 0, completed: 0, pending: 0, failed: 0 };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load admin transactions');
    }
  }
);

const emptyUsers = { items: [], total: 0, admins: 0, verified: 0 };
const emptyAlerts = { items: [], total: 0, active: 0, triggered: 0, disabled: 0 };
const emptyTransactions = { items: [], total: 0, completed: 0, pending: 0, failed: 0 };

const initialState = {
  overview: null,
  securityStatus: null,
  users: emptyUsers,
  alerts: emptyAlerts,
  transactions: emptyTransactions,
  overviewLoading: false,
  securityLoading: false,
  usersLoading: false,
  alertsLoading: false,
  transactionsLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOverview.pending, (state) => {
        state.overviewLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchAdminOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSecurityStatus.pending, (state) => {
        state.securityLoading = true;
        state.error = null;
      })
      .addCase(fetchSecurityStatus.fulfilled, (state, action) => {
        state.securityLoading = false;
        state.securityStatus = action.payload;
      })
      .addCase(fetchSecurityStatus.rejected, (state, action) => {
        state.securityLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload || emptyUsers;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminAlerts.pending, (state) => {
        state.alertsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminAlerts.fulfilled, (state, action) => {
        state.alertsLoading = false;
        state.alerts = action.payload || emptyAlerts;
      })
      .addCase(fetchAdminAlerts.rejected, (state, action) => {
        state.alertsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload || emptyTransactions;
      })
      .addCase(fetchAdminTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
