import type { Section } from '../../types';
import { buildMedia, picsum } from '../factory';
import type { MockPage } from './types';

const slug = 'marina-lucas';

const sections: Section[] = [
  { id: 'making-of', name: 'Making of', order: 1 },
  { id: 'cerimonia', name: 'Cerimônia', order: 2 },
  { id: 'festa', name: 'Festa', order: 3 },
  { id: 'ensaio', name: 'Ensaio', order: 4 },
];

const media = buildMedia(slug, 2026, [
  {
    section: sections[0],
    photos: 12,
    videos: [{ title: 'Preparativos da noiva', featured: true }, { title: 'Preparativos do noivo' }, { title: 'Detalhes' }, { title: 'O vestido' }],
  },
  {
    section: sections[1],
    photos: 18,
    videos: [
      { title: 'Filme do casamento', featured: true },
      { title: 'Cerimônia completa', featured: true },
      { title: 'Entrada da noiva', featured: true },
      { title: 'Votos' },
      { title: 'Saída dos noivos' },
      { title: 'Depoimentos dos padrinhos' },
    ],
  },
  {
    section: sections[2],
    photos: 20,
    videos: [
      { title: 'Primeira dança', featured: true },
      { title: 'Dança do vestido', featured: true },
      { title: 'Discurso dos pais' },
      { title: 'Pista de dança' },
      { title: 'Corte do bolo' },
      { title: 'Buquê' },
      { title: 'Melhores momentos da festa' },
    ],
  },
  {
    section: sections[3],
    photos: 10,
    videos: [{ title: 'Ensaio no pôr do sol' }, { title: 'Bastidores do ensaio' }, { title: 'Making of do ensaio' }],
  },
]);

export const marinaLucas: MockPage = {
  code: 'AURORA2026K',
  content: {
    slug,
    coupleNames: 'Marina & Lucas',
    eventDate: '2026-08-15',
    letterMessage:
      'Foi uma honra caminhar ao lado de vocês neste dia. Cada olhar, cada abraço e cada riso ficou guardado aqui, para que vocês possam voltar a ele sempre que quiserem.',
    coverImageUrl: picsum(`${slug}-cover`, 1600, 2000),
    openingVideoId: `${slug}-cerimonia-v1`,
    heroThumbIds: [`${slug}-making-of-p1`, `${slug}-cerimonia-p2`, `${slug}-festa-p3`, `${slug}-ensaio-p1`],
    theme: null,
    expiresAt: '2027-03-31T23:59:59-03:00',
    sections,
    media,
  },
};
