import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const dashboardPathByRole = {
  user: '/orders',
  restaurant: '/restaurant/dashboard',
  rider: '/rider/dashboard',
  admin: '/admin/dashboard',
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const result = await login({ email, password });
    if (!result.success) {
      setError(result.message);
      toast?.addToast({ variant: 'error', title: 'Login failed', description: result.message });
      return;
    }

    toast?.addToast({ variant: 'success', title: 'Welcome back', description: 'Signed in successfully.' });

    const role = result.data.user.role;
    const from = location.state?.from?.pathname;
    navigate(from || dashboardPathByRole[role] || '/', { replace: true });
  };

  return (
    <div className="page-container grid gap-5 lg:grid-cols-[1.1fr,1fr]">
      <section className="panel brand-gradient hidden text-white lg:block">
        <p className="badge border-white/20 bg-white/15 text-white">Fast Delivery. Better Experience.</p>
        <h1 className="mt-4 text-4xl font-bold">Craving something great?</h1>
        <p className="mt-3 max-w-lg text-sm text-white/85">
          Discover top restaurants, track every order in real time, and enjoy effortless checkout built for speed.
        </p>
      </section>

      <section className="panel">
        <h1 className="text-3xl font-bold text-ink-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in to continue your food journey.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <InputField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
          <InputField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 space-y-2 text-sm text-ink-500">
          <p>
            New here?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
              Create customer account
            </Link>
          </p>
          <p>
            Partner account?{' '}
            <Link to="/partner" className="font-semibold text-brand-700 hover:text-brand-800">
              Join as restaurant or rider
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};
