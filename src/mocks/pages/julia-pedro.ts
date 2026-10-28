import type { Section } from '../../types';
import { buildMedia, picsum } from '../factory';
import type { MockPage } from './types';

// Small delivery: exercises layouts with few items.
const slug = 'julia-pedro';

const sections: Section[] = [
  { id: 'cerimonia', name: 'Cerimônia', order: 1 },
  { id: 'festa', name: 'Festa', order: 2 },
];

const media = buildMedia(slug, 77, [
  { section: sections[0], photos: 7, videos: [{ title: 'Nosso filme', featured: true }] },
  { section: sections[1], photos: 5, videos: [{ title: 'A festa', featured: true }] },
]);

export const juliaPedro: MockPage = {
  code: 'MAREVIVA7Q',
  content: {
    slug,
    coupleNames: 'Júlia & Pedro',
    eventDate: '2026-09-20',
    letterMessage: 'Um dia simples, à beira-mar, cheio de gente querida. Obrigado por nos deixarem contar essa história.',
    coverImageUrl: picsum(`${slug}-cover`, 1600, 2000),
    openingVideoId: `${slug}-cerimonia-v1`,
    heroThumbIds: [`${slug}-cerimonia-p1`, `${slug}-cerimonia-p2`, `${slug}-festa-p1`, `${slug}-festa-p2`],
    theme: null,
    expiresAt: '2027-02-28T23:59:59-03:00',
    sections,
    media,
  },
};
