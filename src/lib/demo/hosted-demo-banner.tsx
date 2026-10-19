export default function HostedDemoBanner() {
  return (
    <p
      className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground"
      role="status"
      aria-live="polite"
    >
      Shared demo - admin is read-only; catalog and orders reset on a schedule.
      Sign in as viewer@store.local (see README).
    </p>
  );
}
