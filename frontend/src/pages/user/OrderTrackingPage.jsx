import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Link, useParams } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { LocationPickerMap } from '../../components/common/LocationPickerMap';
import { StatusBadge } from '../../components/common/StatusBadge';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const statusSequence = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered'];
const riderPlaceholderImage = 'https://picsum.photos/seed/rider-avatar-tracking/200/200';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();

  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracking = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await apiClient.get(`/orders/${orderId}/tracking`);
        setTracking(data.data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, [orderId]);

  useEffect(() => {
    const socket = io(socketUrl);
    socket.emit('join-order-room', orderId);

    socket.on('order-updated', (payload) => {
      if (String(payload.id) === String(orderId)) {
        setTracking((prev) => ({
          ...(prev || {}),
          id: payload.id,
          status: payload.status,
          rider: payload.rider,
          statusHistory: payload.statusHistory || prev?.statusHistory || [],
          updatedAt: payload.updatedAt,
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const progressIndex = useMemo(() => {
    if (!tracking?.status) return 0;
    const index = statusSequence.indexOf(tracking.status);
    if (index === -1) {
      return tracking.status === 'cancelled' ? 0 : 0;
    }
    return index;
  }, [tracking?.status]);

  if (loading) {
    return (
      <div className="page-container">
        <Loading text="Preparing live tracking..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Card className="space-y-3">
          <p className="text-sm text-rose-600">{error}</p>
          <Button as={Link} to="/orders" variant="outline">
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container space-y-5">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Track Order #{orderId}</h1>
            <p className="text-sm text-ink-500">
              Last update: {tracking?.updatedAt ? new Date(tracking.updatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <StatusBadge status={tracking?.status} />
        </div>

        {tracking?.status !== 'cancelled' ? (
          <div className="space-y-3">
            <div className="h-2 overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full brand-gradient transition-all duration-500"
                style={{ width: `${((progressIndex + 1) / statusSequence.length) * 100}%` }}
              />
            </div>
            <div className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:grid-cols-5">
              {statusSequence.map((status, index) => (
                <span
                  key={status}
                  className={index <= progressIndex ? 'text-brand-700' : 'text-ink-400'}
                >
                  {status.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            This order was cancelled.
          </div>
        )}
      </Card>

      {tracking?.rider && (
        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-ink-900">Rider Information</h2>

          <div className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-rose-50/40 p-3">
            <img
              src={tracking.rider.profileImageUrl || riderPlaceholderImage}
              alt={tracking.rider.user?.fullName || `Rider ${tracking.rider.id}`}
              className="h-14 w-14 rounded-full border border-pink-100 object-cover bg-white"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink-900">
                {tracking.rider.user?.fullName || `Rider #${tracking.rider.id}`}
              </p>
              <p className="text-xs text-ink-600">
                Phone: {tracking.rider.user?.phone || 'Not shared'}
              </p>
            </div>
          </div>

          {tracking.rider.currentLatitude && tracking.rider.currentLongitude && (
            <LocationPickerMap
              latitude={Number(tracking.rider.currentLatitude)}
              longitude={Number(tracking.rider.currentLongitude)}
              readOnly
              heightClass="h-52 sm:h-60"
            />
          )}
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="text-xl font-bold text-ink-900">Timeline</h2>
        <div className="space-y-2">
          {(tracking?.statusHistory || []).map((event) => (
            <div key={event.id} className="rounded-2xl border border-pink-100 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={event.status} />
                <span className="text-xs text-ink-500">
                  {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              {event.note && <p className="mt-2 text-sm text-ink-600">{event.note}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
