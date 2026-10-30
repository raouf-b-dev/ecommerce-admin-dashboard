import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { DocumentTitle } from '@/components/layout/document-title';
import { DOCUMENT_TITLE_SUFFIX } from '@/lib/use-document-title';

describe('DocumentTitle', () => {
  const previousTitle = document.title;

  afterEach(() => {
    document.title = previousTitle;
  });

  it('sets document.title from the deepest route handle', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <DocumentTitle />,
          handle: { title: 'Shell' },
          children: [
            {
              path: 'orders',
              element: <div>Orders</div>,
              handle: { title: 'Orders' },
            },
          ],
        },
      ],
      { initialEntries: ['/orders'] },
    );

    render(<RouterProvider router={router} />);

    expect(document.title).toBe(`Orders | ${DOCUMENT_TITLE_SUFFIX}`);
  });

  it('falls back to Admin when no route handle title is present', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <DocumentTitle />,
          children: [{ index: true, element: <div>Home</div> }],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(document.title).toBe(`Admin | ${DOCUMENT_TITLE_SUFFIX}`);
  });
});
