import { formatDuration } from '../../lib/media';
import type { MediaItem } from '../../types';
import { PlayIcon } from '../ui/icons';
import { Img } from '../ui/Img';

export function MediaTile({ item, label, index, onOpen }: { item: MediaItem; label: string; index: number; onOpen: () => void }) {
  const isVideo = item.type === 'video';
  return (
    <li className="animate-rise" style={{ animationDelay: `${(index % 20) * 35}ms` }}>
      <button type="button" onClick={onOpen} className="group block w-full text-left" aria-label={`${isVideo ? 'Assistir' : 'Ver'}: ${label}`}>
        <span className={`relative block overflow-hidden rounded-thumb bg-charcoal/40 ${isVideo ? 'aspect-video' : 'aspect-[3/4]'}`}>
          <Img src={item.thumbUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {isVideo && (
            <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-ink/20">
              <span className="grid size-10 place-items-center rounded-full border border-cream/40 bg-ink/30 backdrop-blur-sm">
                <PlayIcon className="ml-0.5 size-4" />
              </span>
            </span>
          )}
          {isVideo && item.durationSec !== undefined && (
            <span className="absolute right-2 bottom-2 rounded-sm bg-ink/60 px-1.5 text-[11px] text-cream/85">{formatDuration(item.durationSec)}</span>
          )}
        </span>
        <span className="mt-2 block truncate text-xs text-cream/70">{label}</span>
      </button>
    </li>
  );
}
