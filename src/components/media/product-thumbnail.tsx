import { useState } from 'react';
import { PackageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_TINTS = [
  'bg-tint-1 text-tint-1-foreground',
  'bg-tint-2 text-tint-2-foreground',
  'bg-tint-3 text-tint-3-foreground',
  'bg-tint-4 text-tint-4-foreground',
  'bg-tint-5 text-tint-5-foreground',
] as const;

const ACCENT_TINT = 'bg-primary/10 text-primary';

const SIZES = {
  sm: 'h-10 w-10 rounded-md text-base',
  md: 'h-16 w-16 rounded-lg text-2xl',
  lg: 'h-40 w-40 rounded-xl text-6xl',
  /** Fills the container width as a square. */
  fill: 'aspect-square w-full rounded-xl text-7xl',
} as const;

export function placeholderTintClass(categoryId?: number | null): string {
  if (categoryId == null || !Number.isFinite(categoryId)) {
    return ACCENT_TINT;
  }
  const count = CATEGORY_TINTS.length;
  const index = ((Math.trunc(categoryId) % count) + count) % count;
  return CATEGORY_TINTS[index] ?? ACCENT_TINT;
}

function initialOf(name: string): string | null {
  const letter = name.trim().match(/[\p{L}\p{N}]/u)?.[0];
  return letter ? letter.toUpperCase() : null;
}

type ProductThumbnailProps = {
  src?: string | null;
  /** Product name. Used for the placeholder initial; the image itself is decorative. */
  name: string;
  /** Category id when the row carries one. Order lines omit it and get the accent tint. */
  categoryId?: number | null;
  size?: keyof typeof SIZES;
  className?: string;
};

/**
 * Square product image with a designed placeholder when the URL is missing or
 * fails to load. Same frame rules as the storefront, local to this app.
 */
export function ProductThumbnail({
  src,
  name,
  categoryId,
  size = 'sm',
  className,
}: ProductThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = src && src !== failedSrc ? src : null;
  const initial = initialOf(name);

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border bg-muted font-semibold select-none',
        SIZES[size],
        !imageSrc && placeholderTintClass(categoryId),
        className,
      )}
      aria-hidden="true"
      data-testid="product-thumbnail"
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(imageSrc)}
          className="h-full w-full object-cover"
        />
      ) : initial ? (
        <span className="leading-none opacity-80">{initial}</span>
      ) : (
        <PackageIcon className="size-1/2 opacity-70" />
      )}
    </div>
  );
}
