import { useMemo } from 'react';
import { useMatches } from 'react-router';
import { useDocumentTitle } from '@/lib/use-document-title';

type TitleHandle = {
  title?: string;
};

function isTitleHandle(handle: unknown): handle is TitleHandle {
  if (typeof handle !== 'object' || handle === null) {
    return false;
  }
  if (!('title' in handle)) {
    return false;
  }
  return typeof handle.title === 'string' || handle.title === undefined;
}

/**
 * Sets the document title from the deepest matched route `handle.title`.
 * Pages that render `PageHeader` (or call `useDocumentTitle`) override this.
 */
export function DocumentTitle() {
  const matches = useMatches();
  const pageTitle = useMemo(() => {
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const handle = matches[index]?.handle;
      if (isTitleHandle(handle) && handle.title) {
        return handle.title;
      }
    }
    return 'Admin';
  }, [matches]);

  useDocumentTitle(pageTitle);
  return null;
}
