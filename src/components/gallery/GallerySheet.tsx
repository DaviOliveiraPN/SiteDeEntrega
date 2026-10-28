import { useMemo, useState } from 'react';
import { downloadAllLabel, filterMedia, typeCounts, zipName, type GalleryFilter } from '../../lib/gallery';
import { altText } from '../../lib/media';
import type { MediaItem, PageContent } from '../../types';
import { Button } from '../ui/Button';
import { ArrowLeft, DownloadIcon } from '../ui/icons';
import { Sheet } from '../ui/Sheet';
import { DownloadAllDialog } from './DownloadAllDialog';
import { FilterBar } from './FilterBar';
import { MediaGrid } from './MediaGrid';

export function GallerySheet({
  page,
  initialFilter,
  onClose,
  onOpenItem,
  covered = false,
}: {
  page: PageContent;
  initialFilter: GalleryFilter;
  onClose: () => void;
  onOpenItem: (items: MediaItem[], index: number) => void;
  /** Another modal (lightbox) is on top: make this one inert. */
  covered?: boolean;
}) {
  const [filter, setFilter] = useState(initialFilter);
  const [downloading, setDownloading] = useState(false);
  const items = useMemo(() => filterMedia(page.media, filter), [page.media, filter]);
  const counts = useMemo(() => typeCounts(page.media, filter.sectionId), [page.media, filter.sectionId]);
  const section = page.sections.find((s) => s.id === filter.sectionId);
  const label = downloadAllLabel(filter);

  return (
    <Sheet label="Todos os arquivos" onClose={onClose} inert={covered} className="overflow-y-auto overscroll-contain bg-ink">
      <header className="sticky top-0 z-10 border-b border-line-dark bg-ink/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <button type="button" data-autofocus onClick={onClose} className="-ml-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-cream/85 hover:text-cream">
            <ArrowLeft /> Voltar
          </button>
          <p className="eyebrow whitespace-nowrap text-accent">{page.media.length} arquivos</p>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-6 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6">
        <h2 className="font-serif text-3xl font-light">Todos os arquivos</h2>
        <FilterBar filter={filter} counts={counts} sections={page.sections} onChange={setFilter} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-cream/70" aria-live="polite">
            {items.length} {items.length === 1 ? 'arquivo' : 'arquivos'}
            {section ? ` em ${section.name}` : ''}. Toque para ver em tela cheia.
          </p>
          {items.length > 0 && (
            <Button variant="secondary" onClick={() => setDownloading(true)} className="self-start">
              <DownloadIcon /> {label}
            </Button>
          )}
        </div>

        <MediaGrid
          key={`${filter.type}-${filter.sectionId}`}
          items={items}
          labelOf={(m) => altText(m, page)}
          onOpen={(index) => onOpenItem(items, index)}
        />
      </div>

      {downloading && (
        <DownloadAllDialog items={items} title={label} zipName={zipName(page.slug, filter, page.sections)} onClose={() => setDownloading(false)} />
      )}
    </Sheet>
  );
}
