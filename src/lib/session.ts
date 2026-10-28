// Guest session: `{ slug, token, exp }` kept in memory and mirrored to sessionStorage,
// so a refresh keeps access but closing the tab ends it (same behavior the real API will have).

export interface Session {
  slug: string;
  token: string;
  /** Epoch ms. */
  exp: number;
}

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const STORAGE_KEY = 'em.session';

let memory: Session | null = null;

function storage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null; // e.g. Safari private mode with storage blocked
  }
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.slug === 'string' && typeof v.token === 'string' && typeof v.exp === 'number';
}

export function saveSession(slug: string, token: string, now = Date.now()): Session {
  memory = { slug, token, exp: now + SESSION_TTL_MS };
  storage()?.setItem(STORAGE_KEY, JSON.stringify(memory));
  return memory;
}

export function clearSession(): void {
  memory = null;
  storage()?.removeItem(STORAGE_KEY);
}

/** Valid session for this slug, or null. Expired sessions are cleared. */
export function getSession(slug: string, now = Date.now()): Session | null {
  if (!memory) {
    try {
      const parsed: unknown = JSON.parse(storage()?.getItem(STORAGE_KEY) ?? 'null');
      memory = isSession(parsed) ? parsed : null;
    } catch {
      memory = null;
    }
  }
  if (!memory) return null;
  if (memory.exp <= now) {
    clearSession();
    return null;
  }
  return memory.slug === slug ? memory : null;
}
