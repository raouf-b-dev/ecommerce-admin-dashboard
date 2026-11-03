import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { PageBreadcrumbs } from '@/components/layout/page-breadcrumbs';

describe('PageBreadcrumbs', () => {
  it('renders a trail with a link for the parent and current page text', () => {
    render(
      <MemoryRouter>
        <PageBreadcrumbs
          items={[
            { label: 'Orders', to: '/orders' },
            { label: 'ORD-1' },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute(
      'href',
      '/orders',
    );
    expect(screen.getByText('ORD-1')).toHaveAttribute('aria-current', 'page');
  });

  it('renders nothing when items are empty', () => {
    const { container } = render(
      <MemoryRouter>
        <PageBreadcrumbs items={[]} />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
