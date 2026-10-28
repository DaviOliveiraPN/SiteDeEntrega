import { altText } from '../../lib/media';
import type { PageContent } from '../../types';
import { Button } from '../ui/Button';
import { Eyebrow } from '../ui/Eyebrow';
import { Img } from '../ui/Img';
import { Reveal } from '../ui/Reveal';

const PREVIEW_COUNT = 4;

function countLabel(photos: number, videos: number): string {
  const parts = [];
  if (photos) parts.push(`${photos} ${photos === 1 ? 'foto' : 'fotos'}`);
  if (videos) parts.push(`${videos} ${videos === 1 ? 'vídeo' : 'vídeos'}`);
  return parts.join(' · ');
}

export function Moments({ page, onOpenSection }: { page: PageContent; onOpenSection: (sectionId: string) => void }) {
  const sections = [...page.sections].sort((a, b) => a.order - b.order);

  return (
    <section aria-labelledby="moments-title" className="bg-ink-soft px-4 py-20 sm:px-6">
      <Reveal className="mb-12 flex flex-col items-center gap-3 text-center">
        <Eyebrow>Momentos</Eyebrow>
        <h2 id="moments-title" className="font-serif text-3xl font-light md:text-4xl">
          Reviva cada parte do dia
        </h2>
      </Reveal>

      <div className="mx-auto flex max-w-6xl flex-col divide-y divide-line-dark">
        {sections.map((section) => {
          const items = page.media.filter((m) => m.sectionId === section.id);
          if (items.length === 0) return null;
          const photos = items.filter((m) => m.type === 'photo');
          const preview = [...photos, ...items.filter((m) => m.type === 'video')].slice(0, PREVIEW_COUNT);
          const headingId = `moment-${section.id}`;
          return (
            <Reveal as="article" key={section.id} className="flex flex-col gap-5 py-10 md:flex-row md:items-center md:gap-10" aria-labelledby={headingId}>
              <div className="flex flex-col gap-2 md:w-64 md:shrink-0">
                <h3 id={headingId} className="font-serif text-3xl font-light">
                  {section.name}
                </h3>
                <p className="text-xs text-cream/70">{countLabel(photos.length, items.length - photos.length)}</p>
              </div>
              <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-1 md:px-0">
                {preview.map((m) => (
                  <li key={m.id} className="w-32 shrink-0 md:w-auto md:flex-1">
                    <Img src={m.thumbUrl} alt={altText(m, page)} loading="lazy" className="aspect-[3/4] w-full rounded-thumb object-cover" />
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="self-start md:self-center" onClick={() => onOpenSection(section.id)} aria-label={`Ver momento: ${section.name}`}>
                Ver momento
              </Button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
