import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import PageSkeleton from './PageSkeleton';

function ProtectedRoute({ children }) {
  const { token, refreshToken, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (!token && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;