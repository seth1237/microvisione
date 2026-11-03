export function HeaderFallback() {
  return (
    <div className="border-b border-white/50 bg-surface/70 backdrop-blur-xl" aria-hidden="true">
      <div className="h-9 bg-black/80" />
      <div className="mx-auto h-16 max-w-6xl" />
      <div className="hidden h-12 border-t border-line lg:block" />
    </div>
  );
}
