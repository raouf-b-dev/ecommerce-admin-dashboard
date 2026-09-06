import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export type SegmentOption<T extends string | number> = {
  value: T;
  label: React.ReactNode;
  ariaLabel?: string;
  title?: string;
};

type SegmentedControlProps<T extends string | number> = {
  options: readonly SegmentOption<T>[] | SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
};

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = 'md',
  ariaLabel = 'Segmented selector',
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = options.length - 1;
    }

    const targetOption = options[nextIndex];
    if (nextIndex !== index && targetOption) {
      onChange(targetOption.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center rounded-lg border border-border bg-muted/60 p-1 text-muted-foreground',
        className,
      )}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const ariaLabelText =
          option.ariaLabel ??
          (typeof option.label === 'string' ? option.label : undefined);
        const titleText = option.title ?? ariaLabelText;
        return (
          <button
            key={String(option.value)}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            tabIndex={isSelected ? 0 : -1}
            aria-checked={isSelected}
            aria-label={ariaLabelText}
            title={titleText}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'rounded-md font-medium transition-all duration-150',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'hover:text-foreground hover:bg-background/40',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
