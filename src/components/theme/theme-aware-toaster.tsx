// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';
import { useTheme } from '@/components/theme/use-theme';

export function ThemeAwareToaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme}
      richColors
      closeButton
      position="top-right"
      {...props}
    />
  );
}
