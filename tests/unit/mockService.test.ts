import { describe, expect, it } from 'vitest';
import { ContentError } from '../../src/services/contentService';
import { createMockContentService } from '../../src/services/mockContentService';

const NOW = Date.parse('2026-10-27T12:00:00Z');

function service(now = () => NOW) {
  return createMockContentService({ latency: () => 0, now });
}

describe('mock content service', () => {
  it('accepts a valid code (case and spaces ignored)', async () => {
    const result = await service().validateCode(' aurora2026k ');
    expect(result).toMatchObject({ ok: true, slug: 'marina-lucas' });
  });

  it('rejects unknown and expired codes', async () => {
    const s = service();
    expect(await s.validateCode('NOPE')).toEqual({ ok: false, reason: 'invalid' });
    expect(await s.validateCode('OUTONO48XZ')).toEqual({ ok: false, reason: 'expired' });
  });

  it('rate-limits after 5 wrong codes in a minute, for 60 s', async () => {
    let now = NOW;
    const s = service(() => now);
    for (let i = 0; i < 5; i++) await s.validateCode('WRONG');
    expect(await s.validateCode('AURORA2026K')).toEqual({ ok: false, reason: 'rate_limited' });
    now += 60_000;
    expect(await s.validateCode('AURORA2026K')).toMatchObject({ ok: true });
  });

  it('returns the page only with a token for that slug', async () => {
    const s = service();
    const result = await s.validateCode('MAREVIVA7Q');
    if (!result.ok) throw new Error('expected ok');
    const page = await s.getPageContent('julia-pedro', result.token);
    expect(page.coupleNames).toBe('Júlia & Pedro');
    await expect(s.getPageContent('marina-lucas', result.token)).rejects.toThrow(ContentError);
  });

  it('builds the fictitious data with the expected volume', async () => {
    const s = service();
    const result = await s.validateCode('AURORA2026K');
    if (!result.ok) throw new Error('expected ok');
    const page = await s.getPageContent('marina-lucas', result.token);
    const photos = page.media.filter((m) => m.type === 'photo');
    expect(page.sections).toHaveLength(4);
    expect(photos.length).toBeGreaterThanOrEqual(55);
    expect(page.media.length - photos.length).toBeGreaterThanOrEqual(18);
    expect(page.media.filter((m) => m.featured)).toHaveLength(6);
    expect(new Set(page.media.map((m) => m.id)).size).toBe(page.media.length);
    for (const id of [...page.heroThumbIds, page.openingVideoId]) expect(page.media.some((m) => m.id === id)).toBe(true);
  });
});
