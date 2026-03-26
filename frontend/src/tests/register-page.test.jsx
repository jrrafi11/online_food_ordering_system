import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RegisterPage } from '../pages/RegisterPage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    registerCustomer: vi.fn().mockResolvedValue({ success: true, data: { user: { role: 'user' } } }),
    isLoading: false,
  }),
}));

vi.mock('../hooks/useToast', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe('RegisterPage', () => {
  it('renders customer-first sign up without role dropdown', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Create Customer Account/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Role/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Partner onboarding/i })).toBeInTheDocument();
  });
});
