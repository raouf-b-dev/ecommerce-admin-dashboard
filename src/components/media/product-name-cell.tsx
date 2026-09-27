import { ProductThumbnail } from '@/components/media/product-thumbnail';
import { cn } from '@/lib/utils';

type ProductNameCellProps = {
  name: string;
  imageUrl?: string | null;
  categoryId?: number | null;
  className?: string;
};

/** Thumbnail plus a truncated name with the full name on hover, for table rows. */
export function ProductNameCell({ name, imageUrl, categoryId, className }: ProductNameCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumbnail src={imageUrl} name={name} categoryId={categoryId} />
      <span className={cn('max-w-[16rem] truncate', className)} title={name}>
        {name}
      </span>
    </div>
  );
}
