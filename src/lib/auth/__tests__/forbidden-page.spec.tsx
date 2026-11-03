import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ForbiddenPage } from '@/lib/auth/forbidden-page';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ForbiddenPage', () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders access denied messaging and links to dashboard for full operator', () => {
    mockUseAuth.mockReturnValue({
      session: {
        permissions: ['access_admin', 'view_all_orders'],
      },
    });

    const { container } = render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Access denied' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to dashboard' }),
    ).toHaveAttribute('href', '/');
    expect(container.firstElementChild).toHaveClass('max-w-lg');
    expect(container.firstElementChild).not.toHaveClass('mx-auto');
  });

  it('links to first permitted route for limited operator without view_all_orders', () => {
    mockUseAuth.mockReturnValue({
      session: {
        permissions: ['access_admin', 'view_all_products', 'manage_products'],
      },
    });

    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Access denied' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
      'href',
      '/products',
    );
  });
});
