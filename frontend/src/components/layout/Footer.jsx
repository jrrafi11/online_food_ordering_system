import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-pink-100 bg-white/90">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 text-sm text-ink-500 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-base font-bold text-ink-900">FoodFlow</p>
          <p className="mt-2">Food delivery marketplace with real-time tracking and role-based operations.</p>
        </div>

        <div>
          <p className="font-bold text-ink-800">Explore</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link to="/" className="hover:text-brand-700">Discover Restaurants</Link>
            <Link to="/orders" className="hover:text-brand-700">Your Orders</Link>
            <Link to="/partner" className="hover:text-brand-700">Partner With Us</Link>
          </div>
        </div>

        <div className="lg:text-right">
          <p className="font-bold text-ink-800">Coverage</p>
          <p className="mt-2">Dhaka • Chattogram • Sylhet</p>
          <p className="mt-1">Fast delivery, transparent pricing, better food moments.</p>
        </div>
      </div>
    </footer>
  );
};
