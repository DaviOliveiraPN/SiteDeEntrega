// API contract. The mock service must return exactly these shapes, and so will the real API.

export type MediaType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  sectionId: string | null;
  title: string | null;
  featured: boolean;
  thumbUrl: string;
  webUrl: string;
  originalUrl: string;
  width: number;
  height: number;
  durationSec?: number;
  sizeBytes: number;
}

export interface Section {
  id: string;
  name: string;
  order: number;
}

export interface ThemeTokens {
  ink: string;
  inkSoft: string;
  charcoal: string;
  cream: string;
  paper: string;
  muted: string;
  accent: string;
  lineDark: string;
}

export interface PageContent {
  slug: string;
  coupleNames: string;
  eventDate: string;
  letterMessage: string;
  coverImageUrl: string;
  openingVideoId: string | null;
  heroThumbIds: string[];
  theme: Partial<ThemeTokens> | null;
  expiresAt: string;
  sections: Section[];
  media: MediaItem[];
}

export interface Business {
  name: string;
  logoUrl: string;
  contact: { whatsapp?: string; email?: string; instagram?: string };
}

export type AccessResult =
  | { ok: true; slug: string; token: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'rate_limited' };
