import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme/use-theme';
import {
  SegmentedControl,
  type SegmentOption,
} from '@/components/ui/segmented-control';
import type { Theme } from '@/components/theme/theme-constants';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options: SegmentOption<Theme>[] = [
    {
      value: 'light',
      label: <Sun className="h-3.5 w-3.5" aria-hidden="true" />,
      ariaLabel: 'Light theme',
      title: 'Light theme',
    },
    {
      value: 'dark',
      label: <Moon className="h-3.5 w-3.5" aria-hidden="true" />,
      ariaLabel: 'Dark theme',
      title: 'Dark theme',
    },
    {
      value: 'system',
      label: <Laptop className="h-3.5 w-3.5" aria-hidden="true" />,
      ariaLabel: `System theme (currently ${resolvedTheme})`,
      title: `System theme (currently ${resolvedTheme})`,
    },
  ];

  return (
    <SegmentedControl
      options={options}
      value={theme}
      onChange={setTheme}
      size="sm"
      ariaLabel="Theme selector"
      className={className}
    />
  );
}
