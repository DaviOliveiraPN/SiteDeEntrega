export function Spinner({ label = 'Carregando', className = '' }: { label?: string; className?: string }) {
  return (
    <span role="status" className={`inline-flex items-center ${className}`}>
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none motion-reduce:border-r-current/40"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function FullScreenSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink text-cream/70">
      <Spinner />
    </div>
  );
}
