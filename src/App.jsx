import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import AdminRoute from './components/common/AdminRoute';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import PageSkeleton from './components/common/PageSkeleton';
import { fetchCurrentUser } from './features/authSlice';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PortfolioAnalytics = lazy(() => import('./pages/PortfolioAnalytics'));
const Trade = lazy(() => import('./pages/Trade'));
const ManualDeposits = lazy(() => import('./pages/ManualDeposits'));
const ManualWithdrawals = lazy(() => import('./pages/ManualWithdrawals'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const StockSearch = lazy(() => import('./pages/StockSearch'));
const StockDetails = lazy(() => import('./pages/StockDetails'));
const HistoricalChart = lazy(() => import('./pages/HistoricalChart'));
const History = lazy(() => import('./pages/History'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminOverview = lazy(() => import('./pages/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminAlerts = lazy(() => import('./pages/AdminAlerts'));
const AdminTransactions = lazy(() => import('./pages/AdminTransactions'));
const SecurityStatus = lazy(() => import('./pages/SecurityStatus'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Account = lazy(() => import('./pages/Account'));
const Sessions = lazy(() => import('./pages/Sessions'));

function App() {
  const dispatch = useDispatch();
  const { token, refreshToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if ((token || refreshToken) && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, refreshToken, user]);
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Suspense fallback={<PageSkeleton variant="simple" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="portfolio/analytics" element={<PortfolioAnalytics />} />
              <Route path="trade" element={<Trade />} />
              <Route path="deposits" element={<ManualDeposits />} />
              <Route path="withdrawals" element={<ManualWithdrawals />} />
              <Route path="market" element={<Watchlist />} />
              <Route path="market/search" element={<StockSearch />} />
              <Route path="market/:symbol" element={<StockDetails />} />
              <Route path="market/:symbol/history" element={<HistoricalChart />} />
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="history" element={<History />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="notifications" element={<Notifications />} />
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<AdminOverview />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/alerts" element={<AdminAlerts />} />
                <Route path="admin/transactions" element={<AdminTransactions />} />
                <Route path="admin/security" element={<SecurityStatus />} />
                <Route path="admin/docs" element={<ApiDocs />} />
              </Route>
              <Route path="account" element={<Account />} />
              <Route path="sessions" element={<Sessions />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;