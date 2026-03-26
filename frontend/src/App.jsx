import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { PartnerLandingPage } from './pages/partner/PartnerLandingPage';
import { PartnerRegisterPage } from './pages/partner/PartnerRegisterPage';

import { RestaurantMenuPage } from './pages/user/RestaurantMenuPage';
import { CartPage } from './pages/user/CartPage';
import { CheckoutPage } from './pages/user/CheckoutPage';
import { OrdersPage } from './pages/user/OrdersPage';
import { OrderTrackingPage } from './pages/user/OrderTrackingPage';

import { RestaurantDashboardPage } from './pages/restaurant/RestaurantDashboardPage';
import { RestaurantMenuManagementPage } from './pages/restaurant/RestaurantMenuManagementPage';
import { RestaurantProfilePage } from './pages/restaurant/RestaurantProfilePage';
import { RestaurantLocationPage } from './pages/restaurant/RestaurantLocationPage';
import { RiderDashboardPage } from './pages/rider/RiderDashboardPage';
import { RiderProfilePage } from './pages/rider/RiderProfilePage';
import { RiderLocationPage } from './pages/rider/RiderLocationPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

const roleDashboardPath = {
  user: '/orders',
  restaurant: '/restaurant/dashboard',
  rider: '/rider/dashboard',
  admin: '/admin/dashboard',
};

const RoleRedirectRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && ['restaurant', 'rider', 'admin'].includes(user?.role)) {
    return <Navigate to={roleDashboardPath[user?.role] || '/'} replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={roleDashboardPath[user?.role] || '/'} replace />;
  }

  return children;
};

const DashboardEntryRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleDashboardPath[user?.role] || '/'} replace />;
};

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <RoleRedirectRoute>
              <HomePage />
            </RoleRedirectRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/partner"
          element={
            <RoleRedirectRoute>
              <PartnerLandingPage />
            </RoleRedirectRoute>
          }
        />
        <Route
          path="/partner/register/:role"
          element={
            <RoleRedirectRoute>
              <PartnerRegisterPage />
            </RoleRedirectRoute>
          }
        />

        <Route
          path="/restaurants/:restaurantId"
          element={
            <RoleRedirectRoute>
              <RestaurantMenuPage />
            </RoleRedirectRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={['user']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute roles={['user']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={['user']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId/tracking"
          element={
            <ProtectedRoute roles={['user', 'admin']}>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute roles={['restaurant', 'admin']}>
              <RestaurantDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/profile"
          element={
            <ProtectedRoute roles={['restaurant', 'admin']}>
              <RestaurantProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/menu"
          element={
            <ProtectedRoute roles={['restaurant', 'admin']}>
              <RestaurantMenuManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/location"
          element={
            <ProtectedRoute roles={['restaurant', 'admin']}>
              <RestaurantLocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider/dashboard"
          element={
            <ProtectedRoute roles={['rider', 'admin']}>
              <RiderDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider/profile"
          element={
            <ProtectedRoute roles={['rider', 'admin']}>
              <RiderProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider/location"
          element={
            <ProtectedRoute roles={['rider', 'admin']}>
              <RiderLocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<DashboardEntryRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
