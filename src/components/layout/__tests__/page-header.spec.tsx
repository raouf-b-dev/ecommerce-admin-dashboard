import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/layout/page-header';
import { DOCUMENT_TITLE_SUFFIX } from '@/lib/use-document-title';

describe('PageHeader', () => {
  const previousTitle = document.title;

  afterEach(() => {
    document.title = previousTitle;
  });

  it('renders title and description', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Summary widgets and operational snapshots."
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Summary widgets and operational snapshots.'),
    ).toBeInTheDocument();
  });

  it('sets the document title from the page heading', () => {
    render(
      <PageHeader
        title="Orders"
        description="Browse and filter customer orders."
      />,
    );

    expect(document.title).toBe(`Orders | ${DOCUMENT_TITLE_SUFFIX}`);
  });
});

