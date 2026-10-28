// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The module keeps an in-memory copy, so each test gets a fresh import.
async function load() {
  vi.resetModules();
  return import('../../src/lib/session');
}

describe('session', () => {
  beforeEach(() => sessionStorage.clear());

  it('returns the session only for its slug', async () => {
    const { saveSession, getSession } = await load();
    saveSession('marina-lucas', 'tok', 1000);
    expect(getSession('marina-lucas', 2000)?.token).toBe('tok');
    expect(getSession('julia-pedro', 2000)).toBeNull();
  });

  it('survives a reload through sessionStorage', async () => {
    (await load()).saveSession('marina-lucas', 'tok', 1000);
    const fresh = await load();
    expect(fresh.getSession('marina-lucas', 2000)?.token).toBe('tok');
  });

  it('expires after the TTL and clears storage', async () => {
    const { saveSession, getSession, SESSION_TTL_MS } = await load();
    saveSession('marina-lucas', 'tok', 0);
    expect(getSession('marina-lucas', SESSION_TTL_MS)).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('ignores corrupted storage', async () => {
    sessionStorage.setItem('em.session', '{not json');
    expect((await load()).getSession('marina-lucas')).toBeNull();
  });
});
