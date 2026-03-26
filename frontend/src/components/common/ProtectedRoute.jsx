import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const roleDashboardPath = {
  user: '/orders',
  restaurant: '/restaurant/dashboard',
  rider: '/rider/dashboard',
  admin: '/admin/dashboard',
};

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to={roleDashboardPath[user?.role] || '/'} replace />;
  }

  return children;
};
