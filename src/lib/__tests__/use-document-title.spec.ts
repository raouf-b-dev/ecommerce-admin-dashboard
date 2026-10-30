import { renderHook } from '@testing-library/react';
import {
  DOCUMENT_TITLE_SUFFIX,
  formatDocumentTitle,
  useDocumentTitle,
} from '@/lib/use-document-title';

describe('formatDocumentTitle', () => {
  it('returns the suffix alone for blank titles', () => {
    expect(formatDocumentTitle('')).toBe(DOCUMENT_TITLE_SUFFIX);
    expect(formatDocumentTitle('   ')).toBe(DOCUMENT_TITLE_SUFFIX);
  });

  it('joins the page title with the admin suffix', () => {
    expect(formatDocumentTitle('Orders')).toBe(
      `Orders | ${DOCUMENT_TITLE_SUFFIX}`,
    );
  });
});

describe('useDocumentTitle', () => {
  const previousTitle = document.title;

  afterEach(() => {
    document.title = previousTitle;
  });

  it('sets document.title when the page title changes', () => {
    const { rerender } = renderHook(
      ({ title }: { title: string }) => {
        useDocumentTitle(title);
      },
      { initialProps: { title: 'Orders' } },
    );

    expect(document.title).toBe(`Orders | ${DOCUMENT_TITLE_SUFFIX}`);

    rerender({ title: 'Products' });
    expect(document.title).toBe(`Products | ${DOCUMENT_TITLE_SUFFIX}`);
  });
});
