/** Hosted shared demo (Cloudflare Pages). Independent of MSW mock mode. */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}
