import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '../pages/HomePage';

const getMock = vi.fn();

vi.mock('../api/client', () => ({
  apiClient: {
    get: (...args) => getMock(...args),
  },
  extractErrorMessage: (error) => error?.message || 'Error',
}));

describe('HomePage discovery controls', () => {
  it('renders search/sort/filter UI and restaurant cards', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 1,
            name: 'Test Kitchen',
            cuisineType: 'American',
            description: 'Burgers and fries',
            deliveryEtaMinutes: 20,
            deliveryFee: 1.5,
            minOrder: 5,
            ratingAverage: 4.6,
            ratingCount: 120,
            featured: true,
            bannerImageUrl: 'https://picsum.photos/seed/test-kitchen/1080/680',
          },
        ],
        meta: {
          page: 1,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort By/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Test Kitchen/i)).toBeInTheDocument();
      expect(screen.getByText(/Featured Only/i)).toBeInTheDocument();
    });
  });
});
