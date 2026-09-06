import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

type FocusOnRouteChangeProps = {
  targetId: string;
};

export function FocusOnRouteChange({ targetId }: FocusOnRouteChangeProps) {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }
    previousPath.current = pathname;
    document.getElementById(targetId)?.focus();
  }, [pathname, targetId]);

  return null;
}
