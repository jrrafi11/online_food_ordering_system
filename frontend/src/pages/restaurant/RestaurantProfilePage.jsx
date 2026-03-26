import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RoleTabs } from '../../components/common/RoleTabs';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../hooks/useToast';

const restaurantNavItems = [
  { to: '/restaurant/dashboard', label: 'Dashboard' },
  { to: '/restaurant/menu', label: 'Menu' },
  { to: '/restaurant/profile', label: 'Profile' },
  { to: '/restaurant/location', label: 'Location' },
];

const initialForm = {
  name: '',
  address: '',
  cuisineType: '',
  description: '',
  imageUrl: '',
  logoImageUrl: '',
  bannerImageUrl: '',
  deliveryEtaMinutes: '30',
  deliveryFee: '2.5',
  minOrder: '8',
};

const toOptionalNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
};

const normalizeProfileToForm = (profile) => ({
  name: profile?.name || '',
  address: profile?.address || '',
  cuisineType: profile?.cuisineType || '',
  description: profile?.description || '',
  imageUrl: profile?.imageUrl || '',
  logoImageUrl: profile?.logoImageUrl || '',
  bannerImageUrl: profile?.bannerImageUrl || '',
  deliveryEtaMinutes: String(profile?.deliveryEtaMinutes ?? 30),
  deliveryFee: String(profile?.deliveryFee ?? 2.5),
  minOrder: String(profile?.minOrder ?? 8),
});

const placeholderImage = 'https://picsum.photos/seed/foodflow-profile/800/560';

const imageConfig = {
  banner: {
    title: 'Banner Image',
    description: 'Hero image shown at top of restaurant page.',
    srcKey: 'bannerImageUrl',
  },
  logo: {
    title: 'Logo Image',
    description: 'Brand avatar used across restaurant cards.',
    srcKey: 'logoImageUrl',
  },
  cover: {
    title: 'Card Image',
    description: 'Restaurant card/discovery cover image.',
    srcKey: 'imageUrl',
  },
};

export const RestaurantProfilePage = () => {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [selectedImageFiles, setSelectedImageFiles] = useState({
    banner: null,
    logo: null,
    cover: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImageKey, setUploadingImageKey] = useState('');

  const imagePreviewSources = useMemo(
    () => ({
      banner: form.bannerImageUrl || form.imageUrl || placeholderImage,
      logo: form.logoImageUrl || form.imageUrl || placeholderImage,
      cover: form.imageUrl || form.bannerImageUrl || placeholderImage,
    }),
    [form.bannerImageUrl, form.logoImageUrl, form.imageUrl]
  );

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.get('/restaurants/profile/me');
      setProfile(data.data);
      setForm(normalizeProfileToForm(data.data));
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        setForm(initialForm);
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

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      address: form.address,
      cuisineType: form.cuisineType,
      description: form.description,
      imageUrl: form.imageUrl || undefined,
      logoImageUrl: form.logoImageUrl || undefined,
      bannerImageUrl: form.bannerImageUrl || undefined,
      deliveryEtaMinutes: toOptionalNumber(form.deliveryEtaMinutes),
      deliveryFee: toOptionalNumber(form.deliveryFee),
      minOrder: toOptionalNumber(form.minOrder),
    };

    try {
      if (profile) {
        await apiClient.patch('/restaurants/profile/me', payload);
        toast?.addToast({
          variant: 'success',
          title: 'Profile updated',
          description: 'Restaurant profile has been updated.',
        });
      } else {
        await apiClient.post('/restaurants/profile', payload);
        toast?.addToast({
          variant: 'success',
          title: 'Profile created',
          description: 'Restaurant profile has been created.',
        });
      }

      await loadProfile();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadRestaurantImage = async (type) => {
    const file = selectedImageFiles[type];

    if (!profile) {
      toast?.addToast({
        variant: 'warning',
        title: 'Create profile first',
        description: 'Please create a restaurant profile before uploading images.',
      });
      return;
    }

    if (!file) {
      toast?.addToast({
        variant: 'warning',
        title: 'No file selected',
        description: 'Select an image first, then upload.',
      });
      return;
    }

    setUploadingImageKey(type);
    setError('');

    try {
      const formData = new FormData();
      formData.append('restaurantImage', file);

      await apiClient.patch(`/restaurants/profile/me/images/${type}`, formData);

      setSelectedImageFiles((prev) => ({ ...prev, [type]: null }));

      toast?.addToast({
        variant: 'success',
        title: 'Image uploaded',
        description: `${imageConfig[type].title} updated successfully.`,
      });

      await loadProfile();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploadingImageKey('');
    }
  };

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Restaurant Profile</h1>
        <p className="text-sm text-ink-500">Edit core business details and manage restaurant brand images.</p>
      </div>

      <RoleTabs items={restaurantNavItems} />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading && <p className="text-sm text-ink-500">Loading profile...</p>}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-ink-900">Image Manager</h2>
          {profile && <StatusBadge status={profile.approvalStatus} />}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {Object.entries(imageConfig).map(([key, info]) => (
            <div key={key} className="rounded-2xl border border-pink-100 bg-rose-50/40 p-3 space-y-3">
              <div>
                <p className="text-sm font-bold text-ink-900">{info.title}</p>
                <p className="text-xs text-ink-500">{info.description}</p>
              </div>

              <img
                src={imagePreviewSources[key] || placeholderImage}
                alt={info.title}
                className="h-32 w-full rounded-xl object-cover border border-pink-100 bg-white"
              />

              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedImageFiles((prev) => ({ ...prev, [key]: file }));
                }}
              />

              <Button
                className="w-full"
                type="button"
                disabled={!profile || uploadingImageKey === key}
                onClick={() => uploadRestaurantImage(key)}
              >
                {uploadingImageKey === key ? 'Uploading...' : `Upload ${info.title}`}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-ink-900">Business Information</h2>
          {profile && <StatusBadge status={profile.approvalStatus} />}
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="Restaurant name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Cuisine type"
            value={form.cuisineType}
            onChange={(e) => setForm((prev) => ({ ...prev, cuisineType: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Delivery ETA (minutes)"
            value={form.deliveryEtaMinutes}
            onChange={(e) => setForm((prev) => ({ ...prev, deliveryEtaMinutes: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Delivery fee"
            value={form.deliveryFee}
            onChange={(e) => setForm((prev) => ({ ...prev, deliveryFee: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Minimum order"
            value={form.minOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, minOrder: e.target.value }))}
          />
          <input
            className="input md:col-span-2"
            placeholder="Hero image URL (optional)"
            value={form.bannerImageUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, bannerImageUrl: e.target.value }))}
          />
          <input
            className="input md:col-span-2"
            placeholder="Logo image URL (optional)"
            value={form.logoImageUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, logoImageUrl: e.target.value }))}
          />
          <input
            className="input md:col-span-2"
            placeholder="Card image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          />
          <textarea
            className="input min-h-28 md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
            </Button>
            <Button as={Link} to="/restaurant/location" variant="outline">
              Edit Location & Map
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
