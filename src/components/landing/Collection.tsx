import { useParallax } from '../../hooks/useParallax';
import { altText } from '../../lib/media';
import type { MediaItem, PageContent } from '../../types';
import { Button } from '../ui/Button';
import { Eyebrow } from '../ui/Eyebrow';
import { Img } from '../ui/Img';
import { Reveal } from '../ui/Reveal';
import { VideoCard } from './VideoCard';

export function Collection({
  page,
  onPlay,
  onOpenGallery,
}: {
  page: PageContent;
  onPlay: (items: MediaItem[], index: number) => void;
  onOpenGallery: () => void;
}) {
  const parallax = useParallax<HTMLDivElement>(0.2);
  const featured = page.media.filter((m) => m.featured && m.type === 'video');
  const banner = page.media.find((m) => m.type === 'photo' && m.width > m.height) ?? null;

  return (
    <section aria-labelledby="collection-title" className="bg-ink">
      <div className="relative h-[55vh] min-h-72 overflow-hidden">
        <div ref={parallax} className="absolute inset-x-0 -top-[15%] h-[130%]">
          <Img src={banner?.webUrl ?? page.coverImageUrl} alt="" loading="lazy" className="size-full object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/40 to-ink" />
        <Reveal className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 px-6 text-center">
          <Eyebrow>Sua coleção</Eyebrow>
          <h2 id="collection-title" className="font-serif text-3xl font-light md:text-4xl">
            Os vídeos da sua história
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pt-6 pb-20 sm:px-6">
        {featured.length > 0 && (
          <ul className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, i) => (
              <Reveal as="li" key={item.id} delayMs={(i % 3) * 120}>
                <VideoCard item={item} title={altText(item, page)} onPlay={() => onPlay(featured, i)} />
              </Reveal>
            ))}
          </ul>
        )}
        <Button variant="secondary" onClick={onOpenGallery}>
          Ver todos os arquivos ({page.media.length})
        </Button>
      </div>
    </section>
  );
}
