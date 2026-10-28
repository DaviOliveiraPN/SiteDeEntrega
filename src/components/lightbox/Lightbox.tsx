import { useEffect, useRef } from 'react';
import { altText } from '../../lib/media';
import type { MediaItem, PageContent } from '../../types';
import { ChevronLeft, ChevronRight, CloseIcon } from '../ui/icons';
import { Img } from '../ui/Img';
import { Sheet } from '../ui/Sheet';
import { DownloadMenu } from './DownloadMenu';

const SWIPE_MIN_PX = 50;

export function Lightbox({
  page,
  items,
  index,
  onIndexChange,
  onClose,
}: {
  page: PageContent;
  items: MediaItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const title = altText(item, page);

  const prev = () => hasPrev && onIndexChange(index - 1);
  const next = () => hasNext && onIndexChange(index + 1);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' && hasPrev) onIndexChange(index - 1);
      if (event.key === 'ArrowRight' && hasNext) onIndexChange(index + 1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, hasPrev, hasNext, onIndexChange]);

  // Warm the cache for the neighbours so swiping feels instant.
  useEffect(() => {
    for (const neighbour of [items[index - 1], items[index + 1]]) {
      if (neighbour?.type === 'photo') new Image().src = neighbour.webUrl;
    }
  }, [items, index]);

  const navButton =
    'absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-charcoal/40 text-cream backdrop-blur-sm hover:border-cream/45 disabled:opacity-0 sm:grid';

  return (
    <Sheet label="Visualizador de mídia" onClose={onClose} className="flex flex-col bg-ink">
      <header className="flex items-center justify-between gap-4 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <p className="text-xs tracking-widest text-cream/70" aria-live="polite">
          {index + 1} / {items.length}
        </p>
        <button type="button" data-autofocus onClick={onClose} aria-label="Fechar" className="-mr-2 grid size-11 place-items-center rounded-full text-cream/85 hover:text-cream">
          <CloseIcon />
        </button>
      </header>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20"
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(t.clientY - start.y)) {
            if (dx < 0) next();
            else prev();
          }
        }}
      >
        <button type="button" onClick={prev} disabled={!hasPrev} aria-label="Anterior" className={`${navButton} left-4`}>
          <ChevronLeft />
        </button>

        {item.type === 'video' ? (
          <video
            key={item.id}
            src={item.webUrl}
            poster={item.thumbUrl}
            controls
            autoPlay
            playsInline
            aria-label={title}
            className="max-h-full max-w-full animate-fade-in rounded-[12px] bg-black"
            style={{ aspectRatio: `${item.width} / ${item.height}` }}
          />
        ) : (
          <Img
            key={item.id}
            src={item.webUrl}
            alt={title}
            width={item.width}
            height={item.height}
            className="h-auto max-h-full w-auto max-w-full animate-fade-in rounded-[12px] object-contain"
          />
        )}

        <button type="button" onClick={next} disabled={!hasNext} aria-label="Próximo" className={`${navButton} right-4`}>
          <ChevronRight />
        </button>
      </div>

      <footer className="flex items-center justify-between gap-4 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="min-w-0 truncate font-serif text-lg font-light">{title}</p>
        <DownloadMenu key={item.id} item={item} />
      </footer>
    </Sheet>
  );
}
