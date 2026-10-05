import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { ThemeProvider } from '@/components/theme/theme-provider';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/mock/is-mock-mode', () => ({
  isMockMode: () => false,
}));

describe('AppLayout', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      session: {
        email: 'admin@store.local',
        permissions: ['view_all_products', 'view_all_orders'],
      },
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    mockUseAuth.mockReset();
  });

  function renderLayout() {
    return render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<div>Dashboard content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );
  }

  it('renders a skip link targeting the main content landmark', () => {
    renderLayout();

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
  });

  it('configures responsive grid columns switching to two columns at desktop widths', () => {
    const { container } = renderLayout();

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'xl:grid-cols-[260px_1fr]');
  });

  it('hides the fixed sidebar below desktop width so off-canvas nav is used', () => {
    renderLayout();

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('hidden', 'xl:flex');
  });

  it('applies min-w-0 to the content container to contain wide child scrolling', () => {
    renderLayout();

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-w-0');
    expect(main.parentElement).toHaveClass('min-w-0');
  });

  it('renders mobile navigation trigger in the header for small screens', () => {
    renderLayout();

    const mobileMenuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveClass('xl:hidden');
  });
});
