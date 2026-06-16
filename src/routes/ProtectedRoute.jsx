import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from './routeUtils';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function RoleRoute({ allowed = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowed.length && !allowed.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }
  return <Outlet />;
}
