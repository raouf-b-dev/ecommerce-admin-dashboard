import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl } from '@/lib/api/api-base-url';

describe('getApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.__APP_CONFIG__;
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

  it('prefers the runtime /config.js value over VITE_API_BASE_URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://build.example.com');
    window.__APP_CONFIG__ = { apiBaseUrl: 'https://runtime.example.com/' };
    expect(getApiBaseUrl()).toBe('https://runtime.example.com');
  });

  it('falls back to VITE_API_BASE_URL when the runtime value is empty', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://build.example.com');
    window.__APP_CONFIG__ = { apiBaseUrl: '  ' };
    expect(getApiBaseUrl()).toBe('https://build.example.com');
  });

  it('names API_BASE_URL when the runtime value is not an absolute http(s) URL', () => {
    window.__APP_CONFIG__ = { apiBaseUrl: 'api.example.com' };
    expect(() => getApiBaseUrl()).toThrow(
      /^API_BASE_URL must be an absolute http\(s\) URL/,
    );
  });
});
