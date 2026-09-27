import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { MobileNav } from '@/components/layout/mobile-nav';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('MobileNav', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      session: {
        permissions: ['view_all_products', 'view_all_orders'],
      },
    });
  });

  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('opens from the menu button and closes on Escape', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: 'Open navigation menu' });
    await user.click(trigger);
    expect(screen.getByRole('link', { name: 'Products' })).toBeVisible();

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});
