import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RoleTabs } from '../../components/common/RoleTabs';
import { StatusBadge } from '../../components/common/StatusBadge';

const restaurantNavItems = [
  { to: '/restaurant/dashboard', label: 'Dashboard' },
  { to: '/restaurant/menu', label: 'Menu' },
  { to: '/restaurant/profile', label: 'Profile' },
  { to: '/restaurant/location', label: 'Location' },
];
const riderPlaceholderImage = 'https://picsum.photos/seed/rider-avatar-restaurant/160/160';

export const RestaurantDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersRes, ridersRes] = await Promise.all([
        apiClient.get('/orders'),
        apiClient.get('/orders/available-riders'),
      ]);

      setOrders(ordersRes.data.data);
      setAvailableRiders(ridersRes.data.data);

      try {
        const profileRes = await apiClient.get('/restaurants/profile/me');
        setProfile(profileRes.data.data);
      } catch {
        setProfile(null);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingOrders = useMemo(
    () => orders.filter((order) => ['pending', 'confirmed', 'preparing'].includes(order.status)).length,
    [orders]
  );

  const activeDeliveries = useMemo(
    () => orders.filter((order) => ['picked_up'].includes(order.status)).length,
    [orders]
  );

  const menuItemsCount = profile?.menuItems?.length || 0;

  const updateOrderStatus = async (orderId, status) => {
    setError('');

    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status });
      await loadDashboard();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const assignRider = async (orderId, riderId) => {
    setError('');

    try {
      await apiClient.patch(`/orders/${orderId}/assign-rider`, { riderId: Number(riderId) });
      await loadDashboard();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Restaurant Dashboard</h1>
          <p className="text-sm text-ink-500">Daily operations overview for orders and fulfillment.</p>
        </div>
        <Button variant="outline" onClick={loadDashboard}>
          Refresh
        </Button>
      </div>

      <RoleTabs items={restaurantNavItems} />

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-ink-500">Loading dashboard...</p>}

      {!profile ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink-900">Complete your restaurant profile first</h2>
          <p className="text-sm text-ink-500">
            You need a restaurant profile before you can receive and process orders.
          </p>
          <Button as={Link} to="/restaurant/profile" className="w-fit">
            Create Profile
          </Button>
        </Card>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Approval</p>
              <div className="mt-2">
                <StatusBadge status={profile.approvalStatus} />
              </div>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Total Orders</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{orders.length}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Pending Kitchen</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{pendingOrders}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Out for Delivery</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{activeDeliveries}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Menu Items</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{menuItemsCount}</p>
            </Card>
          </section>

          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink-900">Incoming Orders</h2>
              <div className="flex flex-wrap gap-2">
                <Button as={Link} to="/restaurant/menu" variant="outline">
                  Manage Menu
                </Button>
                <Button as={Link} to="/restaurant/location" variant="ghost">
                  Update Location
                </Button>
              </div>
            </div>

            {!orders.length && <p className="text-sm text-ink-500">No orders yet.</p>}

            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-pink-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink-900">Order #{order.id}</p>
                    <p className="text-xs text-ink-500">Customer: {order.customer?.fullName || 'N/A'}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {order.rider && (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-pink-100 bg-rose-50/40 p-3">
                    <img
                      src={order.rider.profileImageUrl || riderPlaceholderImage}
                      alt={order.rider.user?.fullName || `Rider ${order.rider.id}`}
                      className="h-12 w-12 rounded-full border border-pink-100 object-cover bg-white"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-500">Assigned Rider</p>
                      <p className="text-sm font-semibold text-ink-900">
                        {order.rider.user?.fullName || `Rider #${order.rider.id}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <Button onClick={() => updateOrderStatus(order.id, 'confirmed')}>Confirm</Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button onClick={() => updateOrderStatus(order.id, 'preparing')}>Mark Preparing</Button>
                  )}
                  {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                    <Button variant="outline" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                      Cancel
                    </Button>
                  )}

                  {!order.riderId && (
                    <select
                      className="input max-w-52"
                      defaultValue=""
                      onChange={(event) => {
                        if (event.target.value) {
                          assignRider(order.id, event.target.value);
                        }
                      }}
                    >
                      <option value="">Assign rider</option>
                      {availableRiders.map((rider) => (
                        <option key={rider.id} value={rider.id}>
                          {rider.user?.fullName || `Rider #${rider.id}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
};
