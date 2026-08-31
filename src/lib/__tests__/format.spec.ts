import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatStatusLabel,
} from '@/lib/format';

describe('format', () => {
  it('formats money with the operator locale when currency is valid', () => {
    const formatted = formatMoney(10, 'USD');
    expect(formatted).toMatch(/10/);
    expect(formatted).not.toBe('10 USD');
  });

  it('falls back when currency is missing or invalid', () => {
    expect(formatMoney(10, null)).toBe('10');
    expect(formatMoney(10, 'not-a-code')).toBe('10 not-a-code');
  });

  it('returns an em dash for empty dates and passes through invalid strings', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('formats valid ISO dates', () => {
    expect(formatDate('2025-01-15T00:00:00.000Z')).not.toBe('2025-01-15T00:00:00.000Z');
    expect(formatDateTime('2025-01-15T12:00:00.000Z')).not.toBe(
      '2025-01-15T12:00:00.000Z',
    );
  });

  it('humanizes status codes', () => {
    expect(formatStatusLabel('NEEDS_ATTENTION')).toBe('NEEDS ATTENTION');
  });
});
