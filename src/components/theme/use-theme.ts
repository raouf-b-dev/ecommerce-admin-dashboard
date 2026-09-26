// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { useContext } from 'react';
import {
  ThemeContext,
  type ThemeProviderState,
} from '@/components/theme/theme-provider';

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
