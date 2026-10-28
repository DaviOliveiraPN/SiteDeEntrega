import type { MediaItem, Section } from '../types';
import { slugify } from './media';

export type TypeFilter = 'all' | 'video' | 'photo';

export interface GalleryFilter {
  type: TypeFilter;
  sectionId: string | null;
}

export const ALL: GalleryFilter = { type: 'all', sectionId: null };

export function filterMedia(media: MediaItem[], filter: GalleryFilter): MediaItem[] {
  return media.filter(
    (m) => (filter.type === 'all' || m.type === filter.type) && (filter.sectionId === null || m.sectionId === filter.sectionId),
  );
}

/** Counts shown in the segmented control, within the selected section. */
export function typeCounts(media: MediaItem[], sectionId: string | null): Record<TypeFilter, number> {
  const inSection = filterMedia(media, { type: 'all', sectionId });
  const videos = inSection.filter((m) => m.type === 'video').length;
  return { all: inSection.length, video: videos, photo: inSection.length - videos };
}

export function downloadAllLabel(filter: GalleryFilter): string {
  if (filter.sectionId) return 'Baixar este momento';
  if (filter.type === 'photo') return 'Baixar as fotos';
  if (filter.type === 'video') return 'Baixar os vídeos';
  return 'Baixar tudo';
}

/** "<slug>-<filter>.zip", e.g. "marina-lucas-tudo.zip", "marina-lucas-cerimonia-fotos.zip". */
export function zipName(slug: string, filter: GalleryFilter, sections: Section[]): string {
  const section = sections.find((s) => s.id === filter.sectionId);
  const parts = [slug];
  if (section) parts.push(slugify(section.name));
  if (filter.type !== 'all') parts.push(filter.type === 'photo' ? 'fotos' : 'videos');
  if (parts.length === 1) parts.push('tudo');
  return `${parts.join('-')}.zip`;
}
