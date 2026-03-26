import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Chip } from '../../components/common/Chip';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionHeader } from '../../components/common/SectionHeader';
import { SkeletonLine } from '../../components/common/Skeleton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/currency';

const riderPlaceholderImage = 'https://picsum.photos/seed/rider-avatar-orders/160/160';

const statuses = ['all', 'pending', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled'];

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.get('/orders');
      setOrders(data.data || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const payOrder = async (orderId) => {
    try {
      await apiClient.post('/payments/mock', { orderId, provider: 'stripe_mock' });
      toast?.addToast({ variant: 'success', title: 'Payment successful', description: `Order #${orderId} marked paid.` });
      await loadOrders();
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast?.addToast({ variant: 'error', title: 'Payment failed', description: message });
    }
  };

  return (
    <div className="page-container space-y-5">
      <SectionHeader
        title="Your Orders"
        subtitle="Track active deliveries and revisit your order history."
        action={
          <Button variant="outline" onClick={loadOrders}>
            Refresh
          </Button>
        }
      />

      <div className="panel-soft flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Chip
            key={status}
            active={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          >
            {status.replace('_', ' ')}
          </Chip>
        ))}
      </div>

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading && (
        <Card className="space-y-3">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="h-4 w-1/2" />
        </Card>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <EmptyState
          title="No orders in this state"
          description="Try another status filter or place your next order from the home page."
        />
      )}

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-ink-900">Order #{order.id}</h3>
                <p className="text-sm text-ink-500">{order.restaurant?.name || 'Restaurant'}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="grid gap-2 text-sm text-ink-600 sm:grid-cols-3">
              <p>Total: <span className="font-bold text-ink-900">{formatCurrency(order.total)}</span></p>
              <p>Payment: <span className="font-bold text-ink-900">{order.paymentStatus}</span></p>
              <p>Items: <span className="font-bold text-ink-900">{order.items?.length || 0}</span></p>
            </div>

            {order.rider && (
              <div className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-rose-50/40 p-3">
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

            <div className="flex flex-wrap gap-2">
              <Button as={Link} to={`/orders/${order.id}/tracking`} variant="outline">
                Track Order
              </Button>
              {order.paymentStatus !== 'paid' && (
                <Button onClick={() => payOrder(order.id)}>Pay Now (Mock)</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
