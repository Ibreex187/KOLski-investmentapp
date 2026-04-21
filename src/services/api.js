import axios from 'axios';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'kolski_token';
const REFRESH_COOKIE_NAME = 'kolski_refresh_token';
const isSecureCookieContext =
  import.meta.env.PROD ||
  (typeof window !== 'undefined' && window.location.protocol === 'https:');
const COOKIE_OPTIONS = {
  expires: 7,
  secure: isSecureCookieContext,
  sameSite: isSecureCookieContext ? 'Strict' : 'Lax',
};

const LOCAL_API_BASE_URL = 'http://localhost:4080/api/v1';
const DEPLOYED_API_BASE_URL = 'https://ko-lski-investment-backend.vercel.app/api/v1';
const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (isLocalHost ? LOCAL_API_BASE_URL : DEPLOYED_API_BASE_URL);
const API_TIMEOUT_MS = 15000;
const API_ENDPOINTS = {
  auth: {
    register: '/register',
    login: '/login',
    me: '/me',
    sendVerification: '/send-verification',
    verifyEmail: '/verify-email',
    forgotPassword: '/forgot-password',
    verifyForgotPasswordOtp: '/verify-forgot-password-otp',
    resetForgotPassword: '/reset-forgot-password',
    refreshToken: '/refresh-token',
    logout: '/logout',
    logoutAll: '/logout-all',
    sessions: '/sessions',
  },
  market: {
    quote: '/market/quote',
    search: '/market/search',
    history: '/market/history',
    portfolioPrices: '/market/portfolio-prices',
  },
  notifications: {
    list: '/notifications',
    readAll: '/notifications/read-all',
  },
  admin: {
    overview: '/admin/overview',
    securityStatus: '/admin/security-status',
    users: '/admin/users',
    alerts: '/admin/alerts',
    transactions: '/admin/transactions',
  },
  deposits: {
    manual: '/deposits/manual',
    list: '/deposits',
    byId: (id) => `/deposits/${id}`,
  },
  withdrawals: {
    manual: '/withdrawals/manual',
    list: '/withdrawals',
    byId: (id) => `/withdrawals/${id}`,
  },
  portfolio: {
    dashboard: '/portfolio/dashboard',
    overview: '/portfolio',
    analytics: '/portfolio/analytics',
    performanceHistory: '/portfolio/performance-history',
    buy: '/portfolio/buy',
    sell: '/portfolio/sell',
    withdraw: '/portfolio/withdraw',
    transactions: '/portfolio/transactions',
    transactionsExport: '/portfolio/transactions/export',
    watchlist: '/portfolio/watchlist',
    alerts: '/portfolio/alerts',
  },
};

const getApiErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

const persistAuthSession = ({ token, refreshToken } = {}) => {
  if (token) {
    Cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  }

  if (refreshToken) {
    Cookies.set(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
  }
};

const clearStoredAuthSession = () => {
  Cookies.remove(COOKIE_NAME);
  Cookies.remove(REFRESH_COOKIE_NAME);
};

const getStoredRefreshToken = () => Cookies.get(REFRESH_COOKIE_NAME) || null;

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get(COOKIE_NAME);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.skipAuthRedirect) {
      clearStoredAuthSession();
      redirectToLogin();
    }

    err.friendlyMessage = getApiErrorMessage(err);
    return Promise.reject(err);
  }
);

export {
  API_ENDPOINTS,
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_OPTIONS,
  getApiErrorMessage,
  persistAuthSession,
  clearStoredAuthSession,
  getStoredRefreshToken,
};
export default api;