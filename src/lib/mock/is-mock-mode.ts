export function isMockMode(): boolean {
  return (
    import.meta.env.MODE === 'mock' ||
    import.meta.env.VITE_ENABLE_MOCK === 'true'
  );
}
