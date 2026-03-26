import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LocationPickerMap } from '../../components/common/LocationPickerMap';
import { RoleTabs } from '../../components/common/RoleTabs';
import { useToast } from '../../hooks/useToast';

const restaurantNavItems = [
  { to: '/restaurant/dashboard', label: 'Dashboard' },
  { to: '/restaurant/menu', label: 'Menu' },
  { to: '/restaurant/profile', label: 'Profile' },
  { to: '/restaurant/location', label: 'Location' },
];

const parseCoordinate = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const RestaurantLocationPage = () => {
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ address: '', latitude: '', longitude: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const setCoordinates = (latitude, longitude) => {
    setForm((prev) => ({
      ...prev,
      latitude: Number(latitude).toFixed(6),
      longitude: Number(longitude).toFixed(6),
    }));
  };

  const useBrowserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Unable to fetch current location from browser.');
      }
    );
  };

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.get('/restaurants/profile/me');
      setProfile(data.data);
      setForm({
        address: data.data.address || '',
        latitude: data.data.latitude ?? '',
        longitude: data.data.longitude ?? '',
      });
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiClient.patch('/restaurants/profile/me', {
        address: form.address,
        latitude: parseCoordinate(form.latitude),
        longitude: parseCoordinate(form.longitude),
      });

      toast?.addToast({
        variant: 'success',
        title: 'Location updated',
        description: 'Restaurant map location has been updated.',
      });

      await loadProfile();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Restaurant Location</h1>
        <p className="text-sm text-ink-500">Manage map pin and coordinates in a dedicated location page.</p>
      </div>

      <RoleTabs items={restaurantNavItems} />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading && <p className="text-sm text-ink-500">Loading location...</p>}

      {!loading && !profile ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink-900">Create profile first</h2>
          <p className="text-sm text-ink-500">You need a restaurant profile before setting map location.</p>
          <Button as={Link} to="/restaurant/profile" className="w-fit">
            Go to Profile Setup
          </Button>
        </Card>
      ) : (
        <Card className="space-y-4">
          <form className="space-y-3" onSubmit={onSave}>
            <LocationPickerMap
              latitude={parseCoordinate(form.latitude)}
              longitude={parseCoordinate(form.longitude)}
              onChange={setCoordinates}
              heightClass="h-64 sm:h-72"
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="input md:col-span-2"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                required
              />
              <input
                className="input"
                type="number"
                step="0.000001"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
              />
              <input
                className="input"
                type="number"
                step="0.000001"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={useBrowserLocation}>
                Use Current Browser Location
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Location'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
