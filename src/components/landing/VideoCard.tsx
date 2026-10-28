import { formatDuration } from '../../lib/media';
import type { MediaItem } from '../../types';
import { PlayIcon } from '../ui/icons';
import { Img } from '../ui/Img';

/** 16:9 featured video: gradient, centered round play button, serif title (max 2 lines). */
export function VideoCard({ item, title, onPlay }: { item: MediaItem; title: string; onPlay: () => void }) {
  return (
    <button type="button" onClick={onPlay} aria-label={`Assistir: ${title}`} className="group relative block aspect-video w-full overflow-hidden rounded-card bg-charcoal/40 text-left">
      <Img src={item.thumbUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
        <span className="grid size-14 place-items-center rounded-full border border-cream/40 bg-ink/30 text-cream backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
          <PlayIcon className="ml-0.5 size-5" />
        </span>
      </span>
      <span className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
        <span className="line-clamp-2 font-serif text-xl leading-tight font-light text-cream">{title}</span>
        {item.durationSec !== undefined && <span className="shrink-0 text-[11px] text-cream/70">{formatDuration(item.durationSec)}</span>}
      </span>
    </button>
  );
}
