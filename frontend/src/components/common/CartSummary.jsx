import { Button } from './Button';
import { formatCurrency } from '../../utils/currency';

export const CartSummary = ({
  subtotal,
  deliveryFee = 2.5,
  serviceFee = 0,
  discount = 0,
  ctaLabel,
  onCta,
  ctaAs,
  ctaTo,
  disabled = false,
}) => {
  const total = Number(subtotal) + Number(deliveryFee) + Number(serviceFee) - Number(discount);

  return (
    <aside className="panel h-fit space-y-3">
      <h3 className="text-lg font-bold text-ink-900">Order Summary</h3>
      <div className="space-y-2 text-sm text-ink-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service Fee</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between border-t border-pink-100 pt-3 text-base font-bold text-ink-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {ctaLabel && (
        <Button as={ctaAs} to={ctaTo} className="w-full" onClick={onCta} disabled={disabled}>
          {ctaLabel}
        </Button>
      )}
    </aside>
  );
};
