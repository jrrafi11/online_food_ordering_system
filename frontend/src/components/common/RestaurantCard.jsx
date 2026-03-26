import { Link } from 'react-router-dom';
import { Button } from './Button';
import { formatCurrency } from '../../utils/currency';

export const RestaurantCard = ({ restaurant }) => {
  const eta = restaurant.deliveryEtaMinutes || 30;
  const fee = Number(restaurant.deliveryFee || 0);
  const minOrder = Number(restaurant.minOrder || 0);
  const rating = Number(restaurant.ratingAverage || 0);
  const ratingCount = Number(restaurant.ratingCount || 0);

  return (
    <article className="panel fade-up overflow-hidden p-0">
      <Link to={`/restaurants/${restaurant.id}`} className="block">
        <div className="relative h-44 overflow-hidden">
          <img
            src={restaurant.bannerImageUrl || restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {restaurant.featured && <span className="badge border-transparent bg-brand-600 text-white">Featured</span>}
            <span className="badge border-transparent bg-white/90 text-ink-900">{eta} min</span>
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink-900">{restaurant.name}</h3>
            <p className="text-sm text-ink-500">{restaurant.cuisineType || 'Multiple cuisines'}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            {rating ? `${rating.toFixed(1)} ★` : 'New'}
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-ink-500">
          {restaurant.description || 'Crafted meals delivered quickly to your doorstep.'}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-ink-600">
          <span className="badge border-pink-100 bg-rose-50 text-ink-700">Fee {formatCurrency(fee)}</span>
          <span className="badge border-pink-100 bg-rose-50 text-ink-700">Min {formatCurrency(minOrder)}</span>
          <span className="badge border-pink-100 bg-rose-50 text-ink-700">
            {ratingCount > 0 ? `${ratingCount} reviews` : 'No reviews'}
          </span>
        </div>

        <Button as={Link} to={`/restaurants/${restaurant.id}`} className="w-full">
          View Restaurant
        </Button>
      </div>
    </article>
  );
};
