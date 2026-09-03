import { Laptop, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/use-theme';
import type { Theme } from '@/components/theme/theme-constants';

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    setTheme(NEXT_THEME[theme]);
  }

  const label = `Current theme: ${theme} (resolved: ${resolvedTheme}). Click to switch theme.`;

  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className="h-9 w-9 shrink-0"
    >
      {theme === 'system' ? (
        <Laptop className="h-4 w-4" aria-hidden="true" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
