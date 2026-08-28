import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppSidebar } from '@/components/layout/app-sidebar';

describe('AppSidebar', () => {
  it('renders navigation links from config', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
  });

  it('marks the current route as active', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
