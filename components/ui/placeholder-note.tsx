export function PlaceholderNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
      {children}
    </p>
  );
}
