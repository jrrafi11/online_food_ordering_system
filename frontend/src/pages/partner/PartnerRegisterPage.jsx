import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const roleConfig = {
  restaurant: {
    title: 'Restaurant Partner Sign Up',
    subtitle: 'Create your partner account and start managing orders on your dashboard.',
    dashboardPath: '/restaurant/dashboard',
  },
  rider: {
    title: 'Rider Partner Sign Up',
    subtitle: 'Create your rider account and begin receiving delivery assignments.',
    dashboardPath: '/rider/dashboard',
  },
};

export const PartnerRegisterPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { registerPartner, isLoading } = useAuth();
  const toast = useToast();

  const config = useMemo(() => roleConfig[role], [role]);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');

  if (!config) {
    return <Navigate to="/partner" replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const result = await registerPartner({ ...form, role });

    if (!result.success) {
      setError(result.message);
      toast?.addToast({
        variant: 'error',
        title: 'Registration failed',
        description: result.message,
      });
      return;
    }

    toast?.addToast({
      variant: 'success',
      title: 'Account created',
      description: 'Your partner account is ready. Complete your profile from dashboard.',
    });

    navigate(config.dashboardPath, { replace: true });
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="panel">
        <p className="badge">Partner Onboarding</p>
        <h1 className="mt-3 text-3xl font-bold text-ink-900">{config.title}</h1>
        <p className="mt-2 text-sm text-ink-500">{config.subtitle}</p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
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
            label="Phone"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="+880..."
          />
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="partner@email.com"
            required
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

          {error && <p className="md:col-span-2 text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="md:col-span-2" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Partner Account'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-ink-500">
          Looking for customer sign up?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
