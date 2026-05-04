import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CatalogPage from '../pages/CatalogPage';

jest.mock('../api/petsApi', () => ({
  getPets: jest.fn(),
}));

const { getPets } = jest.requireMock('../api/petsApi');

describe('CatalogPage', () => {
  it('renders pet cards from API', async () => {
    getPets.mockResolvedValueOnce({
      content: [
        {
          id: 1,
          name: 'Buddy',
          breed: 'Golden Retriever',
          price: 850,
          imageUrl: 'https://example.com/buddy.jpg',
          available: true,
          category: 'DOGS',
        },
      ],
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
  });

  it('shows empty state when API returns no results', async () => {
    getPets.mockResolvedValueOnce({ content: [], totalPages: 0 });

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No pets available/i)).toBeInTheDocument();
    });
  });
});
