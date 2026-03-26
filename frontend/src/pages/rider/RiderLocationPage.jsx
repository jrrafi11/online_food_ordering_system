import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LocationPickerMap } from '../../components/common/LocationPickerMap';
import { RoleTabs } from '../../components/common/RoleTabs';
import { useToast } from '../../hooks/useToast';

const riderNavItems = [
  { to: '/rider/dashboard', label: 'Dashboard' },
  { to: '/rider/profile', label: 'Profile' },
  { to: '/rider/location', label: 'Location' },
];

const parseCoordinate = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const RiderLocationPage = () => {
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [location, setLocation] = useState({ currentLatitude: '', currentLongitude: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const setCoordinates = (latitude, longitude) => {
    setLocation({
      currentLatitude: Number(latitude).toFixed(6),
      currentLongitude: Number(longitude).toFixed(6),
    });
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
      const { data } = await apiClient.get('/riders/profile/me');
      setProfile(data.data);
      setLocation({
        currentLatitude: data.data.currentLatitude || '',
        currentLongitude: data.data.currentLongitude || '',
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
      await apiClient.patch('/riders/location', {
        currentLatitude: parseCoordinate(location.currentLatitude),
        currentLongitude: parseCoordinate(location.currentLongitude),
      });

      toast?.addToast({
        variant: 'success',
        title: 'Location updated',
        description: 'Rider location has been updated.',
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
        <h1 className="text-2xl font-bold text-ink-900">Rider Location</h1>
        <p className="text-sm text-ink-500">Manage live map position in a dedicated location screen.</p>
      </div>

      <RoleTabs items={riderNavItems} />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading && <p className="text-sm text-ink-500">Loading location...</p>}

      {!loading && !profile ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink-900">Create profile first</h2>
          <p className="text-sm text-ink-500">You need a rider profile before setting live location.</p>
          <Button as={Link} to="/rider/profile" className="w-fit">
            Go to Profile Setup
          </Button>
        </Card>
      ) : (
        <Card className="space-y-4">
          <form className="space-y-3" onSubmit={onSave}>
            <LocationPickerMap
              latitude={parseCoordinate(location.currentLatitude)}
              longitude={parseCoordinate(location.currentLongitude)}
              onChange={setCoordinates}
              heightClass="h-64 sm:h-72"
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="input"
                type="number"
                step="0.000001"
                placeholder="Latitude"
                value={location.currentLatitude}
                onChange={(e) => setLocation((prev) => ({ ...prev, currentLatitude: e.target.value }))}
                required
              />
              <input
                className="input"
                type="number"
                step="0.000001"
                placeholder="Longitude"
                value={location.currentLongitude}
                onChange={(e) => setLocation((prev) => ({ ...prev, currentLongitude: e.target.value }))}
                required
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
