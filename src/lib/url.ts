/** Returns the normalized URL when `value` is an absolute http(s) URL, otherwise null. */
export function parseHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
