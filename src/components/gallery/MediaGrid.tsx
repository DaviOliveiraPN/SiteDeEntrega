import { usePagination } from '../../hooks/usePagination';
import type { MediaItem } from '../../types';
import { Button } from '../ui/Button';
import { MediaTile } from './MediaTile';

export function MediaGrid({
  items,
  labelOf,
  onOpen,
}: {
  items: MediaItem[];
  labelOf: (item: MediaItem) => string;
  onOpen: (index: number) => void;
}) {
  const { visible, hasMore, showMore } = usePagination(items);

  if (items.length === 0) return <p className="py-16 text-center text-sm text-cream/70">Nenhum arquivo neste filtro.</p>;

  return (
    <div className="flex flex-col items-center gap-8">
      <ul className="grid w-full grid-cols-2 items-start gap-x-3 gap-y-5 md:grid-cols-3 xl:grid-cols-5">
        {visible.map((item, i) => (
          <MediaTile key={item.id} item={item} index={i} label={labelOf(item)} onOpen={() => onOpen(i)} />
        ))}
      </ul>
      {hasMore && (
        <Button variant="secondary" onClick={showMore}>
          Ver mais ({items.length - visible.length})
        </Button>
      )}
    </div>
  );
}
