import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/layout/page-header';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Summary widgets and operational snapshots."
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Summary widgets and operational snapshots.'),
    ).toBeInTheDocument();
  });
});
