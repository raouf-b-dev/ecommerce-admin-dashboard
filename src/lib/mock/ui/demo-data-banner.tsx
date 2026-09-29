export default function DemoDataBanner() {
  return (
    <p
      className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground"
      role="status"
      aria-live="polite"
    >
      Demo data, resets on reload
    </p>
  );
}
