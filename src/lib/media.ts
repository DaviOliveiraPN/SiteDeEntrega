import type { MediaItem, PageContent } from '../types';

export type DownloadVariant = 'web' | 'original';

export function mediaUrl(item: MediaItem, variant: DownloadVariant): string {
  return variant === 'web' ? item.webUrl : item.originalUrl;
}

function extension(item: MediaItem, url: string): string {
  const match = /\.(\w{2,4})(?:\?|$)/.exec(new URL(url, 'http://x').pathname);
  return match ? match[1] : item.type === 'video' ? 'mp4' : 'jpg';
}

/** "marina-lucas-cerimonia-p3.jpg" */
export function fileName(item: MediaItem, variant: DownloadVariant): string {
  return `${item.id}.${extension(item, mediaUrl(item, variant))}`;
}

/** "Foto 3 de Marina & Lucas" when the item has no title. */
export function altText(item: MediaItem, page: Pick<PageContent, 'coupleNames' | 'media'>): string {
  if (item.title) return item.title;
  const sameType = page.media.filter((m) => m.type === item.type);
  const n = sameType.indexOf(item) + 1;
  return `${item.type === 'video' ? 'Vídeo' : 'Foto'} ${n} de ${page.coupleNames}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  if (bytes < 1_000_000_000) return `${Math.round(bytes / 1_000_000)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(1).replace('.', ',')} GB`;
}

/** 754 -> "12:34" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** "Cerimônia" -> "cerimonia" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
