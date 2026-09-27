import { Button } from '@/components/ui/button';

type TablePaginationProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function TablePagination({
  page,
  limit,
  total,
  onPageChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
