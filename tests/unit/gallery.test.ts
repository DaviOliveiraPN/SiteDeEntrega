import { describe, expect, it } from 'vitest';
import { downloadAllLabel, filterMedia, typeCounts, zipName } from '../../src/lib/gallery';
import { mockPages } from '../../src/mocks/pages';

const page = mockPages[0].content;

describe('gallery filters', () => {
  it('filters by type and section', () => {
    const photos = filterMedia(page.media, { type: 'photo', sectionId: 'festa' });
    expect(photos.length).toBeGreaterThan(0);
    expect(photos.every((m) => m.type === 'photo' && m.sectionId === 'festa')).toBe(true);
  });

  it('counts per type inside the section', () => {
    const counts = typeCounts(page.media, null);
    expect(counts.all).toBe(page.media.length);
    expect(counts.photo + counts.video).toBe(counts.all);
  });

  it('labels the download button', () => {
    expect(downloadAllLabel({ type: 'all', sectionId: null })).toBe('Baixar tudo');
    expect(downloadAllLabel({ type: 'photo', sectionId: null })).toBe('Baixar as fotos');
    expect(downloadAllLabel({ type: 'photo', sectionId: 'festa' })).toBe('Baixar este momento');
  });

  it('names the zip after slug and filter', () => {
    expect(zipName('marina-lucas', { type: 'all', sectionId: null }, page.sections)).toBe('marina-lucas-tudo.zip');
    expect(zipName('marina-lucas', { type: 'photo', sectionId: 'cerimonia' }, page.sections)).toBe('marina-lucas-cerimonia-fotos.zip');
  });
});
