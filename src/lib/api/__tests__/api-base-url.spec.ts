import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl } from '@/lib/api/api-base-url';

describe('getApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('strips trailing slashes from an absolute http(s) URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
    expect(getApiBaseUrl()).toBe('https://api.example.com');
  });

  it('falls back to localhost when unset outside production', () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_API_BASE_URL', '');
    expect(getApiBaseUrl()).toBe('http://localhost:3000');
  });

  it('throws when unset in production', () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_API_BASE_URL', '');
    expect(() => getApiBaseUrl()).toThrow(
      /must be configured for production/,
    );
  });

  it('throws when the value is not an absolute http(s) URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'api.example.com');
    expect(() => getApiBaseUrl()).toThrow(/absolute http\(s\) URL/);
  });
});
