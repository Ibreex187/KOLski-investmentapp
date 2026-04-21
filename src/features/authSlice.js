import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import api, {
  API_ENDPOINTS,
  COOKIE_NAME,
  getApiErrorMessage,
  persistAuthSession,
  clearStoredAuthSession,
  getStoredRefreshToken,
} from '../services/api';

const normalizeSessionPayload = (payload) => {
  const sessionData = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

  return {
    token: sessionData?.token ?? payload?.token ?? null,
    refreshToken: sessionData?.refreshToken ?? payload?.refreshToken ?? null,
    user: sessionData?.user ?? payload?.user ?? null,
    message: payload?.message ?? sessionData?.message ?? '',
  };
};

const refreshSessionTokens = async () => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  const { data } = await api.post(
    API_ENDPOINTS.auth.refreshToken,
    { refreshToken },
    { skipAuthRedirect: true }
  );

  const session = normalizeSessionPayload(data);
  persistAuthSession(session);
  return session;
};

const withRefreshRetry = async (requestFn) => {
  try {
    return await requestFn();
  } catch (err) {
    if (err.response?.status === 401 && getStoredRefreshToken()) {
      await refreshSessionTokens();
      return requestFn();
    }

    throw err;
  }
};

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await withRefreshRetry(() =>
        api.get(API_ENDPOINTS.auth.me, { skipAuthRedirect: true })
      );
      return data?.data ?? data?.user ?? null;
    } catch (err) {
      if (err.response?.status === 401) {
        clearStoredAuthSession();
      }

      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load current user');
    }
  }
);

export const sendVerificationEmailRequest = createAsyncThunk(
  'auth/sendVerificationEmailRequest',
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        API_ENDPOINTS.auth.sendVerification,
        { email },
        { skipAuthRedirect: true }
      );
      return { ...data, email };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to send verification email');
    }
  }
);

export const verifyEmailToken = createAsyncThunk(
  'auth/verifyEmailToken',
  async ({ token }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        API_ENDPOINTS.auth.verifyEmail,
        { token },
        { skipAuthRedirect: true }
      );

      const session = normalizeSessionPayload(data);
      persistAuthSession(session);

      return {
        ...session,
        message: data?.message ?? 'Email verified successfully',
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to verify email');
    }
  }
);

export const fetchActiveSessions = createAsyncThunk(
  'auth/fetchActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await withRefreshRetry(() =>
        api.get(API_ENDPOINTS.auth.sessions, { skipAuthRedirect: true })
      );

      return data?.data ?? [];
    } catch (err) {
      if (err.response?.status === 401) {
        clearStoredAuthSession();
      }

      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load active sessions');
    }
  }
);

export const revokeSessionById = createAsyncThunk(
  'auth/revokeSessionById',
  async (sessionId, { rejectWithValue }) => {
    try {
      const { data } = await withRefreshRetry(() =>
        api.delete(`${API_ENDPOINTS.auth.sessions}/${sessionId}`, { skipAuthRedirect: true })
      );

      return {
        sessionId,
        message: data?.message ?? 'Session revoked successfully',
      };
    } catch (err) {
      if (err.response?.status === 401) {
        clearStoredAuthSession();
      }

      return rejectWithValue(getApiErrorMessage(err) || 'Failed to revoke session');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  const refreshToken = getStoredRefreshToken();

  try {
    if (refreshToken) {
      const { data } = await api.post(
        API_ENDPOINTS.auth.logout,
        { refreshToken },
        { skipAuthRedirect: true }
      );

      return { message: data?.message ?? 'Logged out successfully' };
    }

    return { message: 'Logged out successfully' };
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err) || 'Failed to log out');
  } finally {
    clearStoredAuthSession();
  }
});

export const logoutAllSessions = createAsyncThunk(
  'auth/logoutAllSessions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await withRefreshRetry(() =>
        api.post(API_ENDPOINTS.auth.logoutAll, {}, { skipAuthRedirect: true })
      );

      clearStoredAuthSession();
      return { message: data?.message ?? 'All sessions logged out successfully' };
    } catch (err) {
      if (err.response?.status === 401) {
        clearStoredAuthSession();
      }

      return rejectWithValue(getApiErrorMessage(err) || 'Failed to log out all sessions');
    }
  }
);

export const requestPasswordResetOtp = createAsyncThunk(
  'auth/requestPasswordResetOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        API_ENDPOINTS.auth.forgotPassword,
        { email },
        { skipAuthRedirect: true }
      );
      return { ...data, email };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to send reset code');
    }
  }
);

export const verifyPasswordResetOtp = createAsyncThunk(
  'auth/verifyPasswordResetOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        API_ENDPOINTS.auth.verifyForgotPasswordOtp,
        {
          email,
          otp,
        },
        { skipAuthRedirect: true }
      );

      return {
        ...data,
        email,
        resetToken: data?.data?.resetToken ?? null,
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to verify reset code');
    }
  }
);

export const resetForgotPassword = createAsyncThunk(
  'auth/resetForgotPassword',
  async ({ resetToken, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        API_ENDPOINTS.auth.resetForgotPassword,
        {
          resetToken,
          newPassword,
          confirmPassword,
        },
        { skipAuthRedirect: true }
      );
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to reset password');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.auth.register, userData, {
        skipAuthRedirect: true,
      });
      const session = normalizeSessionPayload(data);
      persistAuthSession(session);
      return {
        ...data,
        ...session,
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.auth.login, credentials, {
        skipAuthRedirect: true,
      });
      const session = normalizeSessionPayload(data);
      persistAuthSession(session);
      return {
        ...data,
        ...session,
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Login failed');
    }
  }
);

const initialPasswordResetState = {
  email: '',
  resetToken: null,
  isVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: Cookies.get(COOKIE_NAME) || null,
    refreshToken: getStoredRefreshToken(),
    loading: false,
    sessionsLoading: false,
    sessionActionLoading: false,
    sessions: [],
    error: null,
    passwordReset: initialPasswordResetState,
  },
  reducers: {
    logout: (state) => {
      clearStoredAuthSession();
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.sessions = [];
      state.passwordReset = initialPasswordResetState;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordResetState: (state) => {
      state.passwordReset = initialPasswordResetState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = Cookies.get(COOKIE_NAME) || state.token;
        state.refreshToken = getStoredRefreshToken() || state.refreshToken;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = Cookies.get(COOKIE_NAME) || null;
        state.refreshToken = getStoredRefreshToken();
      })
      .addCase(sendVerificationEmailRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendVerificationEmailRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendVerificationEmailRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyEmailToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? state.user;
        state.token = action.payload.token ?? state.token;
        state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      })
      .addCase(verifyEmailToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActiveSessions.pending, (state) => {
        state.sessionsLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        state.sessions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchActiveSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.error = action.payload;
      })
      .addCase(revokeSessionById.pending, (state) => {
        state.sessionActionLoading = true;
        state.error = null;
      })
      .addCase(revokeSessionById.fulfilled, (state, action) => {
        state.sessionActionLoading = false;
        state.sessions = state.sessions.filter((session) => session.id !== action.payload.sessionId);
      })
      .addCase(revokeSessionById.rejected, (state, action) => {
        state.sessionActionLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.sessions = [];
        state.passwordReset = initialPasswordResetState;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.sessions = [];
        state.passwordReset = initialPasswordResetState;
        state.error = action.payload;
      })
      .addCase(logoutAllSessions.pending, (state) => {
        state.sessionActionLoading = true;
        state.error = null;
      })
      .addCase(logoutAllSessions.fulfilled, (state) => {
        state.sessionActionLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.sessions = [];
      })
      .addCase(logoutAllSessions.rejected, (state, action) => {
        state.sessionActionLoading = false;
        state.error = action.payload;
      })
      .addCase(requestPasswordResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordResetOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordReset.email = action.payload.email;
        state.passwordReset.resetToken = null;
        state.passwordReset.isVerified = false;
      })
      .addCase(requestPasswordResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyPasswordResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasswordResetOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordReset.email = action.payload.email;
        state.passwordReset.resetToken = action.payload.resetToken;
        state.passwordReset.isVerified = Boolean(action.payload.resetToken);
      })
      .addCase(verifyPasswordResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetForgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetForgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordReset = initialPasswordResetState;
      })
      .addCase(resetForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, clearPasswordResetState } = authSlice.actions;
export default authSlice.reducer;