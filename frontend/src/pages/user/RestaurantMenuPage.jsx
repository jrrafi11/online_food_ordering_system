import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Chip } from '../../components/common/Chip';
import { EmptyState } from '../../components/common/EmptyState';
import { Loading } from '../../components/common/Loading';
import { LocationPickerMap } from '../../components/common/LocationPickerMap';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/currency';

const getMenuImage = (item) =>
  item?.imageUrl || `https://picsum.photos/seed/menu-item-${item?.id || 'default'}/420/320`;

export const RestaurantMenuPage = () => {
  const { restaurantId } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const { items, addItem, clearCart, getQuantity, updateQuantity, totalItems } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const canOrder = user?.role === 'user';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [{ data: restaurantRes }, { data: menuRes }] = await Promise.all([
          apiClient.get(`/restaurants/${restaurantId}`),
          apiClient.get(`/restaurants/${restaurantId}/menu`),
        ]);

        setRestaurant(restaurantRes.data);
        setMenuItems(menuRes.data || []);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((item) => item.category || 'Popular'));
    return ['All', ...set];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (activeCategory === 'All') return menuItems;
    return menuItems.filter((item) => (item.category || 'Popular') === activeCategory);
  }, [menuItems, activeCategory]);

  const cartHasOtherRestaurant = useMemo(
    () => items.some((item) => String(item.restaurantId) !== String(restaurantId)),
    [items, restaurantId]
  );

  const currentRestaurantCartItems = useMemo(
    () => items.filter((item) => String(item.restaurantId) === String(restaurantId)),
    [items, restaurantId]
  );

  const currentRestaurantSubtotal = useMemo(
    () =>
      currentRestaurantCartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [currentRestaurantCartItems]
  );

  const ensureSameRestaurantCart = () => {
    if (!cartHasOtherRestaurant) return true;

    const confirmed = window.confirm(
      'Your cart has items from another restaurant. Clear cart and start a new order here?'
    );

    if (!confirmed) return false;

    clearCart();
    toast?.addToast({
      variant: 'info',
      title: 'Cart cleared',
      description: 'Started a new cart for this restaurant.',
    });
    return true;
  };

  const increase = (item) => {
    if (!canOrder) return;
    if (!ensureSameRestaurantCart()) return;

    addItem(
      {
        ...item,
        restaurantId: Number(restaurantId),
        restaurantName: restaurant?.name || 'Restaurant',
      },
      1
    );

    toast?.addToast({
      variant: 'success',
      title: `${item.name} added`,
      description: 'Item added to your cart.',
      duration: 1800,
    });
  };

  const decrease = (item) => {
    const quantity = getQuantity(item.id);
    if (quantity <= 0) return;
    updateQuantity(item.id, quantity - 1);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loading text="Loading restaurant menu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <EmptyState title="Could not load restaurant" description={error} />
      </div>
    );
  }

  return (
    <div className="page-container space-y-5">
      <section className="panel overflow-hidden p-0">
        <div className="relative h-56 sm:h-72">
          <img
            src={restaurant?.bannerImageUrl || restaurant?.imageUrl}
            alt={restaurant?.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
            <p className="badge border-white/20 bg-white/15 text-white">
              {restaurant?.cuisineType || 'Popular Kitchen'}
            </p>
            <h1 className="mt-2 text-3xl font-bold">{restaurant?.name}</h1>
            <p className="mt-1 text-sm text-white/85">{restaurant?.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="badge border-white/20 bg-white/15 text-white">
                {restaurant?.deliveryEtaMinutes || 30} min
              </span>
              <span className="badge border-white/20 bg-white/15 text-white">
                Delivery {formatCurrency(restaurant?.deliveryFee || 0)}
              </span>
              <span className="badge border-white/20 bg-white/15 text-white">
                Min {formatCurrency(restaurant?.minOrder || 0)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {restaurant?.latitude && restaurant?.longitude && (
        <Card>
          <SectionHeader title="Location" subtitle={restaurant.address} />
          <div className="mt-3">
            <LocationPickerMap
              latitude={Number(restaurant.latitude)}
              longitude={Number(restaurant.longitude)}
              readOnly
              heightClass="h-52 sm:h-56"
            />
          </div>
        </Card>
      )}

      {cartHasOtherRestaurant && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your current cart has items from another restaurant. Add from this menu to start a fresh cart.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-4">
          <div className="panel-soft flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Chip>
            ))}
          </div>

          {!filteredMenuItems.length && (
            <EmptyState
              title="No menu items in this category"
              description="Try switching category to explore available dishes."
            />
          )}

          {filteredMenuItems.map((item) => {
            const quantity = getQuantity(item.id);
            return (
              <Card key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <img
                    src={getMenuImage(item)}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-xl border border-pink-100 object-cover bg-white"
                    loading="lazy"
                  />

                  <div className="flex-1">
                    <p className="text-lg font-bold text-ink-900">{item.name}</p>
                    <p className="text-sm text-ink-500">
                      {item.description || 'Chef special from this kitchen.'}
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-700">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => decrease(item)}
                    disabled={quantity === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <Button onClick={() => increase(item)} disabled={!canOrder}>
                    +
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card className="space-y-3">
            <h3 className="text-lg font-bold text-ink-900">Cart at {restaurant?.name}</h3>
            {!currentRestaurantCartItems.length && (
              <p className="text-sm text-ink-500">Add items to start your order.</p>
            )}
            {currentRestaurantCartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-bold text-ink-900">
                  {formatCurrency(Number(item.price) * Number(item.quantity))}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-pink-100 pt-2 text-sm font-bold text-ink-900">
              <span>Subtotal</span>
              <span>{formatCurrency(currentRestaurantSubtotal)}</span>
            </div>

            <Button as={Link} to="/cart" className="w-full" disabled={!currentRestaurantCartItems.length}>
              Go to Cart
            </Button>
          </Card>
        </aside>
      </div>

      {canOrder && currentRestaurantCartItems.length > 0 && (
        <div className="sticky-mobile-cta">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                {totalItems} item{totalItems > 1 ? 's' : ''} in cart
              </p>
              <p className="text-sm font-bold text-ink-900">{formatCurrency(currentRestaurantSubtotal)}</p>
            </div>
            <Button as={Link} to="/cart">
              View Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
