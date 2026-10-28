import type { Section } from '../../types';
import { buildMedia, picsum } from '../factory';
import type { MockPage } from './types';

// Expired delivery: the code is right but the page is past `expiresAt`.
const slug = 'bia-rafa';

const sections: Section[] = [{ id: 'festa', name: 'Festa', order: 1 }];

export const expiredEvent: MockPage = {
  code: 'OUTONO48XZ',
  content: {
    slug,
    coupleNames: 'Bia & Rafa',
    eventDate: '2026-02-07',
    letterMessage: 'Que alegria ter feito parte desse dia.',
    coverImageUrl: picsum(`${slug}-cover`, 1600, 2000),
    openingVideoId: null,
    heroThumbIds: [],
    theme: null,
    expiresAt: '2026-05-08T23:59:59-03:00',
    sections,
    media: buildMedia(slug, 9, [{ section: sections[0], photos: 4, videos: [] }]),
  },
};
