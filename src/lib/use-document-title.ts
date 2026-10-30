import { useEffect } from 'react';

export const DOCUMENT_TITLE_SUFFIX = 'E-commerce Admin';

export function formatDocumentTitle(pageTitle: string): string {
  const trimmed = pageTitle.trim();
  if (!trimmed) {
    return DOCUMENT_TITLE_SUFFIX;
  }
  return `${trimmed} | ${DOCUMENT_TITLE_SUFFIX}`;
}

/** Sets `document.title` for the active view. */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = formatDocumentTitle(pageTitle);
  }, [pageTitle]);
}
