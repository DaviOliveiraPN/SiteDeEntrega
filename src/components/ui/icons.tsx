// Inline icons (no icon font / external requests). All decorative: pair with visible text or aria-label.
const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const PlayIcon = ({ className = '' }: { className?: string }) => (
  <svg {...common} className={className} fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z" /></svg>
);
export const CloseIcon = () => <svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const ChevronLeft = () => <svg {...common}><path d="M15 5l-7 7 7 7" /></svg>;
export const ChevronRight = () => <svg {...common}><path d="M9 5l7 7-7 7" /></svg>;
export const ArrowLeft = () => <svg {...common} width={18} height={18}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
export const DownloadIcon = () => <svg {...common} width={18} height={18}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>;
