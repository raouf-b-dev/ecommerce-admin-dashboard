import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { useTheme } from '@/components/theme/use-theme';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { THEME_STORAGE_KEY } from '@/components/theme/theme-constants';

function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button type="button" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        Set Light
      </button>
    </div>
  );
}

describe('ThemeProvider and ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('provides default theme and applies resolved class to document', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates theme, updates document class and persists to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Set Dark' }));

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Set Light' }));

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('ThemeToggle allows selecting themes directly', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Initial light
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Click dark option -> should become dark
    await user.click(screen.getByRole('radio', { name: /dark theme/i }));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // Click system option -> should become system
    await user.click(screen.getByRole('radio', { name: /system theme/i }));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');

    // Click light option -> should become light
    await user.click(screen.getByRole('radio', { name: /light theme/i }));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });
});
