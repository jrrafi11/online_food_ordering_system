import { useEffect, useState } from 'react';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RoleTabs } from '../../components/common/RoleTabs';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../hooks/useToast';

const riderNavItems = [
  { to: '/rider/dashboard', label: 'Dashboard' },
  { to: '/rider/profile', label: 'Profile' },
  { to: '/rider/location', label: 'Location' },
];

const riderPlaceholderImage = 'https://picsum.photos/seed/rider-avatar/300/300';

export const RiderProfilePage = () => {
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [vehicleType, setVehicleType] = useState('bike');
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.get('/riders/profile/me');
      setProfile(data.data);
      setVehicleType(data.data.vehicleType || 'bike');
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        setVehicleType('bike');
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
      if (profile) {
        await apiClient.patch('/riders/profile/me', { vehicleType });
        toast?.addToast({
          variant: 'success',
          title: 'Profile updated',
          description: 'Rider profile has been updated.',
        });
      } else {
        await apiClient.post('/riders/profile', { vehicleType });
        toast?.addToast({
          variant: 'success',
          title: 'Profile created',
          description: 'Rider profile has been created.',
        });
      }

      await loadProfile();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadProfileImage = async () => {
    if (!profile) {
      toast?.addToast({
        variant: 'warning',
        title: 'Create profile first',
        description: 'Please create your rider profile before uploading an image.',
      });
      return;
    }

    if (!selectedImage) {
      toast?.addToast({
        variant: 'warning',
        title: 'No file selected',
        description: 'Please select an image to upload.',
      });
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profileImage', selectedImage);

      await apiClient.patch('/riders/profile/me/image', formData);

      setSelectedImage(null);

      toast?.addToast({
        variant: 'success',
        title: 'Profile image uploaded',
        description: 'Rider profile photo updated successfully.',
      });

      await loadProfile();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleAvailability = async () => {
    setError('');

    try {
      await apiClient.patch('/riders/availability');
      await loadProfile();
      toast?.addToast({
        variant: 'success',
        title: 'Availability updated',
        description: 'Your rider availability has been updated.',
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Rider Profile</h1>
        <p className="text-sm text-ink-500">Manage rider settings separately from live map location.</p>
      </div>

      <RoleTabs items={riderNavItems} />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading && <p className="text-sm text-ink-500">Loading profile...</p>}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-ink-900">Profile Photo</h2>
          {profile && <StatusBadge status={profile.approvalStatus} />}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <img
            src={profile?.profileImageUrl || riderPlaceholderImage}
            alt="Rider profile"
            className="h-20 w-20 rounded-full border border-pink-100 object-cover"
          />

          <div className="space-y-2">
            <input
              className="input max-w-sm"
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={!profile || uploadingImage}
              onClick={uploadProfileImage}
            >
              {uploadingImage ? 'Uploading...' : 'Upload Profile Photo'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-ink-900">Rider Settings</h2>
          {profile && <StatusBadge status={profile.approvalStatus} />}
        </div>

        <form className="space-y-3" onSubmit={onSave}>
          <label className="label" htmlFor="vehicleType">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            className="input max-w-72"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="bike">Bike</option>
            <option value="bicycle">Bicycle</option>
            <option value="scooter">Scooter</option>
            <option value="car">Car</option>
          </select>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : profile ? 'Save Profile' : 'Create Profile'}
            </Button>
            {profile && (
              <Button type="button" variant="outline" onClick={toggleAvailability}>
                Set {profile.isAvailable ? 'Unavailable' : 'Available'}
              </Button>
            )}
          </div>
        </form>

        {profile && (
          <div className="rounded-2xl border border-pink-100 bg-rose-50/40 p-3 text-sm text-ink-600">
            Current availability:{' '}
            <span className="font-semibold">{profile.isAvailable ? 'Available' : 'Unavailable'}</span>
          </div>
        )}
      </Card>
    </div>
  );
};
