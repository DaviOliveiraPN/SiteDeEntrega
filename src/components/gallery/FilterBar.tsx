import type { GalleryFilter, TypeFilter } from '../../lib/gallery';
import type { Section } from '../../types';

const TYPE_LABELS: Record<TypeFilter, string> = { all: 'Tudo', video: 'Vídeos', photo: 'Fotos' };

export function FilterBar({
  filter,
  counts,
  sections,
  onChange,
}: {
  filter: GalleryFilter;
  counts: Record<TypeFilter, number>;
  sections: Section[];
  onChange: (filter: GalleryFilter) => void;
}) {
  const chips = [{ id: null, name: 'Todas' }, ...[...sections].sort((a, b) => a.order - b.order)];

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Tipo de arquivo" className="grid w-full max-w-md grid-cols-3 rounded-full border border-cream/20 bg-charcoal/40 p-1">
        {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((type) => {
          const active = filter.type === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ ...filter, type })}
              className={`min-h-10 rounded-full text-xs font-medium transition-colors ${active ? 'bg-cream text-ink' : 'text-cream/70 hover:text-cream'}`}
            >
              {TYPE_LABELS[type]} <span className={active ? 'text-ink/60' : 'text-cream/55'}>{counts[type]}</span>
            </button>
          );
        })}
      </div>

      {sections.length > 1 && (
        <div role="radiogroup" aria-label="Momento" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {chips.map((chip) => {
            const active = filter.sectionId === chip.id;
            return (
              <button
                key={chip.id ?? 'all'}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ ...filter, sectionId: chip.id })}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-xs transition-colors ${active ? 'border-cream/70 bg-cream/10 text-cream' : 'border-cream/20 text-cream/70 hover:border-cream/45'}`}
              >
                {chip.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
