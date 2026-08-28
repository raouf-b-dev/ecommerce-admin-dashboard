import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ForbiddenPage } from '@/features/auth/pages/forbidden-page';

describe('ForbiddenPage', () => {
  it('renders access denied messaging', () => {
    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Access denied' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
