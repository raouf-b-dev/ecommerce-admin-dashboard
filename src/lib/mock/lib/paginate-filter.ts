export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function parsePositiveInt(
  value: string | null,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseOptionalBoolean(value: string | null): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

export function parseOptionalNumber(value: string | null): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

export function sortByKey<T>(
  items: T[],
  sortBy: string | null,
  sortOrder: string | null,
  accessors: Record<string, (item: T) => string | number>,
): T[] {
  if (!sortBy || !(sortBy in accessors)) {
    return items;
  }

  const accessor = accessors[sortBy];
  if (!accessor) {
    return items;
  }

  const direction = sortOrder === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = accessor(a);
    const right = accessor(b);
    if (left < right) {
      return -1 * direction;
    }
    if (left > right) {
      return 1 * direction;
    }
    return 0;
  });
}
