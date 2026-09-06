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
