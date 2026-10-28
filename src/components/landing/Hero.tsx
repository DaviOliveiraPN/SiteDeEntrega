import { useState } from 'react';
import { formatEventDate, relativeDayLabel } from '../../lib/dates';
import { altText } from '../../lib/media';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Business, MediaItem, PageContent } from '../../types';
import { Button } from '../ui/Button';
import { PlayIcon } from '../ui/icons';
import { Img } from '../ui/Img';

export function Hero({
  page,
  business,
  onPlayOpening,
}: {
  page: PageContent;
  business: Business;
  onPlayOpening: (video: MediaItem) => void;
}) {
  const reduced = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const opening = page.media.find((m) => m.id === page.openingVideoId && m.type === 'video') ?? null;
  const thumbs = page.heroThumbIds.map((id) => page.media.find((m) => m.id === id)).filter((m): m is MediaItem => !!m);
  const words = page.coupleNames.split(/\s+/);

  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-dvh flex-col items-center justify-end overflow-hidden px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
      <div aria-hidden="true" className="absolute inset-0 animate-ken-burns">
        <Img src={page.coverImageUrl} alt="" className="size-full object-cover" />
        {opening && !reduced && (
          <video
            src={opening.webUrl}
            poster={page.coverImageUrl}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            onPlaying={() => setVideoReady(true)}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink" />

      <div className="relative flex flex-col items-center gap-5 pb-16">
        {thumbs.length > 0 && (
          <ul className="flex animate-fade-in gap-2" aria-label="Prévia das fotos">
            {thumbs.map((m) => (
              <li key={m.id}>
                <Img src={m.thumbUrl} alt={altText(m, page)} className="h-16 w-12 rounded-thumb object-cover ring-1 ring-cream/20" />
              </li>
            ))}
          </ul>
        )}
        <p className="eyebrow text-accent">{business.name} apresenta</p>
        <h1 id="hero-title" className="font-serif text-5xl leading-none font-light md:text-7xl">
          {words.map((word, i) => (
            <span key={i} className="inline-block animate-rise" style={{ animationDelay: `${300 + i * 180}ms` }}>
              {word}
              {i < words.length - 1 && ' '}
            </span>
          ))}
        </h1>
        <p className="eyebrow text-cream/85">{formatEventDate(page.eventDate)}</p>
        <p className="font-serif text-lg italic text-cream/70">{relativeDayLabel(page.eventDate)}</p>
        {opening && (
          <Button className="mt-3" onClick={() => onPlayOpening(opening)}>
            <PlayIcon className="size-4" />
            Assistir ao vídeo de abertura
          </Button>
        )}
      </div>

      <p aria-hidden="true" className="relative flex animate-cue flex-col items-center gap-2 text-[10px] tracking-[0.4em] text-cream/55">
        ROLE PARA VER
        <span className="h-6 w-px bg-cream/40" />
      </p>
    </section>
  );
}
