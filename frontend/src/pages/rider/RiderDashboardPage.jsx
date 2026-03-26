import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RoleTabs } from '../../components/common/RoleTabs';
import { StatusBadge } from '../../components/common/StatusBadge';

const riderNavItems = [
  { to: '/rider/dashboard', label: 'Dashboard' },
  { to: '/rider/profile', label: 'Profile' },
  { to: '/rider/location', label: 'Location' },
];

export const RiderDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const ordersRes = await apiClient.get('/orders');
      setOrders(ordersRes.data.data);

      try {
        const profileRes = await apiClient.get('/riders/profile/me');
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

  const pickedUpCount = useMemo(
    () => orders.filter((order) => order.status === 'picked_up').length,
    [orders]
  );

  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === 'delivered').length,
    [orders]
  );

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status });
      await loadDashboard();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Rider Dashboard</h1>
          <p className="text-sm text-ink-500">Track deliveries and update order status quickly.</p>
        </div>
        <Button variant="outline" onClick={loadDashboard}>
          Refresh
        </Button>
      </div>

      <RoleTabs items={riderNavItems} />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading && <p className="text-sm text-ink-500">Loading dashboard...</p>}

      {!profile ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink-900">Create rider profile first</h2>
          <p className="text-sm text-ink-500">
            Complete your rider profile to receive delivery assignments.
          </p>
          <Button as={Link} to="/rider/profile" className="w-fit">
            Create Profile
          </Button>
        </Card>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Approval</p>
              <div className="mt-2">
                <StatusBadge status={profile.approvalStatus} />
              </div>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Availability</p>
              <p className="mt-2 text-lg font-bold text-ink-900">
                {profile.isAvailable ? 'Available' : 'Unavailable'}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Picked Up</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{pickedUpCount}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Delivered</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{deliveredCount}</p>
            </Card>
          </section>

          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink-900">Assigned Deliveries</h2>
              <Button as={Link} to="/rider/location" variant="ghost">
                Update Live Location
              </Button>
            </div>

            {!orders.length && <p className="text-sm text-ink-500">No deliveries assigned yet.</p>}

            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-pink-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-ink-900">Order #{order.id}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-ink-500">Delivery: {order.deliveryAddress}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.status === 'preparing' && (
                    <Button onClick={() => updateOrderStatus(order.id, 'picked_up')}>Pick Up</Button>
                  )}
                  {order.status === 'picked_up' && (
                    <Button onClick={() => updateOrderStatus(order.id, 'delivered')}>Mark Delivered</Button>
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
