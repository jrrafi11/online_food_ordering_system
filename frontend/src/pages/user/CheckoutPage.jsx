import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { CartSummary } from '../../components/common/CartSummary';
import { EmptyState } from '../../components/common/EmptyState';
import { InputField } from '../../components/common/InputField';
import { SelectField } from '../../components/common/SelectField';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/currency';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, subtotal, clearCart, restaurantIds, groupedByRestaurant } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const singleRestaurant = restaurantIds.length === 1;

  const summaryItems = useMemo(() => groupedByRestaurant[0]?.items || [], [groupedByRestaurant]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!singleRestaurant) {
      setError('Checkout currently supports one restaurant per order.');
      return;
    }

    if (deliveryAddress.trim().length < 8) {
      setError('Please enter a detailed delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        restaurantId: restaurantIds[0],
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        notes: notes.trim(),
        items: items.map((item) => ({
          foodItemId: item.id,
          quantity: item.quantity,
        })),
      };

      const { data } = await apiClient.post('/orders', payload);

      clearCart();
      toast?.addToast({
        variant: 'success',
        title: 'Order placed',
        description: `Order #${data.data.id} has been created successfully.`,
      });
      navigate(`/orders/${data.data.id}/tracking`);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast?.addToast({ variant: 'error', title: 'Order failed', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="page-container">
        <EmptyState
          title="No items to checkout"
          description="Add some dishes to your cart and come back to checkout."
          actionLabel="Back to Home"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="page-container grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-4">
        <Card>
          <h1 className="text-3xl font-bold text-ink-900">Checkout</h1>
          <p className="mt-1 text-sm text-ink-500">Confirm your delivery details and payment method.</p>
        </Card>

        {!singleRestaurant && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Single-restaurant checkout is active in this phase. Keep cart items from one restaurant.
          </div>
        )}

        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <InputField
              label="Delivery Address"
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="House, street, area, city"
              required
            />

            <SelectField
              label="Payment Method"
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              options={[
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'stripe_mock', label: 'Card (Stripe Mock)' },
              ]}
            />

            <div>
              <label className="label" htmlFor="notes">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                className="input min-h-24"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add instructions for rider or restaurant"
              />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <Button type="submit" disabled={isSubmitting || !singleRestaurant}>
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
        </Card>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Card className="space-y-3">
          <h3 className="text-lg font-bold text-ink-900">Items</h3>
          {summaryItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-ink-600">
                {item.name} x {item.quantity}
              </span>
              <span className="font-bold text-ink-900">
                {formatCurrency(Number(item.price) * Number(item.quantity))}
              </span>
            </div>
          ))}
        </Card>

        <CartSummary
          subtotal={subtotal}
          deliveryFee={2.5}
          serviceFee={1}
        />
      </aside>
    </div>
  );
};
