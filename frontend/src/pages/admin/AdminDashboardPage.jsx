import { useEffect, useState } from 'react';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [pendingRiders, setPendingRiders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [metricsRes, usersRes, restaurantsRes, ridersRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/restaurants/pending'),
        apiClient.get('/admin/riders/pending'),
      ]);

      setMetrics(metricsRes.data.data);
      setUsers(usersRes.data.data);
      setPendingRestaurants(restaurantsRes.data.data);
      setPendingRiders(ridersRes.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateRestaurantApproval = async (restaurantId, status) => {
    try {
      await apiClient.patch(`/admin/restaurants/${restaurantId}/approval`, { status });
      await loadDashboard();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const updateRiderApproval = async (riderId, status) => {
    try {
      await apiClient.patch(`/admin/riders/${riderId}/approval`, { status });
      await loadDashboard();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <button className="btn-outline" onClick={loadDashboard}>
          Refresh
        </button>
      </div>

      {error && <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {loading && <p className="text-sm text-slate-600">Loading dashboard...</p>}

      {metrics && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Users</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.users}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Restaurants</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.restaurants}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Riders</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.riders}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Orders</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.orders}</p>
          </Card>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Pending Restaurants</h2>
          {!pendingRestaurants.length && <p className="text-sm text-slate-600">No pending restaurants.</p>}
          {pendingRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{restaurant.name}</p>
                <StatusBadge status={restaurant.approvalStatus} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{restaurant.address}</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" onClick={() => updateRestaurantApproval(restaurant.id, 'approved')}>
                  Approve
                </button>
                <button className="btn-outline" onClick={() => updateRestaurantApproval(restaurant.id, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Pending Riders</h2>
          {!pendingRiders.length && <p className="text-sm text-slate-600">No pending riders.</p>}
          {pendingRiders.map((rider) => (
            <div key={rider.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">Rider #{rider.id}</p>
                <StatusBadge status={rider.approvalStatus} />
              </div>
              <p className="mt-1 text-sm text-slate-600">Vehicle: {rider.vehicleType}</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" onClick={() => updateRiderApproval(rider.id, 'approved')}>
                  Approve
                </button>
                <button className="btn-outline" onClick={() => updateRiderApproval(rider.id, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">User Accounts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">ID</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2">{user.id}</td>
                  <td className="px-3 py-2">{user.fullName}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={user.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
