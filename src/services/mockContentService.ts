import { business } from '../mocks/business';
import { mockPages, type MockPage } from '../mocks/pages';
import { createRateLimiter } from '../mocks/rateLimiter';
import type { AccessResult, PageContent } from '../types';
import { ContentError, type ContentService } from './contentService';

export interface MockOptions {
  pages?: MockPage[];
  /** Simulated network latency in ms. Tests pass `() => 0`. */
  latency?: () => number;
  now?: () => number;
}

const TOKEN_PREFIX = 'mock';

function normalizeCode(code: string): string {
  return code.replace(/[\s-]/g, '').toUpperCase();
}

function isExpired(page: PageContent, now: number): boolean {
  return Date.parse(page.expiresAt) <= now;
}

export function createMockContentService(options: MockOptions = {}): ContentService {
  const pages = options.pages ?? mockPages;
  const latency = options.latency ?? (() => 300 + Math.random() * 500);
  const now = options.now ?? Date.now;
  const limiter = createRateLimiter();

  const delay = <T>(value: () => T): Promise<T> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(value());
        } catch (error) {
          reject(error);
        }
      }, latency());
    });

  return {
    validateCode: (code) =>
      delay((): AccessResult => {
        const t = now();
        if (limiter.isBlocked(t)) return { ok: false, reason: 'rate_limited' };

        const page = pages.find((p) => p.code === normalizeCode(code));
        if (!page) {
          limiter.recordFailure(t);
          return { ok: false, reason: 'invalid' };
        }
        if (isExpired(page.content, t)) return { ok: false, reason: 'expired' };

        const slug = page.content.slug;
        return { ok: true, slug, token: `${TOKEN_PREFIX}.${slug}.${crypto.randomUUID()}` };
      }),

    getPageContent: (slug, token) =>
      delay(() => {
        const page = pages.find((p) => p.content.slug === slug);
        if (!page) throw new ContentError('not_found');
        // The mock keeps no server state, so any token minted for this slug is accepted.
        if (!token.startsWith(`${TOKEN_PREFIX}.${slug}.`)) throw new ContentError('unauthorized');
        if (isExpired(page.content, now())) throw new ContentError('expired');
        return structuredClone(page.content);
      }),

    getBusiness: () => delay(() => structuredClone(business)),
  };
}
