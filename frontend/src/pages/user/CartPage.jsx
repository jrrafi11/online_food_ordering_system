import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { CartSummary } from '../../components/common/CartSummary';
import { EmptyState } from '../../components/common/EmptyState';
import { InputField } from '../../components/common/InputField';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/currency';

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    groupedByRestaurant,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    restaurantIds,
    totalItems,
  } = useCart();

  if (!items.length) {
    return (
      <div className="page-container">
        <EmptyState
          title="Your cart is empty"
          description="Browse restaurants and add delicious dishes to begin your order."
          actionLabel="Discover Restaurants"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  const singleRestaurant = restaurantIds.length <= 1;

  return (
    <div className="page-container grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-4">
        <SectionHeader
          title="Your Cart"
          subtitle={`${totalItems} item${totalItems > 1 ? 's' : ''} ready for checkout`}
          action={<Button variant="ghost" onClick={clearCart}>Clear Cart</Button>}
        />

        {!singleRestaurant && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Single-restaurant checkout is active right now. Keep items from one restaurant to continue.
          </div>
        )}

        <div className="space-y-4">
          {groupedByRestaurant.map((group) => (
            <Card key={group.restaurantId} className="space-y-3">
              <h3 className="text-lg font-bold text-ink-900">{group.restaurantName}</h3>
              {group.items.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink-100 p-3">
                  <div>
                    <p className="font-bold text-ink-900">{item.name}</p>
                    <p className="text-sm text-ink-500">{formatCurrency(item.price)} each</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      -
                    </Button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <Button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    <Button variant="ghost" onClick={() => removeItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>

        <Card className="space-y-3">
          <h3 className="text-lg font-bold text-ink-900">Promo Code</h3>
          <div className="flex flex-wrap gap-2">
            <div className="min-w-[220px] flex-1">
              <InputField id="coupon" placeholder="Enter coupon code" />
            </div>
            <Button variant="outline">Apply</Button>
          </div>
          <p className="text-xs text-ink-500">Promo integration is UI-ready and can be linked to coupon APIs next phase.</p>
        </Card>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <CartSummary
          subtotal={subtotal}
          deliveryFee={2.5}
          serviceFee={1}
          ctaLabel={singleRestaurant ? 'Continue to Checkout' : 'Single-Restaurant Only'}
          ctaAs={singleRestaurant ? Link : undefined}
          ctaTo={singleRestaurant ? '/checkout' : undefined}
          disabled={!singleRestaurant}
        />
      </aside>

      <div className="sticky-mobile-cta lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Total</p>
            <p className="text-sm font-bold text-ink-900">{formatCurrency(subtotal + 2.5 + 1)}</p>
          </div>
          <Button as={Link} to="/checkout" disabled={!singleRestaurant}>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
