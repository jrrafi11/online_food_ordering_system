import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RoleTabs } from '../../components/common/RoleTabs';
import { useToast } from '../../hooks/useToast';
import { CURRENCY_CODE, formatCurrency } from '../../utils/currency';

const restaurantNavItems = [
  { to: '/restaurant/dashboard', label: 'Dashboard' },
  { to: '/restaurant/menu', label: 'Menu' },
  { to: '/restaurant/profile', label: 'Profile' },
  { to: '/restaurant/location', label: 'Location' },
];

const menuPlaceholderImage = 'https://picsum.photos/seed/foodflow-menu/500/360';

const categoryPresets = [
  'Popular',
  'Burger',
  'Pizza',
  'Chicken',
  'Rice',
  'Dessert',
  'Drinks',
];

const initialMenuForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  isAvailable: true,
  imageUrl: '',
  imageFile: null,
};

const buildEditForm = (item) => ({
  name: item?.name || '',
  category: item?.category || '',
  price: item?.price !== undefined && item?.price !== null ? String(item.price) : '',
  description: item?.description || '',
  isAvailable: item?.isAvailable ?? true,
  imageUrl: item?.imageUrl || '',
  imageFile: null,
});

const MenuItemModal = ({
  open,
  mode,
  form,
  setForm,
  saving,
  imagePreviewUrl,
  onClose,
  onSave,
}) => {
  if (!open) {
    return null;
  }

  const title = mode === 'edit' ? 'Edit Menu Item' : 'Add Menu Item';
  const saveLabel = saving
    ? mode === 'edit'
      ? 'Saving Changes...'
      : 'Creating Item...'
    : mode === 'edit'
      ? 'Save Changes'
      : 'Create Item';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/55 backdrop-blur-sm"
        aria-label="Close modal backdrop"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_24px_64px_rgba(31,34,48,0.25)]">
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink-900">{title}</h2>
            <p className="text-sm text-ink-500">
              {mode === 'edit'
                ? 'Update details and keep your menu consistent.'
                : 'Launch a new item with polished listing details.'}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid gap-5 p-6 lg:grid-cols-[1.3fr,1fr]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label" htmlFor="menu-name">
                  Item Name
                </label>
                <input
                  id="menu-name"
                  className="input"
                  placeholder="e.g. Crispy Chicken Burger"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div>
                <label className="label" htmlFor="menu-price">
                  Price ({CURRENCY_CODE})
                </label>
                <input
                  id="menu-price"
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="350.00"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div>
                <label className="label" htmlFor="menu-category">
                  Category
                </label>
                <input
                  id="menu-category"
                  className="input"
                  placeholder="Popular"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryPresets.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="rounded-full border border-pink-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-ink-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  onClick={() => setForm((prev) => ({ ...prev, category }))}
                >
                  {category}
                </button>
              ))}
            </div>

            <div>
              <label className="label" htmlFor="menu-description">
                Description
              </label>
              <textarea
                id="menu-description"
                className="input min-h-28"
                placeholder="Write a short, clear item description."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="label" htmlFor="menu-image-file">
                Item Image
              </label>
              <input
                id="menu-image-file"
                className="input"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setForm((prev) => ({ ...prev, imageFile: file }));
                }}
              />
              <p className="mt-1 text-xs text-ink-500">Use JPEG/PNG/WebP up to 5MB.</p>
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl border border-pink-100 bg-rose-50/50 px-3 py-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))}
              />
              Make this item available for customers now
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink-700">Live Preview</p>
            <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
              <div className="relative h-44">
                <img
                  src={imagePreviewUrl || menuPlaceholderImage}
                  alt={form.name || 'Menu preview'}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    form.isAvailable
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {form.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-ink-900">
                      {form.name || 'Item name preview'}
                    </p>
                    <p className="text-xs text-ink-500">{form.category || 'Category'}</p>
                  </div>
                  <p className="text-sm font-extrabold text-brand-700">
                    {formatCurrency(Number(form.price || 0))}
                  </p>
                </div>

                <p className="text-sm text-ink-500">
                  {form.description || 'Short description will appear here for customers.'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-pink-100 bg-rose-50/40 p-3 text-xs text-ink-600">
              Pro tip: clear names, quality photos, and concise descriptions improve conversions.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-pink-100 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={onSave}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const RestaurantMenuManagementPage = () => {
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const [menuForm, setMenuForm] = useState(initialMenuForm);
  const [modalImagePreviewUrl, setModalImagePreviewUrl] = useState('');
  const [savingMenuItem, setSavingMenuItem] = useState(false);

  const [menuImageFiles, setMenuImageFiles] = useState({});
  const [uploadingFoodItemId, setUploadingFoodItemId] = useState(null);
  const [savingMenuItemId, setSavingMenuItemId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const profileRes = await apiClient.get('/restaurants/profile/me');
      setProfile(profileRes.data.data);
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

  useEffect(() => {
    if (!menuForm.imageFile) {
      setModalImagePreviewUrl('');
      return;
    }

    const previewUrl = URL.createObjectURL(menuForm.imageFile);
    setModalImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [menuForm.imageFile]);

  useEffect(() => {
    if (!modalMode) {
      return undefined;
    }

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setModalMode(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalMode]);

  const menuItems = useMemo(() => profile?.menuItems || [], [profile?.menuItems]);

  const menuStats = useMemo(() => {
    const total = menuItems.length;
    const available = menuItems.filter((item) => item.isAvailable).length;
    return {
      total,
      available,
      unavailable: total - available,
    };
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && item.isAvailable) ||
        (statusFilter === 'unavailable' && !item.isAvailable);

      if (!matchesStatus) return false;

      if (!normalizedQuery) return true;

      return (
        item.name?.toLowerCase().includes(normalizedQuery) ||
        item.category?.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [menuItems, searchTerm, statusFilter]);

  const openAddModal = () => {
    setModalMode('add');
    setActiveItemId(null);
    setMenuForm(initialMenuForm);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setActiveItemId(item.id);
    setMenuForm(buildEditForm(item));
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveItemId(null);
    setMenuForm(initialMenuForm);
  };

  const saveMenuItem = async () => {
    const trimmedName = menuForm.name.trim();
    const parsedPrice = Number(menuForm.price);

    if (!trimmedName) {
      toast?.addToast({
        variant: 'warning',
        title: 'Name is required',
        description: 'Please enter a valid item name.',
      });
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast?.addToast({
        variant: 'warning',
        title: 'Invalid price',
        description: 'Please enter a valid price greater than zero.',
      });
      return;
    }

    setSavingMenuItem(true);
    setError('');

    try {
      const payload = {
        name: trimmedName,
        category: menuForm.category?.trim() || null,
        price: parsedPrice,
        description: menuForm.description?.trim() || null,
        isAvailable: Boolean(menuForm.isAvailable),
      };

      let targetItemId = activeItemId;

      if (modalMode === 'add') {
        const response = await apiClient.post('/restaurants/menu', payload);
        targetItemId = response?.data?.data?.id;
      } else {
        await apiClient.patch(`/restaurants/menu/${activeItemId}`, payload);
      }

      if (menuForm.imageFile && targetItemId) {
        const formData = new FormData();
        formData.append('foodImage', menuForm.imageFile);

        await apiClient.patch(`/restaurants/menu/${targetItemId}/image`, formData);
      }

      await loadProfile();
      closeModal();

      toast?.addToast({
        variant: 'success',
        title: modalMode === 'add' ? 'Menu item created' : 'Menu item updated',
        description:
          modalMode === 'add'
            ? 'New item was added to your menu.'
            : 'Item details were saved successfully.',
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingMenuItem(false);
    }
  };

  const toggleMenuItemAvailability = async (item) => {
    setSavingMenuItemId(item.id);
    setError('');

    try {
      await apiClient.patch(`/restaurants/menu/${item.id}`, {
        isAvailable: !item.isAvailable,
      });

      await loadProfile();

      toast?.addToast({
        variant: 'success',
        title: 'Availability updated',
        description: `${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'}.`,
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingMenuItemId(null);
    }
  };

  const uploadFoodImage = async (itemId) => {
    const file = menuImageFiles[itemId];

    if (!file) {
      toast?.addToast({
        variant: 'warning',
        title: 'No file selected',
        description: 'Select an image first, then upload.',
      });
      return;
    }

    setUploadingFoodItemId(itemId);
    setError('');

    try {
      const formData = new FormData();
      formData.append('foodImage', file);

      await apiClient.patch(`/restaurants/menu/${itemId}/image`, formData);

      setMenuImageFiles((prev) => ({ ...prev, [itemId]: null }));
      await loadProfile();

      toast?.addToast({
        variant: 'success',
        title: 'Food image updated',
        description: 'Menu item image uploaded successfully.',
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploadingFoodItemId(null);
    }
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Menu Management</h1>
          <p className="text-sm text-ink-500">
            Create, edit, and optimize your menu with premium listing controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadProfile}>
            Refresh
          </Button>
          <Button onClick={openAddModal}>Add Menu Item</Button>
        </div>
      </div>

      <RoleTabs items={restaurantNavItems} />

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-ink-500">Loading menu...</p>}

      {!profile ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink-900">Complete your restaurant profile first</h2>
          <p className="text-sm text-ink-500">
            You need a restaurant profile before managing menu items.
          </p>
          <Button as={Link} to="/restaurant/profile" className="w-fit">
            Create Profile
          </Button>
        </Card>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Total Items</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{menuStats.total}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Available</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">{menuStats.available}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Unavailable</p>
              <p className="mt-2 text-2xl font-bold text-slate-600">{menuStats.unavailable}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-500">Action</p>
              <Button className="mt-2 w-full" onClick={openAddModal}>
                Add New Item
              </Button>
            </Card>
          </section>

          <Card className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr]">
              <input
                className="input"
                placeholder="Search by name, category, or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                type="button"
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All Items
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={statusFilter === 'available' ? 'primary' : 'outline'}
                  className="flex-1"
                  onClick={() => setStatusFilter('available')}
                >
                  Available
                </Button>
                <Button
                  type="button"
                  variant={statusFilter === 'unavailable' ? 'primary' : 'outline'}
                  className="flex-1"
                  onClick={() => setStatusFilter('unavailable')}
                >
                  Unavailable
                </Button>
              </div>
            </div>
          </Card>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {!filteredMenuItems.length && (
              <Card className="sm:col-span-2 xl:col-span-3">
                <p className="text-sm text-ink-500">
                  No menu items match your current filters.
                </p>
              </Card>
            )}

            {filteredMenuItems.map((item) => {
              const isSavingThisItem = savingMenuItemId === item.id;

              return (
                <article key={item.id} className="panel overflow-hidden p-0">
                  <div className="relative h-44">
                    <img
                      src={item.imageUrl || menuPlaceholderImage}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-ink-900">{item.name}</p>
                        <p className="text-xs text-ink-500">{item.category || 'Uncategorized'}</p>
                      </div>
                      <p className="text-sm font-extrabold text-brand-700">
                        {formatCurrency(Number(item.price))}
                      </p>
                    </div>

                    <p className="line-clamp-2 text-sm text-ink-500">
                      {item.description || 'No description added yet.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => openEditModal(item)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1"
                        disabled={isSavingThisItem}
                        onClick={() => toggleMenuItemAvailability(item)}
                      >
                        {isSavingThisItem
                          ? 'Updating...'
                          : item.isAvailable
                            ? 'Disable'
                            : 'Enable'}
                      </Button>
                    </div>

                    <div className="space-y-2 border-t border-pink-100 pt-3">
                      <input
                        className="input"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setMenuImageFiles((prev) => ({ ...prev, [item.id]: file }));
                        }}
                      />
                      <Button
                        type="button"
                        className="w-full"
                        disabled={uploadingFoodItemId === item.id}
                        onClick={() => uploadFoodImage(item.id)}
                      >
                        {uploadingFoodItemId === item.id ? 'Uploading...' : 'Upload Food Image'}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      <MenuItemModal
        open={Boolean(modalMode)}
        mode={modalMode}
        form={menuForm}
        setForm={setMenuForm}
        saving={savingMenuItem}
        imagePreviewUrl={modalImagePreviewUrl || menuForm.imageUrl}
        onClose={closeModal}
        onSave={saveMenuItem}
      />
    </div>
  );
};
