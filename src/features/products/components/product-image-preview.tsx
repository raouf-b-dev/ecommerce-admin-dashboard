import { useState } from 'react';
import { ProductThumbnail } from '@/components/media/product-thumbnail';
import { useDebouncedValue } from '@/features/products/hooks/use-debounced-value';
import { parseHttpUrl } from '@/lib/url';

type PreviewStatus = 'empty' | 'invalid' | 'loading' | 'loaded' | 'error';

/** Wait for typing to pause so partial URLs are never requested. */
const PROBE_DELAY_MS = 400;

const MESSAGES: Record<PreviewStatus, string> = {
  empty: 'No image yet. Shoppers see the lettered placeholder.',
  invalid: 'The preview appears once the URL is complete.',
  loading: 'Loading preview...',
  loaded: 'This is how the image appears in the catalog.',
  error:
    'This image could not be loaded. Check that the URL is public and allows loading from other sites.',
};

type ProductImagePreviewProps = {
  url: string;
  name: string;
  categoryId?: number | null;
};

/**
 * Live preview of the image URL field. Field validation owns the error text
 * for malformed URLs; this reports loading and unreachable images.
 */
export function ProductImagePreview({ url, name, categoryId }: ProductImagePreviewProps) {
  const trimmed = url.trim();
  const typedSrc = trimmed ? parseHttpUrl(trimmed) : null;
  const debouncedTrimmed = useDebouncedValue(trimmed, PROBE_DELAY_MS);
  const probeSrc = debouncedTrimmed ? parseHttpUrl(debouncedTrimmed) : null;
  const [result, setResult] = useState<{ src: string; ok: boolean } | null>(null);

  let status: PreviewStatus;
  if (!trimmed) status = 'empty';
  else if (!typedSrc) status = 'invalid';
  else if (probeSrc !== typedSrc || result?.src !== typedSrc) status = 'loading';
  else status = result.ok ? 'loaded' : 'error';

  return (
    <div
      className="flex items-center gap-4 rounded-lg border border-dashed bg-muted/20 p-3"
      data-testid="product-image-preview"
      data-status={status}
    >
      <div className="relative">
        <ProductThumbnail
          src={status === 'loaded' ? typedSrc : null}
          name={name}
          categoryId={categoryId}
          size="md"
        />
        {probeSrc ? (
          <img
            key={probeSrc}
            src={probeSrc}
            alt=""
            className="hidden"
            onLoad={() => setResult({ src: probeSrc, ok: true })}
            onError={() => setResult({ src: probeSrc, ok: false })}
          />
        ) : null}
      </div>
      <p
        className={
          status === 'error' ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'
        }
        role={status === 'error' ? 'alert' : undefined}
        aria-live="polite"
      >
        {MESSAGES[status]}
      </p>
    </div>
  );
}
