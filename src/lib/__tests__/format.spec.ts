import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatPercentDelta,
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

  it('formats percentage deltas with signs and n/a fallback', () => {
    expect(formatPercentDelta(30)).toBe('+30%');
    expect(formatPercentDelta(12.34)).toBe('+12.3%');
    expect(formatPercentDelta(-5.67)).toBe('-5.7%');
    expect(formatPercentDelta(0)).toBe('0%');
    expect(formatPercentDelta(null)).toBe('n/a');
  });
});
