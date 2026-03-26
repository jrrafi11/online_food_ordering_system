import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerCustomer, isLoading } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const result = await registerCustomer(form);
    if (!result.success) {
      setError(result.message);
      toast?.addToast({ variant: 'error', title: 'Sign up failed', description: result.message });
      return;
    }

    toast?.addToast({ variant: 'success', title: 'Account created', description: 'Welcome to FoodFlow.' });
    navigate('/orders', { replace: true });
  };

  return (
    <div className="page-container grid gap-5 lg:grid-cols-[1.1fr,1fr]">
      <section className="panel brand-gradient hidden text-white lg:block">
        <p className="badge border-white/20 bg-white/15 text-white">Customer Sign Up</p>
        <h1 className="mt-4 text-4xl font-bold">Food that fits your mood.</h1>
        <p className="mt-3 max-w-lg text-sm text-white/85">
          Create your account and get instant access to curated restaurants, real-time order tracking, and quick checkout.
        </p>
      </section>

      <section className="panel">
        <h1 className="text-3xl font-bold text-ink-900">Create Customer Account</h1>
        <p className="mt-1 text-sm text-ink-500">Fast signup and you are ready to order.</p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <InputField
            label="Full Name"
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder="Your full name"
            required
          />
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@email.com"
            required
          />
          <InputField
            label="Phone"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="+880..."
          />
          <InputField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Minimum 6 characters"
            required
            minLength={6}
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 space-y-2 text-sm text-ink-500">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Login
            </Link>
          </p>
          <p>
            Want to sell or deliver?{' '}
            <Link to="/partner" className="font-semibold text-brand-700 hover:text-brand-800">
              Partner onboarding
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};
