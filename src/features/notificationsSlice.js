import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS, getApiErrorMessage } from '../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.notifications.list);
      return Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`${API_ENDPOINTS.notifications.list}/${notificationId}/read`);
      return data?.data ?? { _id: notificationId, read: true };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(API_ENDPOINTS.notifications.readAll);
      return data?.data ?? { modifiedCount: 0 };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to mark all notifications as read');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  actionLoading: false,
  error: null,
  lastAction: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
    clearNotificationAction: (state) => {
      state.lastAction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.lastAction = null;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.map((item) =>
          item._id === action.payload._id
            ? { ...item, ...action.payload, read: true, readAt: action.payload.readAt || new Date().toISOString() }
            : item
        );
        state.lastAction = { type: 'single-read', message: 'Notification marked as read.' };
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.lastAction = null;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.actionLoading = false;
        state.items = state.items.map((item) => ({
          ...item,
          read: true,
          readAt: item.readAt || new Date().toISOString(),
        }));
        state.lastAction = { type: 'all-read', message: 'All notifications marked as read.' };
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotificationsError, clearNotificationAction } = notificationsSlice.actions;
export default notificationsSlice.reducer;
