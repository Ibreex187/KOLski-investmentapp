import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import PageSkeleton from './PageSkeleton';

export default function AdminRoute({ children }) {
  const { user, token, refreshToken, loading } = useSelector((state) => state.auth);

  if (loading || ((token || refreshToken) && !user)) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
