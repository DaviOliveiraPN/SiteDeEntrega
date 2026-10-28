import type { MediaItem, Section } from '../types';

// Seeded helpers so the fictitious pages are big but deterministic (same data on every reload).

/** mulberry32: tiny deterministic PRNG returning floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const VIDEO_FILES = ['/mock/videos/clip-1.webm', '/mock/videos/clip-2.webm', '/mock/videos/clip-3.webm'];

export function picsum(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/** Same image at a given width, keeping the aspect ratio. */
function scaled(seed: string, width: number, height: number, targetWidth: number): string {
  return picsum(seed, targetWidth, Math.round((height / width) * targetWidth));
}

export function makePhoto(id: string, sectionId: string | null, rand: () => number): MediaItem {
  const portrait = rand() < 0.65;
  const [width, height] = portrait ? [3000, 4000] : [4000, 2667];
  return {
    id,
    type: 'photo',
    sectionId,
    title: null,
    featured: false,
    thumbUrl: scaled(id, width, height, 400),
    webUrl: scaled(id, width, height, 2048),
    originalUrl: picsum(id, width, height),
    width,
    height,
    sizeBytes: Math.round(2_500_000 + rand() * 4_000_000),
  };
}

export function makeVideo(
  id: string,
  sectionId: string | null,
  title: string,
  featured: boolean,
  rand: () => number,
): MediaItem {
  const file = VIDEO_FILES[Math.floor(rand() * VIDEO_FILES.length)];
  return {
    id,
    type: 'video',
    sectionId,
    title,
    featured,
    thumbUrl: picsum(id, 640, 360),
    webUrl: file,
    // The mock has no separate high-quality file; the real API will.
    originalUrl: file,
    width: 1920,
    height: 1080,
    durationSec: Math.round(30 + rand() * 600),
    sizeBytes: Math.round(80_000_000 + rand() * 900_000_000),
  };
}

export interface SectionPlan {
  section: Section;
  photos: number;
  videos: { title: string; featured?: boolean }[];
}

/** Builds the media list of a page: each section gets its videos first, then its photos. */
export function buildMedia(slug: string, seed: number, plan: SectionPlan[]): MediaItem[] {
  const rand = seededRandom(seed);
  const media: MediaItem[] = [];
  for (const { section, photos, videos } of plan) {
    videos.forEach((v, i) => {
      media.push(makeVideo(`${slug}-${section.id}-v${i + 1}`, section.id, v.title, v.featured ?? false, rand));
    });
    for (let i = 0; i < photos; i++) {
      media.push(makePhoto(`${slug}-${section.id}-p${i + 1}`, section.id, rand));
    }
  }
  return media;
}
