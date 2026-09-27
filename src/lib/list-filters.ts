export function parsePositiveInt(
  value: unknown,
): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isInteger(n) && n > 0) {
    return n;
  }
  return undefined;
}

export function parseNonNegativeNumber(
  value: unknown,
): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(n) && n >= 0) {
    return n;
  }
  return undefined;
}

export function parseIsActiveParam(
  value: string | null,
): boolean | undefined {
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  return undefined;
}

export function toApiDateStart(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  return value;
}
