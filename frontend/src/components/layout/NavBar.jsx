import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { Button } from '../common/Button';

const roleDashboardPath = {
  user: '/orders',
  restaurant: '/restaurant/dashboard',
  rider: '/rider/dashboard',
  admin: '/admin/dashboard',
};

const navLinkClass = ({ isActive }) =>
  [
    'rounded-full px-3 py-1.5 text-sm font-semibold transition',
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-ink-600 hover:bg-brand-50 hover:text-brand-700',
  ].join(' ');

const getRoleNavLinks = (isAuthenticated, role) => {
  if (!isAuthenticated) {
    return [
      { to: '/', label: 'Home' },
      { to: '/partner', label: 'Become a Partner' },
    ];
  }

  if (role === 'user') {
    return [
      { to: '/', label: 'Home' },
      { to: '/orders', label: 'Orders' },
    ];
  }

  if (role === 'restaurant') {
    return [
      { to: '/restaurant/dashboard', label: 'Dashboard' },
      { to: '/restaurant/menu', label: 'Menu' },
      { to: '/restaurant/profile', label: 'Profile' },
      { to: '/restaurant/location', label: 'Location' },
    ];
  }

  if (role === 'rider') {
    return [
      { to: '/rider/dashboard', label: 'Dashboard' },
      { to: '/rider/profile', label: 'Profile' },
      { to: '/rider/location', label: 'Location' },
    ];
  }

  if (role === 'admin') {
    return [{ to: '/admin/dashboard', label: 'Dashboard' }];
  }

  return [{ to: '/', label: 'Home' }];
};

export const NavBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const brandTarget =
    isAuthenticated && user?.role && user.role !== 'user'
      ? roleDashboardPath[user.role] || '/'
      : '/';

  const navLinks = getRoleNavLinks(isAuthenticated, user?.role);

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={brandTarget} className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl brand-gradient text-sm font-bold text-white">
            FF
          </span>
          <span className="text-lg font-extrabold text-ink-900">FoodFlow</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user?.role === 'user' && (
            <Button as={Link} to="/cart" variant="outline" className="relative hidden sm:inline-flex">
              Cart
              {totalItems > 0 && (
                <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <span className="hidden rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-bold uppercase text-brand-700 md:inline-flex">
                {user?.role}
              </span>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="outline">
                Login
              </Button>
              <Button as={Link} to="/register">
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
